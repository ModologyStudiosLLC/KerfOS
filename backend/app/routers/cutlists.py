"""
Cut List API Router
Handles cut list generation and optimization
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List, Dict
from app.cutlist_optimizer import optimize_cut_list
from app.models import Cabinet, CabinetComponent, CutList, CutItem
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/api/cutlists", tags=["Cut Lists"])


@router.post("/generate")
async def generate_cut_list(
    request: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Generate optimized cut list from cabinet designs
    
    Expects:
    {
        "cabinets": [
            {
                "id": "cabinet_id",
                "name": "Cabinet Name",
                "width": 36.0,
                "height": 72.0,
                "depth": 24.0,
                "material_id": "1",
                "components": [
                    {
                        "id": "component_id",
                        "name": "Component Name",
                        "width": 24.0,
                        "height": 72.0,
                        "quantity": 2,
                        "material_id": "1"
                    }
                ]
            }
        ],
        "sheet_size": "4x8"  # Optional: 4x8, 4x4, 2x4, euro
    }
    
    Returns:
    {
        "cut_list": [...],  # Array of sheets with cuts
        "waste_percentage": 12.5,
        "total_sheets": 3,
        "used_area": 864.0,
        "total_area": 9216.0,
        "cuts_per_sheet": {"1": 4, "2": 3, "3": 2}
    }
    """
    
    try:
        # Validate request
        if "cabinets" not in request or not isinstance(request["cabinets"], list):
            raise HTTPException(status_code=400, detail="cabinets array is required")
        
        if len(request["cabinets"]) == 0:
            raise HTTPException(status_code=400, detail="At least one cabinet is required")
        
        # Get sheet size (default to 4x8)
        sheet_size = request.get("sheet_size", "4x8")
        
        # Flatten components from all cabinets
        all_components = []
        for cabinet in request["cabinets"]:
            # Validate cabinet has required fields
            if not all(key in cabinet for key in ["id", "width", "height", "depth", "components"]):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cabinet {cabinet.get('id', 'unknown')} is missing required fields"
                )
            
            # Add cabinet components
            for component in cabinet.get("components", []):
                if not all(key in component for key in ["id", "name", "width", "height", "quantity"]):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Component {component.get('id', 'unknown')} is missing required fields"
                    )
                
                all_components.append(component)
        
        # Generate cut list
        result = optimize_cut_list(all_components, sheet_size=sheet_size)
        
        # Save to database
        new_cut_list = CutList(
            total_sheets=result["total_sheets"],
            waste_percentage=result["waste_percentage"],
            sheet_size=sheet_size
        )
        db.add(new_cut_list)
        db.commit()
        db.refresh(new_cut_list)
        
        # Save cut items to database
        for sheet_data in result["cut_list"]:
            for cut_data in sheet_data["cuts"]:
                new_cut_item = CutItem(
                    cut_list_id=new_cut_list.id,
                    sheet_number=sheet_data["sheet_number"],
                    x_position=cut_data["x"],
                    y_position=cut_data["y"],
                    width=cut_data["width"],
                    height=cut_data["height"],
                    part_name=cut_data["part_name"],
                    part_id=cut_data["part_id"]
                )
                db.add(new_cut_item)
        
        db.commit()
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Error generating cut list: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate cut list")


@router.get("/history", response_model=List[Dict])
async def get_cut_list_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get history of generated cut lists
    """
    
    cut_lists = db.query(CutList).order_by(
        CutList.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": cl.id,
            "total_sheets": cl.total_sheets,
            "waste_percentage": cl.waste_percentage,
            "sheet_size": cl.sheet_size,
            "created_at": cl.created_at.isoformat()
        }
        for cl in cut_lists
    ]


@router.get("/{cut_list_id}")
async def get_cut_list(
    cut_list_id: int,
    db: Session = Depends(get_db)
):
    """
    Get specific cut list with all cuts
    """
    
    cut_list = db.query(CutList).filter(CutList.id == cut_list_id).first()
    
    if not cut_list:
        raise HTTPException(status_code=404, detail="Cut list not found")
    
    # Get all cut items for this cut list
    cut_items = db.query(CutItem).filter(
        CutItem.cut_list_id == cut_list_id
    ).all()
    
    # Group cuts by sheet number
    sheets = {}
    for item in cut_items:
        if item.sheet_number not in sheets:
            sheets[item.sheet_number] = []
        
        sheets[item.sheet_number].append({
            "x": item.x_position,
            "y": item.y_position,
            "width": item.width,
            "height": item.height,
            "part_name": item.part_name,
            "part_id": item.part_id
        })
    
    # Convert to array format
    cut_list_array = [
        {
            "sheet_number": sheet_num,
            "width": 96,  # TODO: Get from sheet_size
            "height": 96,
            "cuts": cuts
        }
        for sheet_num, cuts in sheets.items()
    ]
    
    return {
        "id": cut_list.id,
        "total_sheets": cut_list.total_sheets,
        "waste_percentage": cut_list.waste_percentage,
        "sheet_size": cut_list.sheet_size,
        "created_at": cut_list.created_at.isoformat(),
        "cut_list": cut_list_array
    }


@router.delete("/{cut_list_id}")
async def delete_cut_list(
    cut_list_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a cut list (and all associated cut items)
    """
    
    cut_list = db.query(CutList).filter(CutList.id == cut_list_id).first()
    
    if not cut_list:
        raise HTTPException(status_code=404, detail="Cut list not found")
    
    # Delete all cut items for this cut list
    db.query(CutItem).filter(CutItem.cut_list_id == cut_list_id).delete()
    
    # Delete the cut list itself
    db.delete(cut_list)
    db.commit()
    
    return {"message": "Cut list deleted successfully"}
