"""
Advanced Nesting Router - Non-guillotine true shape nesting algorithms
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum

from app.advanced_nesting import (
    AdvancedNester,
    NestingAlgorithm,
    nest_parts
)

router = APIRouter(prefix="/advanced-nesting", tags=["advanced-nesting"])


class AlgorithmType(str, Enum):
    BOTTOM_LEFT = "bottom_left"
    NFDH = "nfdh"
    FFDH = "ffdh"
    BFDH = "bfdh"


class PartInput(BaseModel):
    id: str
    name: str
    width: float
    height: float
    quantity: int = 1
    material_id: Optional[str] = None


class NestingRequest(BaseModel):
    parts: List[PartInput]
    sheet_width: float = 48.0
    sheet_height: float = 96.0
    algorithm: AlgorithmType = AlgorithmType.BOTTOM_LEFT
    kerf_width: float = 0.125
    part_spacing: float = 0.25
    allow_rotation: bool = True


@router.post("/nest")
async def nest_parts_endpoint(request: NestingRequest):
    """
    Nest rectangular parts using the selected algorithm.
    
    Supports multiple algorithms:
    - bottom_left: Places parts at lowest, leftmost valid position
    - nfdh: Next Fit Decreasing Height - parts sorted by height
    - ffdh: First Fit Decreasing Height - first level where part fits
    - bfdh: Best Fit Decreasing Height - level with least remaining width
    
    Returns optimized layout with positions on sheets.
    """
    try:
        parts = [p.dict() for p in request.parts]
        
        result = nest_parts(
            parts=parts,
            sheet_size=(request.sheet_width, request.sheet_height),
            algorithm=request.algorithm.value,
            kerf_width=request.kerf_width,
            part_spacing=request.part_spacing,
            allow_rotation=request.allow_rotation
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nesting failed: {str(e)}")


@router.get("/algorithms")
async def list_algorithms():
    """
    List all available nesting algorithms with descriptions.
    """
    return {
        "algorithms": [
            {
                "id": "bottom_left",
                "name": "Bottom-Left",
                "description": "Places each part at the lowest, leftmost valid position. Good for irregular shapes.",
                "best_for": "General purpose, irregular shapes"
            },
            {
                "id": "nfdh",
                "name": "Next Fit Decreasing Height",
                "description": "Parts sorted by decreasing height and placed in levels. Simple and fast.",
                "best_for": "Quick optimization, similar height parts"
            },
            {
                "id": "ffdh",
                "name": "First Fit Decreasing Height",
                "description": "Places each part in the first level where it fits.",
                "best_for": "Mixed height parts"
            },
            {
                "id": "bfdh",
                "name": "Best Fit Decreasing Height",
                "description": "Places each part in the level with least remaining width that still fits.",
                "best_for": "Maximum material utilization"
            }
        ]
    }


@router.post("/compare-algorithms")
async def compare_algorithms(request: NestingRequest):
    """
    Compare all nesting algorithms for the same parts.
    Returns results from each algorithm for comparison.
    """
    try:
        parts = [p.dict() for p in request.parts]
        results = {}
        
        for algo in ["bottom_left", "nfdh", "ffdh", "bfdh"]:
            result = nest_parts(
                parts=parts,
                sheet_size=(request.sheet_width, request.sheet_height),
                algorithm=algo,
                kerf_width=request.kerf_width,
                part_spacing=request.part_spacing,
                allow_rotation=request.allow_rotation
            )
            results[algo] = {
                "total_sheets": result["total_sheets"],
                "waste_percentage": result["waste_percentage"],
                "execution_time_ms": result["execution_time_ms"]
            }
        
        # Find best algorithm
        best_algo = min(results.items(), key=lambda x: (x[1]["total_sheets"], x[1]["waste_percentage"]))
        
        return {
            "comparison": results,
            "recommendation": {
                "algorithm": best_algo[0],
                "reason": f"Uses {best_algo[1]['total_sheets']} sheets with {best_algo[1]['waste_percentage']}% waste"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


@router.get("/sheet-sizes")
async def get_standard_sheet_sizes():
    """
    Get standard sheet sizes for common materials.
    """
    return {
        "sheet_sizes": [
            {"name": "Standard Plywood", "width": 48, "height": 96, "note": "4' x 8' most common"},
            {"name": "European Plywood", "width": 48.8, "height": 96.8, "note": "1220mm x 2440mm"},
            {"name": "MDF Standard", "width": 49, "height": 97, "note": "Slightly oversized"},
            {"name": "Plywood Half Sheet", "width": 48, "height": 48, "note": "4' x 4'"},
            {"name": "Melamine", "width": 49, "height": 97, "note": "Common for cabinets"},
            {"name": "Baltic Birch", "width": 60, "height": 60, "note": "5' x 5' European standard"},
        ]
    }
