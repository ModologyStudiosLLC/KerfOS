# Simplified cut list generation for KerfOs SaaS

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import uuid

from database import get_db
from models import Project, Cabinet
from auth import get_current_user
from usage import log_usage_event, check_limit

router = APIRouter(prefix="/api/cutlists", tags=["Cut Lists"])


def optimize_cut_list_simple(cabinets: List[Dict[str, Any]], sheet_size: str = "4x8") -> Dict[str, Any]:
    """
    Simple cut list optimization (placeholder - replace with real algorithm)
    
    Args:
        cabinets: List of cabinet dictionaries with width, height, depth
        sheet_size: Sheet size (4x8, 4x4, 2x4, euro)
    
    Returns:
        Optimized cut list with sheets and cuts
    """
    # This is a placeholder - in reality, use the full optimization algorithm
    # from app.cutlist_optimizer
    
    sheets = []
    total_material_cost = 0
    
    for i, cabinet in enumerate(cabinets):
        width = cabinet.get("width", 24.0)
        height = cabinet.get("height", 72.0)
        depth = cabinet.get("depth", 24.0)
        
        # Simple calculation for demonstration
        sheet = {
            "sheet_id": f"sheet_{i+1}",
            "sheet_size": sheet_size,
            "material": cabinet.get("material", "3/4\" Plywood"),
            "cuts": [
                {
                    "part_id": f"part_{i}_1",
                    "name": f"{cabinet.get('name', 'Cabinet')} - Side",
                    "width": depth,
                    "height": height,
                    "quantity": 2,
                    "rotation": 0
                },
                {
                    "part_id": f"part_{i}_2",
                    "name": f"{cabinet.get('name', 'Cabinet')} - Top/Bottom",
                    "width": width,
                    "height": depth,
                    "quantity": 2,
                    "rotation": 90
                }
            ],
            "waste_percentage": 15.0,
            "material_cost": 75.0
        }
        sheets.append(sheet)
        total_material_cost += 75.0
    
    return {
        "sheets": sheets,
        "total_sheets": len(sheets),
        "total_parts": len(sheets) * 4,
        "total_material_cost": total_material_cost,
        "waste_percentage": 15.0,
        "optimization_time_ms": 125
    }


@router.post("/generate")
async def generate_cut_list(
    request: Dict[str, Any],
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate optimized cut list from cabinet designs
    
    Request format:
    {
        "project_id": "uuid",  # Optional: link to existing project
        "cabinets": [
            {
                "name": "Base Cabinet",
                "width": 36.0,
                "height": 34.5,
                "depth": 24.0,
                "material": "3/4\" Plywood"
            }
        ],
        "sheet_size": "4x8"  # Optional: 4x8, 4x4, 2x4, euro
    }
    """
    # Check usage limit
    limit_check = check_limit(db, current_user, "cut_list")
    if not limit_check["allowed"]:
        raise HTTPException(
            status_code=403,
            detail=f"Cut list limit reached ({limit_check['limit']}/month). Upgrade to create more."
        )
    
    cabinets = request.get("cabinets", [])
    sheet_size = request.get("sheet_size", "4x8")
    project_id = request.get("project_id")
    
    if not cabinets:
        raise HTTPException(status_code=400, detail="No cabinets provided")
    
    # Validate cabinets
    for cabinet in cabinets:
        if not all(k in cabinet for k in ["width", "height", "depth"]):
            raise HTTPException(status_code=400, detail="Cabinet missing required dimensions")
    
    # Generate cut list
    try:
        result = optimize_cut_list_simple(cabinets, sheet_size)
        
        # Log usage
        log_usage_event(db, str(current_user.id), "generate", "cut_list")
        
        return {
            "success": True,
            "cut_list": result,
            "usage": {
                "remaining": limit_check["remaining"] - 1,
                "limit": limit_check["limit"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cut list generation failed: {str(e)}")


@router.post("/generate-from-project/{project_id}")
async def generate_cut_list_from_project(
    project_id: str,
    sheet_size: str = "4x8",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate cut list from an existing project"""
    # Check usage limit
    limit_check = check_limit(db, current_user, "cut_list")
    if not limit_check["allowed"]:
        raise HTTPException(
            status_code=403,
            detail=f"Cut list limit reached ({limit_check['limit']}/month). Upgrade to create more."
        )
    
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID")
    
    # Get project
    project = db.query(Project).filter(
        Project.id == pid,
        Project.user_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Convert cabinets to format for optimizer
    cabinets = []
    for cabinet in project.cabinets:
        cabinets.append({
            "name": cabinet.name,
            "width": float(cabinet.width),
            "height": float(cabinet.height),
            "depth": float(cabinet.depth),
            "material": cabinet.material
        })
    
    if not cabinets:
        raise HTTPException(status_code=400, detail="Project has no cabinets")
    
    # Generate cut list
    try:
        result = optimize_cut_list_simple(cabinets, sheet_size)
        
        # Log usage
        log_usage_event(db, str(current_user.id), "generate", "cut_list")
        
        return {
            "success": True,
            "cut_list": result,
            "project": {
                "id": str(project.id),
                "name": project.name
            },
            "usage": {
                "remaining": limit_check["remaining"] - 1,
                "limit": limit_check["limit"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cut list generation failed: {str(e)}")
