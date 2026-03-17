"""Scrap Tracker API Router

Endpoints for managing scrap pieces from cut operations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.scrap_tracker import (
    ScrapTracker, ScrapPiece, ScrapSuggestion,
    process_cutlist_for_scraps, scrap_to_dict, suggestion_to_dict,
    SCRAP_USE_SUGGESTIONS
)

router = APIRouter(
    prefix="/api/scrap",
    tags=["scrap-tracker"]
)


# Pydantic models for API
class ScrapPieceCreate(BaseModel):
    width: float
    height: float
    thickness: float
    material_id: str
    material_name: str
    sheet_source: int = 0
    x_position: float = 0.0
    y_position: float = 0.0
    grain_direction: Optional[str] = None
    notes: str = ""
    project_id: Optional[int] = None


class ScrapPieceResponse(BaseModel):
    id: str
    width: float
    height: float
    thickness: float
    material_id: str
    material_name: str
    sheet_source: int
    x_position: float
    y_position: float
    grain_direction: Optional[str]
    notes: str
    created_at: Optional[str]
    is_usable: bool
    area_sqin: float
    area_sqft: float


class ScrapSuggestionResponse(BaseModel):
    scrap_id: str
    project_type: str
    description: str
    max_width: float
    max_height: float
    priority: int


class FindScrapRequest(BaseModel):
    needed_width: float
    needed_height: float
    material_id: Optional[str] = None
    thickness: Optional[float] = None


class ProcessCutlistRequest(BaseModel):
    cutlist: dict
    material_id: str
    material_name: str
    thickness: float
    project_id: Optional[int] = None
    min_usable_size: float = 4.0


# In-memory storage for scrap pieces (in production, use database)
# This will be replaced with database storage in a future update
_scrap_storage: dict = {}  # project_id -> ScrapTracker


def get_tracker(project_id: Optional[int] = None) -> ScrapTracker:
    """Get or create a tracker for a project"""
    key = str(project_id) if project_id else 'default'
    if key not in _scrap_storage:
        _scrap_storage[key] = ScrapTracker()
    return _scrap_storage[key]


@router.get("/suggestions")
async def get_scrap_use_suggestions():
    """Get all available scrap use suggestion types"""
    return {
        "suggestions": SCRAP_USE_SUGGESTIONS,
        "min_sizes": {
            "drawer_bottom": {"min_width": 12, "min_height": 12},
            "small_shelf": {"min_width": 8, "min_height": 24},
            "cabinet_back": {"min_width": 24, "min_height": 30},
            "toe_kick": {"min_width": 4, "min_height": 24},
            "drawer_dividers": {"min_width": 3, "min_height": 12}
        }
    }


@router.post("/process-cutlist")
async def process_cutlist(request: ProcessCutlistRequest):
    """
    Process a cutlist to extract scrap pieces.
    
    This analyzes the cut layout and identifies usable leftover pieces.
    """
    try:
        scraps = process_cutlist_for_scraps(
            cutlist_result=request.cutlist,
            material_id=request.material_id,
            material_name=request.material_name,
            thickness=request.thickness,
            project_id=request.project_id,
            min_usable_size=request.min_usable_size
        )
        
        # Store in tracker
        tracker = get_tracker(request.project_id)
        tracker.scraps = scraps
        
        # Get suggestions for each scrap
        all_suggestions = []
        for scrap in scraps:
            suggestions = tracker.get_suggestions_for_scrap(scrap)
            all_suggestions.extend([suggestion_to_dict(s) for s in suggestions])
        
        return {
            "status": "success",
            "scraps_found": len(scraps),
            "total_area_sqft": sum(s.area_sqft for s in scraps),
            "scraps": [scrap_to_dict(s) for s in scraps],
            "suggestions": all_suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process cutlist: {str(e)}")


@router.get("/list")
async def list_scraps(
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    material_id: Optional[str] = Query(None, description="Filter by material ID"),
    usable_only: bool = Query(True, description="Only show usable scraps")
):
    """List all scrap pieces for a project"""
    tracker = get_tracker(project_id)
    
    scraps = tracker.scraps
    if usable_only:
        scraps = [s for s in scraps if s.is_usable]
    if material_id:
        scraps = [s for s in scraps if s.material_id == material_id]
    
    return {
        "total": len(scraps),
        "total_area_sqft": tracker.get_total_scrap_area(material_id),
        "scraps": [scrap_to_dict(s) for s in scraps]
    }


@router.get("/summary")
async def get_scrap_summary(
    project_id: Optional[int] = Query(None, description="Project ID for summary")
):
    """Get a summary of scrap pieces for a project"""
    tracker = get_tracker(project_id)
    summary = tracker.get_scrap_summary()
    
    # Convert scraps in by_material to dicts
    for material_id in summary['by_material']:
        summary['by_material'][material_id]['pieces'] = [
            scrap_to_dict(s) for s in summary['by_material'][material_id]['pieces']
        ]
    
    return summary


@router.post("/find")
async def find_scrap_for_piece(request: FindScrapRequest):
    """
    Find scrap pieces that can fit a needed piece.
    
    Returns matching scraps sorted by best fit (least waste).
    """
    tracker = get_tracker(request.project_id if hasattr(request, 'project_id') else None)
    
    matching = tracker.find_scrap_for_piece(
        needed_width=request.needed_width,
        needed_height=request.needed_height,
        material_id=request.material_id,
        thickness=request.thickness
    )
    
    results = []
    for scrap, needs_rotation in matching:
        results.append({
            "scrap": scrap_to_dict(scrap),
            "needs_rotation": needs_rotation,
            "waste_if_used": {
                "area_sqft": scrap.area_sqft - (request.needed_width * request.needed_height / 144),
                "percentage": ((scrap.area - request.needed_width * request.needed_height) / scrap.area) * 100
            }
        })
    
    return {
        "needed_size": {
            "width": request.needed_width,
            "height": request.needed_height
        },
        "matches_found": len(results),
        "matches": results
    }


@router.get("/{scrap_id}/suggestions")
async def get_suggestions_for_scrap(
    scrap_id: str,
    project_id: Optional[int] = Query(None, description="Project ID")
):
    """Get suggested uses for a specific scrap piece"""
    tracker = get_tracker(project_id)
    
    # Find the scrap
    scrap = None
    for s in tracker.scraps:
        if s.id == scrap_id:
            scrap = s
            break
    
    if not scrap:
        raise HTTPException(status_code=404, detail="Scrap piece not found")
    
    suggestions = tracker.get_suggestions_for_scrap(scrap)
    
    return {
        "scrap": scrap_to_dict(scrap),
        "suggestions": [suggestion_to_dict(s) for s in suggestions]
    }


@router.post("/add")
async def add_scrap_piece(request: ScrapPieceCreate):
    """Manually add a scrap piece"""
    tracker = get_tracker(request.project_id)
    
    scrap = ScrapPiece(
        id=f"manual_{datetime.utcnow().timestamp()}",
        width=request.width,
        height=request.height,
        thickness=request.thickness,
        material_id=request.material_id,
        material_name=request.material_name,
        sheet_source=request.sheet_source,
        x_position=request.x_position,
        y_position=request.y_position,
        grain_direction=request.grain_direction,
        notes=request.notes,
        project_id=request.project_id
    )
    
    tracker.scraps.append(scrap)
    
    return {
        "status": "success",
        "scrap": scrap_to_dict(scrap)
    }


@router.put("/{scrap_id}/use")
async def mark_scrap_used(
    scrap_id: str,
    project_id: Optional[int] = Query(None, description="Project ID")
):
    """Mark a scrap piece as used (no longer available)"""
    tracker = get_tracker(project_id)
    
    if tracker.mark_scrap_used(scrap_id):
        return {"status": "success", "message": "Scrap marked as used"}
    else:
        raise HTTPException(status_code=404, detail="Scrap piece not found")


@router.delete("/{scrap_id}")
async def delete_scrap(
    scrap_id: str,
    project_id: Optional[int] = Query(None, description="Project ID")
):
    """Delete a scrap piece from tracking"""
    tracker = get_tracker(project_id)
    
    if tracker.remove_scrap(scrap_id):
        return {"status": "success", "message": "Scrap removed"}
    else:
        raise HTTPException(status_code=404, detail="Scrap piece not found")
