"""
AR Scanner API
"What Would Fit?" - Point phone at space, get cabinet suggestions
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

router = APIRouter()

# In-memory storage for scanned spaces
scanned_spaces: Dict[str, Dict] = {}

class SpaceDimensions(BaseModel):
    width: float
    height: float
    depth: float
    unit: str = "inches"

class ScannedSpace(BaseModel):
    id: str
    name: str
    dimensions: SpaceDimensions
    location: Optional[str] = None
    obstacles: List[Dict[str, Any]] = []
    cabinets: List[Dict[str, Any]] = []

class CabinetSuggestion(BaseModel):
    name: str
    type: str
    dimensions: Dict[str, float]
    quantity: int
    reason: str
    fills_space_percent: float

class ScanResult(BaseModel):
    space_id: str
    dimensions: SpaceDimensions
    suggestions: List[CabinetSuggestion]
    layout_preview: str
    total_storage_cubic_feet: float

# Cabinet size database for fitting
CABINET_SIZES = {
    "base_standard": {"width": 36, "height": 34.5, "depth": 24, "type": "base_cabinet"},
    "base_narrow": {"width": 18, "height": 34.5, "depth": 24, "type": "base_cabinet"},
    "base_wide": {"width": 48, "height": 34.5, "depth": 24, "type": "base_cabinet"},
    "base_corner": {"width": 36, "height": 34.5, "depth": 36, "type": "corner_cabinet"},
    "wall_standard": {"width": 30, "height": 30, "depth": 12, "type": "wall_cabinet"},
    "wall_tall": {"width": 30, "height": 42, "depth": 12, "type": "wall_cabinet"},
    "wall_narrow": {"width": 15, "height": 30, "depth": 12, "type": "wall_cabinet"},
    "tall_pantry": {"width": 18, "height": 84, "depth": 24, "type": "tall_cabinet"},
    "tall_broom": {"width": 18, "height": 84, "depth": 12, "type": "tall_cabinet"},
    "vanity_single": {"width": 36, "height": 34, "depth": 21, "type": "vanity"},
    "vanity_double": {"width": 72, "height": 34, "depth": 21, "type": "vanity"},
    "bookshelf_narrow": {"width": 24, "height": 72, "depth": 12, "type": "bookshelf"},
    "bookshelf_wide": {"width": 36, "height": 72, "depth": 12, "type": "bookshelf"},
    "garage_base": {"width": 36, "height": 36, "depth": 24, "type": "garage_cabinet"},
    "garage_tall": {"width": 36, "height": 72, "depth": 24, "type": "garage_cabinet"},
}

# Room presets
ROOM_PRESETS = {
    "kitchen_galley": {
        "name": "Galley Kitchen",
        "description": "Two parallel cabinet runs",
        "suggested_types": ["base_standard", "wall_standard", "tall_pantry"]
    },
    "kitchen_l": {
        "name": "L-Shaped Kitchen",
        "description": "Cabinets along two adjacent walls",
        "suggested_types": ["base_standard", "base_corner", "wall_standard", "tall_pantry"]
    },
    "kitchen_u": {
        "name": "U-Shaped Kitchen",
        "description": "Cabinets along three walls",
        "suggested_types": ["base_standard", "base_corner", "wall_standard", "tall_pantry"]
    },
    "bathroom_vanity": {
        "name": "Bathroom Vanity",
        "description": "Sink base cabinet",
        "suggested_types": ["vanity_single", "vanity_double"]
    },
    "garage_storage": {
        "name": "Garage Storage",
        "description": "Heavy-duty storage cabinets",
        "suggested_types": ["garage_base", "garage_tall"]
    },
    "laundry": {
        "name": "Laundry Room",
        "description": "Utility cabinets",
        "suggested_types": ["base_standard", "wall_standard", "tall_broom"]
    },
    "home_office": {
        "name": "Home Office",
        "description": "Bookshelves and storage",
        "suggested_types": ["bookshelf_narrow", "bookshelf_wide", "base_standard"]
    },
}

@router.post("/scan")
async def create_scan(
    name: str,
    width: float,
    height: float,
    depth: float,
    unit: str = "inches",
    location: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new scanned space.
    Simulates AR scanning of a physical space.
    """
    scan_id = f"scan_{uuid.uuid4().hex[:8]}"
    
    # Convert to inches if needed
    if unit.lower() == "cm":
        width = width / 2.54
        height = height / 2.54
        depth = depth / 2.54
    elif unit.lower() == "mm":
        width = width / 25.4
        height = height / 25.4
        depth = depth / 25.4
    elif unit.lower() == "feet":
        width = width * 12
        height = height * 12
        depth = depth * 12
    
    scanned_space = {
        "id": scan_id,
        "name": name,
        "dimensions": {
            "width": width,
            "height": height,
            "depth": depth,
            "unit": "inches"
        },
        "location": location,
        "obstacles": [],
        "cabinets": [],
        "created_at": datetime.utcnow().isoformat()
    }
    
    scanned_spaces[scan_id] = scanned_space
    
    return {
        "space_id": scan_id,
        "name": name,
        "dimensions": scanned_space["dimensions"],
        "message": "Space scanned successfully. Use /suggest to get cabinet recommendations."
    }

@router.post("/suggest/{space_id}")
async def suggest_cabinets(
    space_id: str,
    cabinet_type: str = "base_cabinet",
    style_preference: str = "modern",
    max_budget: Optional[float] = None
) -> ScanResult:
    """
    Get cabinet suggestions that fit the scanned space.
    """
    if space_id not in scanned_spaces:
        raise HTTPException(status_code=404, detail="Scanned space not found")
    
    space = scanned_spaces[space_id]
    dims = space["dimensions"]
    
    # Calculate what fits
    suggestions = calculate_fitting_cabinets(
        dims["width"],
        dims["height"],
        dims["depth"],
        cabinet_type
    )
    
    # Calculate storage capacity
    total_storage = calculate_storage_cubic_feet(suggestions)
    
    # Generate layout preview description
    layout_preview = generate_layout_description(suggestions, dims)
    
    return ScanResult(
        space_id=space_id,
        dimensions=SpaceDimensions(**dims),
        suggestions=suggestions,
        layout_preview=layout_preview,
        total_storage_cubic_feet=total_storage
    )

@router.post("/add-obstacle/{space_id}")
async def add_obstacle(
    space_id: str,
    obstacle_type: str,  # outlet, window, pipe, door, etc.
    width: float,
    height: float,
    position_x: float,
    position_y: float,
    position_z: float = 0
) -> Dict[str, Any]:
    """
    Add an obstacle to the scanned space.
    Cabinets will be arranged around obstacles.
    """
    if space_id not in scanned_spaces:
        raise HTTPException(status_code=404, detail="Scanned space not found")
    
    obstacle = {
        "type": obstacle_type,
        "dimensions": {"width": width, "height": height},
        "position": {"x": position_x, "y": position_y, "z": position_z}
    }
    
    scanned_spaces[space_id]["obstacles"].append(obstacle)
    
    return {
        "space_id": space_id,
        "obstacle": obstacle,
        "message": f"Added {obstacle_type} obstacle. Re-run /suggest for updated layout."
    }

@router.get("/presets")
async def list_room_presets() -> List[Dict[str, Any]]:
    """List all room type presets"""
    return [
        {"id": key, **preset}
        for key, preset in ROOM_PRESETS.items()
    ]

@router.get("/cabinet-sizes")
async def list_cabinet_sizes() -> List[Dict[str, Any]]:
    """List all available cabinet sizes for fitting"""
    return [
        {"id": key, **size}
        for key, size in CABINET_SIZES.items()
    ]

@router.get("/spaces")
async def list_scanned_spaces() -> List[Dict[str, Any]]:
    """List all scanned spaces"""
    return list(scanned_spaces.values())

@router.get("/spaces/{space_id}")
async def get_scanned_space(space_id: str) -> Dict[str, Any]:
    """Get scanned space details"""
    if space_id not in scanned_spaces:
        raise HTTPException(status_code=404, detail="Scanned space not found")
    return scanned_spaces[space_id]

@router.delete("/spaces/{space_id}")
async def delete_scanned_space(space_id: str) -> Dict[str, str]:
    """Delete a scanned space"""
    if space_id not in scanned_spaces:
        raise HTTPException(status_code=404, detail="Scanned space not found")
    del scanned_spaces[space_id]
    return {"message": f"Space {space_id} deleted"}

@router.post("/quick-scan")
async def quick_scan_suggest(
    width: float,
    height: float,
    depth: float,
    unit: str = "inches",
    room_type: str = "kitchen_galley"
) -> Dict[str, Any]:
    """
    Quick scan without saving - instant suggestions.
    Great for in-store use.
    """
    # Convert to inches if needed
    if unit.lower() == "cm":
        width = width / 2.54
        height = height / 2.54
        depth = depth / 2.54
    elif unit.lower() == "feet":
        width = width * 12
        height = height * 12
        depth = depth * 12
    
    # Get room preset
    preset = ROOM_PRESETS.get(room_type, ROOM_PRESETS["kitchen_galley"])
    
    # Get suggestions
    suggestions = calculate_fitting_cabinets(
        width, height, depth, 
        preset["suggested_types"][0].replace("_", " ").split()[0] + "_cabinet"
    )
    
    return {
        "dimensions": {"width": width, "height": height, "depth": depth, "unit": "inches"},
        "room_type": preset["name"],
        "suggestions": suggestions,
        "total_cabinets": len(suggestions),
        "estimated_cost": sum(s.get("estimated_cost", 0) for s in suggestions),
        "storage_cubic_feet": calculate_storage_cubic_feet(suggestions)
    }

def calculate_fitting_cabinets(
    space_width: float,
    space_height: float,
    space_depth: float,
    primary_type: str
) -> List[CabinetSuggestion]:
    """Calculate which cabinets fit in the space"""
    suggestions = []
    remaining_width = space_width
    
    # Sort cabinets by width (largest first for better fit)
    sorted_cabinets = sorted(
        CABINET_SIZES.items(),
        key=lambda x: x[1]["width"],
        reverse=True
    )
    
    for cab_id, cab_dims in sorted_cabinets:
        if cab_dims["type"] != primary_type and primary_type != "any":
            continue
        
        # Check if it fits
        if (cab_dims["width"] <= remaining_width and 
            cab_dims["height"] <= space_height and
            cab_dims["depth"] <= space_depth):
            
            # Calculate how many fit
            quantity = int(remaining_width // cab_dims["width"])
            if quantity > 0:
                fill_percent = (cab_dims["width"] * quantity / space_width) * 100
                
                suggestions.append(CabinetSuggestion(
                    name=cab_id.replace("_", " ").title(),
                    type=cab_dims["type"],
                    dimensions=cab_dims,
                    quantity=quantity,
                    reason=f"Fits {quantity} cabinet(s) in {space_width:.0f}\" width",
                    fills_space_percent=round(fill_percent, 1)
                ))
                
                remaining_width -= cab_dims["width"] * quantity
                
                if remaining_width < 6:  # Less than 6" left
                    break
    
    return suggestions[:5]  # Return top 5 suggestions

def calculate_storage_cubic_feet(suggestions: List[CabinetSuggestion]) -> float:
    """Calculate total storage capacity"""
    total = 0
    for s in suggestions:
        dims = s.dimensions
        # Convert to feet and calculate volume
        vol = (dims["width"] / 12) * (dims["height"] / 12) * (dims["depth"] / 12)
        total += vol * s.quantity
    return round(total, 2)

def generate_layout_description(
    suggestions: List[CabinetSuggestion],
    space_dims: Dict[str, float]
) -> str:
    """Generate a text description of the layout"""
    if not suggestions:
        return "No cabinets fit in this space."
    
    lines = [
        f"Layout for {space_dims['width']:.0f}\"W x {space_dims['height']:.0f}\"H x {space_dims['depth']:.0f}\"D space:",
        ""
    ]
    
    for s in suggestions:
        lines.append(f"• {s.quantity}x {s.name} ({s.dimensions['width']}\"W each)")
    
    lines.append("")
    lines.append(f"Total cabinets: {sum(s.quantity for s in suggestions)}")
    lines.append(f"Space utilization: {max(s.fills_space_percent for s in suggestions):.0f}%")
    
    return "\n".join(lines)
