"""
Hardware Recommendations Router - AI-powered hardware suggestions based on cabinet design
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

from app.hardware_recommendations import (
    HardwareRecommendationEngine,
    get_hardware_recommendations
)

router = APIRouter(prefix="/hardware-recommendations", tags=["hardware-recommendations"])


class CabinetType(str, Enum):
    BASE = "base"
    WALL = "wall"
    TALL = "tall"
    CORNER = "corner"
    VANITY = "vanity"
    PANTRY = "pantry"
    ENTERTAINMENT = "entertainment"
    GARAGE = "garage"


class DoorType(str, Enum):
    SINGLE_DOOR = "single_door"
    DOUBLE_DOOR = "double_door"
    DRAWER_BANK = "drawer_bank"
    DOOR_DRAWER = "door_drawer"
    OPEN_SHELF = "open_shelf"
    LAZY_SUSAN = "lazy_susan"
    NONE = "none"


class RecommendationRequest(BaseModel):
    width: float
    height: float
    depth: float
    cabinet_type: CabinetType = CabinetType.BASE
    door_type: DoorType = DoorType.SINGLE_DOOR
    num_doors: int = 1
    num_drawers: int = 0
    num_shelves: int = 2
    has_soft_close: bool = True
    has_face_frame: bool = True
    material_thickness: float = 0.75


@router.post("/recommend")
async def get_recommendations(request: RecommendationRequest):
    """
    Get hardware recommendations based on cabinet design parameters.
    
    Analyzes the cabinet configuration and suggests:
    - Hinges (type and quantity based on door size)
    - Drawer slides (length and type based on depth)
    - Pulls and knobs
    - Shelf pins
    - Fasteners
    - Optional hardware (lazy susan, toe kick, anti-tip, etc.)
    
    Returns recommendations with supplier links and price estimates.
    """
    try:
        result = get_hardware_recommendations(
            width=request.width,
            height=request.height,
            depth=request.depth,
            cabinet_type=request.cabinet_type.value,
            door_type=request.door_type.value,
            num_doors=request.num_doors,
            num_drawers=request.num_drawers,
            num_shelves=request.num_shelves,
            has_soft_close=request.has_soft_close,
            has_face_frame=request.has_face_frame
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {str(e)}")


@router.get("/cabinet-types")
async def get_cabinet_types():
    """
    Get all supported cabinet types with descriptions.
    """
    return {
        "cabinet_types": [
            {"id": "base", "name": "Base Cabinet", "height_range": "34-36\"", "description": "Floor cabinets under countertops"},
            {"id": "wall", "name": "Wall Cabinet", "height_range": "12-42\"", "description": "Upper cabinets mounted on wall"},
            {"id": "tall", "name": "Tall Cabinet", "height_range": "84-96\"", "description": "Full-height pantry/utility cabinets"},
            {"id": "corner", "name": "Corner Cabinet", "description": "Corner storage with lazy susan or diagonal"},
            {"id": "vanity", "name": "Vanity Cabinet", "description": "Bathroom cabinets with sink"},
            {"id": "pantry", "name": "Pantry Cabinet", "description": "Kitchen storage cabinets"},
            {"id": "entertainment", "name": "Entertainment Center", "description": "Media console cabinets"},
            {"id": "garage", "name": "Garage Cabinet", "description": "Heavy-duty utility cabinets"}
        ]
    }


@router.get("/door-types")
async def get_door_types():
    """
    Get all supported door configurations.
    """
    return {
        "door_types": [
            {"id": "single_door", "name": "Single Door", "description": "One door covering opening"},
            {"id": "double_door", "name": "Double Door", "description": "Two doors meeting in center"},
            {"id": "drawer_bank", "name": "Drawer Bank", "description": "Multiple drawers stacked"},
            {"id": "door_drawer", "name": "Door Over Drawer", "description": "Door on top, drawer below"},
            {"id": "open_shelf", "name": "Open Shelf", "description": "No doors, open storage"},
            {"id": "lazy_susan", "name": "Lazy Susan", "description": "Rotating corner shelves"},
            {"id": "none", "name": "No Door", "description": "No door or drawer hardware needed"}
        ]
    }


@router.get("/hinge-guide")
async def get_hinge_guide():
    """
    Get guide for selecting hinges based on door height.
    """
    return {
        "hinge_guide": [
            {
                "door_height_range": "Up to 30\"",
                "hinges_per_door": 2,
                "note": "Standard for most wall cabinets"
            },
            {
                "door_height_range": "30\" to 40\"",
                "hinges_per_door": 3,
                "note": "Taller doors need extra support"
            },
            {
                "door_height_range": "Over 40\"",
                "hinges_per_door": 4,
                "note": "Full-height pantry doors"
            }
        ],
        "hinge_types": [
            {
                "type": "overlay_standard",
                "overlay": "0.5\" - 0.75\"",
                "best_for": "Face frame cabinets"
            },
            {
                "type": "overlay_full",
                "overlay": "0.625\" - 0.75\"",
                "best_for": "Frameless cabinets"
            },
            {
                "type": "inset",
                "overlay": "N/A",
                "best_for": "Inset door style"
            },
            {
                "type": "170_degree",
                "opening_angle": "170°",
                "best_for": "Corner cabinets, lazy susan"
            }
        ]
    }


@router.get("/slide-guide")
async def get_slide_guide():
    """
    Get guide for selecting drawer slides based on cabinet depth.
    """
    return {
        "slide_lengths": [
            {"length": "12\"", "best_for": "Shallow drawers, 12\" depth"},
            {"length": "14\"", "best_for": "Standard base, 15\" depth"},
            {"length": "16\"", "best_for": "Base cabinets, 18\" depth"},
            {"length": "18\"", "best_for": "Standard base, 18-21\" depth"},
            {"length": "20\"", "best_for": "Deep cabinets, 21\" depth"},
            {"length": "21\"", "best_for": "Deep cabinets, 22\" depth"},
            {"length": "22\"", "best_for": "Full depth base, 24\" depth"},
            {"length": "24\"", "best_for": "Maximum extension, 24\" depth"}
        ],
        "slide_types": [
            {
                "type": "full_extension",
                "extension": "100%",
                "best_for": "Full access to drawer contents",
                "price_range": "$8-25 each"
            },
            {
                "type": "3_4_extension",
                "extension": "75%",
                "best_for": "Budget-friendly, partial access",
                "price_range": "$5-15 each"
            },
            {
                "type": "under_mount",
                "extension": "100%",
                "best_for": "Premium look, hidden slides",
                "price_range": "$15-40 each"
            }
        ]
    }


@router.get("/priority-levels")
async def get_priority_levels():
    """
    Get hardware recommendation priority levels.
    """
    return {
        "priority_levels": [
            {"level": 1, "name": "Essential", "description": "Required for cabinet assembly"},
            {"level": 2, "name": "Recommended", "description": "Important for functionality"},
            {"level": 3, "name": "Optional", "description": "Nice to have extras"}
        ]
    }
