"""
Edge Banding Router - Edge banding optimization and calculations
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from enum import Enum

from app.edge_banding import (
    EdgeBandingOptimizer,
    EdgeBandingType,
    EdgePosition,
    EdgeBandingSpec,
    calculate_edge_banding,
    get_edge_banding_summary
)

router = APIRouter(prefix="/edge-banding", tags=["edge-banding"])


class BandingType(str, Enum):
    WOOD_VENEER = "wood_veneer"
    PVC = "pvc"
    MELAMINE = "melamine"
    ABS = "abs"
    METAL = "metal"
    NONE = "none"


class ComponentInput(BaseModel):
    id: str
    name: str
    width: float
    height: float
    edges: List[str]  # top, bottom, left, right, front, all
    visible_edges: bool = True
    priority: int = 1
    quantity: int = 1


class EdgeBandingRequest(BaseModel):
    components: List[ComponentInput]
    banding_type: BandingType = BandingType.WOOD_VENEER
    thickness: float = 1.0
    waste_factor: float = 1.1


class QuickCalcRequest(BaseModel):
    width: float
    height: float
    edges: List[str]
    banding_type: BandingType = BandingType.WOOD_VENEER
    thickness: float = 1.0


@router.post("/calculate")
async def calculate_edge_banding_endpoint(request: EdgeBandingRequest):
    """
    Calculate edge banding requirements for a list of components.
    
    Returns:
    - Total linear feet needed
    - Total estimated cost
    - Purchase list with roll sizes
    - Breakdown by component
    """
    try:
        components = []
        for comp in request.components:
            # Expand by quantity
            for i in range(comp.quantity):
                components.append({
                    "id": f"{comp.id}_{i}" if comp.quantity > 1 else comp.id,
                    "name": comp.name,
                    "width": comp.width,
                    "height": comp.height,
                    "edges": comp.edges,
                    "visible_edges": comp.visible_edges,
                    "priority": comp.priority
                })
        
        result = calculate_edge_banding(
            components=components,
            default_banding_type=request.banding_type.value,
            default_thickness=request.thickness,
            waste_factor=request.waste_factor
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Edge banding calculation failed: {str(e)}")


@router.post("/quick-calc")
async def quick_calc_endpoint(request: QuickCalcRequest):
    """
    Quick edge banding calculation for a single component.
    """
    try:
        result = get_edge_banding_summary(
            width=request.width,
            height=request.height,
            edges=request.edges,
            banding_type=request.banding_type.value,
            thickness=request.thickness
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quick calculation failed: {str(e)}")


@router.get("/banding-types")
async def get_banding_types():
    """
    Get all available edge banding types with cost estimates.
    """
    return {
        "banding_types": [
            {
                "id": "wood_veneer",
                "name": "Wood Veneer",
                "description": "Real wood veneer, stainable and natural look",
                "cost_per_foot": 0.15,
                "best_for": "Solid wood, stained finishes"
            },
            {
                "id": "pvc",
                "name": "PVC",
                "description": "Durable plastic, available in many colors",
                "cost_per_foot": 0.08,
                "best_for": "Painted cabinets, high traffic areas"
            },
            {
                "id": "melamine",
                "name": "Melamine",
                "description": "Matches melamine surfaces, economical",
                "cost_per_foot": 0.05,
                "best_for": "Melamine panels, utility cabinets"
            },
            {
                "id": "abs",
                "name": "ABS",
                "description": "Impact resistant, premium plastic",
                "cost_per_foot": 0.12,
                "best_for": "Commercial applications"
            },
            {
                "id": "metal",
                "name": "Metal",
                "description": "Aluminum or steel edging",
                "cost_per_foot": 0.35,
                "best_for": "Industrial, modern designs"
            }
        ]
    }


@router.get("/thicknesses")
async def get_thicknesses():
    """
    Get common edge banding thicknesses with recommendations.
    """
    return {
        "thicknesses": [
            {
                "mm": 0.5,
                "inches": "0.020",
                "description": "Thin, flexible",
                "best_for": "Curved edges, tight corners"
            },
            {
                "mm": 1.0,
                "inches": "0.039",
                "description": "Standard thickness",
                "best_for": "Most cabinet applications"
            },
            {
                "mm": 2.0,
                "inches": "0.079",
                "description": "Thick, durable",
                "best_for": "Heavy use, commercial cabinets"
            },
            {
                "mm": 3.0,
                "inches": "0.118",
                "description": "Extra thick",
                "best_for": "Industrial, heavy-duty applications"
            }
        ]
    }


@router.get("/roll-sizes")
async def get_roll_sizes():
    """
    Get standard edge banding roll sizes.
    """
    return {
        "roll_sizes": [
            {"size": "small", "length_feet": 25, "best_for": "Small projects, single cabinet"},
            {"size": "medium", "length_feet": 50, "best_for": "Multiple cabinets"},
            {"size": "large", "length_feet": 250, "best_for": "Professional shops, bulk projects"}
        ]
    }


@router.get("/edge-positions")
async def get_edge_positions():
    """
    Get edge position options with descriptions.
    """
    return {
        "positions": [
            {"id": "top", "description": "Top horizontal edge"},
            {"id": "bottom", "description": "Bottom horizontal edge"},
            {"id": "left", "description": "Left vertical edge"},
            {"id": "right", "description": "Right vertical edge"},
            {"id": "front", "description": "Front visible edge (most common)"},
            {"id": "all", "description": "All four edges"}
        ]
    }
