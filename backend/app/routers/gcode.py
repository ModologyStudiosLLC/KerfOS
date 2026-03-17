"""
G-code Export Router for CNC Machines
Supports GRBL, ShopBot, Shapeoko, X-Carve
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import json

from app.database import get_db
from app.models import Project, OptimizationResult, User
from app.routers.auth import get_current_user, get_current_user_optional
from app.gcode_generator import GCodeGenerator, MACHINE_PROFILES

router = APIRouter(prefix="/api/gcode", tags=["gcode"])

# Pydantic schemas
class GCodeSettings(BaseModel):
    machine_type: str = "grbl"
    feed_rate: int = 120
    plunge_rate: int = 30
    spindle_speed: int = 18000
    safe_height: float = 0.5
    cut_depth: float = 0.25
    tabs_enabled: bool = True
    tab_width: float = 0.5
    tab_height: float = 0.125
    tab_spacing: float = 6.0
    lead_in_distance: float = 0.25
    units: str = "inches"  # inches or mm
    multiple_passes: bool = True
    drilling_enabled: bool = False
    drill_positions: List[dict] = []  # [{"x": 1.0, "y": 2.0, "depth": 0.75}]

class GCodeExportRequest(BaseModel):
    project_id: int
    settings: GCodeSettings
    sheet_indices: List[int] = []  # Empty = all sheets


@router.post("/export")
async def export_gcode(
    request: GCodeExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """
    Export G-code for a project's optimized layout.
    
    Supports multiple CNC formats:
    - GRBL / Generic G-code
    - ShopBot SBP
    - Shapeoko (Carbide Motion)
    - X-Carve / Easel
    """
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if current_user and project.owner_id != current_user.id:
        if not project.is_public:
            share = [s for s in project.shares if s.user_id == current_user.id]
            if not share:
                raise HTTPException(status_code=403, detail="Access denied")
    elif not current_user and not project.is_public:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get latest optimization result
    result = db.query(OptimizationResult).filter(
        OptimizationResult.project_id == request.project_id
    ).order_by(OptimizationResult.created_at.desc()).first()
    
    if not result:
        raise HTTPException(status_code=400, detail="No optimization found. Run optimization first.")
    
    layout_data = json.loads(result.layout_data)
    
    # Create generator with settings
    generator = GCodeGenerator(
        machine_type=request.settings.machine_type,
        feed_rate=request.settings.feed_rate,
        plunge_rate=request.settings.plunge_rate,
        spindle_speed=request.settings.spindle_speed,
        safe_height=request.settings.safe_height,
        cut_depth=request.settings.cut_depth,
        tabs_enabled=request.settings.tabs_enabled,
        tab_width=request.settings.tab_width,
        tab_height=request.settings.tab_height,
        tab_spacing=request.settings.tab_spacing,
        lead_in_distance=request.settings.lead_in_distance,
        units=request.settings.units
    )
    
    gcode = generator.generate(layout_data, request.sheet_indices)
    
    # Determine file extension
    profile = MACHINE_PROFILES.get(request.settings.machine_type, MACHINE_PROFILES["grbl"])
    extension = profile.get("file_extension", ".nc")
    
    return PlainTextResponse(
        content=gcode,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename={project.name.replace(' ', '_')}_gcode{extension}"
        }
    )


@router.get("/machines")
async def list_machines():
    """List supported CNC machine profiles"""
    return {
        "machines": [
            {
                "id": "grbl",
                "name": "GRBL / Generic",
                "description": "Standard G-code for GRBL controllers (Most CNC routers)",
                "file_extension": ".nc",
                "default_feed": 120,
                "default_plunge": 30,
                "default_spindle": 18000
            },
            {
                "id": "shopbot",
                "name": "ShopBot",
                "description": "ShopBot SBP format for ShopBot CNC routers",
                "file_extension": ".sbp",
                "default_feed": 180,
                "default_plunge": 60,
                "default_spindle": 12000
            },
            {
                "id": "shapeoko",
                "name": "Shapeoko",
                "description": "Optimized for Shapeoko/Carbide Motion",
                "file_extension": ".nc",
                "default_feed": 100,
                "default_plunge": 40,
                "default_spindle": 18000
            },
            {
                "id": "xcarve",
                "name": "X-Carve / Easel",
                "description": "Easel-compatible G-code for Inventables X-Carve",
                "file_extension": ".nc",
                "default_feed": 80,
                "default_plunge": 30,
                "default_spindle": 12000
            }
        ]
    }


@router.post("/preview")
async def preview_gcode(
    request: GCodeExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Preview G-code output (first 100 lines) with time estimate"""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if current_user and project.owner_id != current_user.id:
        if not project.is_public:
            share = [s for s in project.shares if s.user_id == current_user.id]
            if not share:
                raise HTTPException(status_code=403, detail="Access denied")
    
    result = db.query(OptimizationResult).filter(
        OptimizationResult.project_id == request.project_id
    ).order_by(OptimizationResult.created_at.desc()).first()
    
    if not result:
        raise HTTPException(status_code=400, detail="No optimization found")
    
    layout_data = json.loads(result.layout_data)
    
    generator = GCodeGenerator(
        machine_type=request.settings.machine_type,
        feed_rate=request.settings.feed_rate,
        plunge_rate=request.settings.plunge_rate,
        spindle_speed=request.settings.spindle_speed,
        safe_height=request.settings.safe_height,
        cut_depth=request.settings.cut_depth
    )
    
    gcode = generator.generate(layout_data, request.sheet_indices)
    preview_lines = gcode.split('\n')[:100]
    
    return {
        "preview": '\n'.join(preview_lines),
        "total_lines": len(gcode.split('\n')),
        "estimated_time_minutes": generator.estimate_time(layout_data),
        "total_sheets": len(layout_data)
    }


@router.post("/estimate-time")
async def estimate_cutting_time(
    request: GCodeExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Estimate cutting time for a project"""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    result = db.query(OptimizationResult).filter(
        OptimizationResult.project_id == request.project_id
    ).order_by(OptimizationResult.created_at.desc()).first()
    
    if not result:
        raise HTTPException(status_code=400, detail="No optimization found")
    
    layout_data = json.loads(result.layout_data)
    
    generator = GCodeGenerator(
        feed_rate=request.settings.feed_rate,
        cut_depth=request.settings.cut_depth
    )
    
    return {
        "estimated_time_minutes": generator.estimate_time(layout_data),
        "total_parts": sum(len(sheet.get('parts', [])) for sheet in layout_data),
        "total_sheets": len(layout_data),
        "feed_rate": request.settings.feed_rate
    }
