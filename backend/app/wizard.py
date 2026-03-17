"""Wizard State Machine for Guided Cabinet Design

Provides step-by-step guided flows for beginners.
"""
from fastapi import HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class CabinetType(str, Enum):
    BASE = "base"
    WALL = "wall"
    TALL = "tall"

class WizardStep(str, Enum):
    CABINET_TYPE = "cabinet_type"
    DIMENSIONS = "dimensions"
    COMPONENTS = "components"
    MATERIAL = "material"
    REVIEW = "review"

class PresetDimension(BaseModel):
    """Standard cabinet dimensions"""
    name: str
    width: float
    height: float
    depth: float
    description: str

# Preset dimensions for different cabinet types
PRESETS: Dict[CabinetType, List[PresetDimension]] = {
    CabinetType.BASE: [
        PresetDimension(
            name="Standard Base",
            width=36.0,
            height=34.5,
            depth=24.0,
            description="Standard kitchen/base cabinet for under countertops"
        ),
        PresetDimension(
            name="Wide Base",
            width=48.0,
            height=34.5,
            depth=24.0,
            description="Wide base cabinet for appliances or larger storage"
        ),
        PresetDimension(
            name="Narrow Base",
            width=30.0,
            height=34.5,
            depth=24.0,
            description="Narrow base cabinet for tight spaces"
        ),
    ],
    CabinetType.WALL: [
        PresetDimension(
            name="Standard Wall",
            width=30.0,
            height=12.0,
            depth=12.0,
            description="Standard upper kitchen cabinet"
        ),
        PresetDimension(
            name="Tall Wall",
            width=36.0,
            height=30.0,
            depth=12.0,
            description="Tall wall cabinet for large items"
        ),
        PresetDimension(
            name="Double Wall",
            width=48.0,
            height=30.0,
            depth=12.0,
            description="Extra-wide wall cabinet"
        ),
    ],
    CabinetType.TALL: [
        PresetDimension(
            name="Standard Tall",
            width=24.0,
            height=84.0,
            depth=24.0,
            description="Standard pantry/utility cabinet"
        ),
        PresetDimension(
            name="Wide Tall",
            width=36.0,
            height=84.0,
            depth=24.0,
            description="Wide pantry/utility cabinet"
        ),
    ],
}
class MaterialPreset(BaseModel):
    """Material presets with pricing"""
    name: str
    type: str
    thickness: float
    price_per_sqft: float
    description: str

# Material presets
MATERIAL_PRESETS: List[MaterialPreset] = [
    MaterialPreset(
        name="Birch Plywood",
        type="plywood",
        thickness=18.0,  # 3/4" in mm
        price_per_sqft=45.0,
        description="High-quality birch plywood, great for painted finishes"
    ),
    MaterialPreset(
        name="MDF",
        type="mdf",
        thickness=18.0,
        price_per_sqft=35.0,
        description="Medium-density fiberboard, smooth finish"
    ),
    MaterialPreset(
        name="Red Oak",
        type="hardwood",
        thickness=19.0,
        price_per_sqft=85.0,
        description="Solid red oak, great for staining"
    ),
    MaterialPreset(
        name="Maple",
        type="hardwood",
        thickness=19.0,
        price_per_sqft=75.0,
        description="Solid maple, light color, good for staining"
    ),
]
class ComponentPreset(BaseModel):
    """Component presets"""
    name: str
    type: str
    default_quantity: int = 1
    description: str

COMPONENT_PRESETS: List[ComponentPreset] = [
    ComponentPreset(
        name="Adjustable Shelf",
        type="shelf",
        default_quantity=2,
        description="Standard adjustable shelf with shelf pins"
    ),
    ComponentPreset(
        name="Fixed Shelf",
        type="shelf",
        default_quantity=2,
        description="Fixed shelf, cannot adjust after install"
    ),
    ComponentPreset(
        name="Overlay Door",
        type="door",
        default_quantity=1,
        description="Overlay door (sits in front of cabinet)"
    ),
    ComponentPreset(
        name="Inset Door",
        type="door",
        default_quantity=1,
        description="Inset door (sits inside cabinet frame)"
    ),
    ComponentPreset(
        name="Standard Drawer",
        type="drawer",
        default_quantity=2,
        description="Standard drawer with side-mount slides"
    ),
    ComponentPreset(
        name="Soft-Close Drawer",
        type="drawer",
        default_quantity=2,
        description="Drawer with soft-close slides"
    ),
]
class WizardState(BaseModel):
    """Current state of wizard"""
    conversation_id: str
    current_step: WizardStep
    cabinet_type: Optional[CabinetType] = None
    dimensions: Optional[Dict[str, float]] = None
    components: List[Dict[str, Any]] = []
    material: Optional[Dict[str, Any]] = None
    created_at: datetime = datetime.utcnow()
    completed: bool = False

class WizardRequest(BaseModel):
    """Request for wizard interaction"""
    conversation_id: str
    action: str  # 'start', 'next', 'back', 'select', 'cancel'
    data: Optional[Dict[str, Any]] = None

class WizardResponse(BaseModel):
    """Response from wizard"""
    current_step: WizardStep
    prompt: str
    options: List[Dict[str, Any]]
    state: WizardState
    cabinet_summary: Optional[Dict[str, Any]] = None
# Active wizard states
active_wizards: Dict[str, WizardState] = {}
def start_wizard(conversation_id: str) -> WizardState:
    """Start a new wizard session"""
    state = WizardState(
        conversation_id=conversation_id,
        current_step=WizardStep.CABINET_TYPE,
        completed=False
    )
    active_wizards[conversation_id] = state
    return state

def get_wizard_state(conversation_id: str) -> Optional[WizardState]:
    """Get wizard state by ID"""
    return active_wizards.get(conversation_id)

def update_wizard_state(conversation_id: str, action: str, data: Optional[Dict[str, Any]] = None) -> WizardState:
    """Update wizard state based on user action"""
    state = active_wizards.get(conversation_id)
    if not state:
        raise HTTPException(
            status_code=404,
            detail="Wizard session not found. Start a new wizard."
        )
    
    if action == "cancel":
        del active_wizards[conversation_id]
        raise HTTPException(
            status_code=200,
            detail="Wizard cancelled"
        )
    
    elif action == "next":
        state.current_step = next_step(state.current_step)
    
    elif action == "back":
        state.current_step = previous_step(state.current_step)
    
    elif action == "select":
        if data:
            if state.current_step == WizardStep.CABINET_TYPE:
                cabinet_type_str = data.get("cabinet_type")
                if cabinet_type_str:
                    state.cabinet_type = CabinetType(cabinet_type_str)
            
            elif state.current_step == WizardStep.DIMENSIONS:
                if data.get("preset_name"):
                    # Use preset
                    if state.cabinet_type:
                        preset = find_preset(state.cabinet_type, data["preset_name"])
                        if preset:
                            state.dimensions = {
                                "width": preset.width,
                                "height": preset.height,
                                "depth": preset.depth
                            }
                else:
                    # Use custom dimensions
                    state.dimensions = {
                        "width": data.get("width", 36.0),
                        "height": data.get("height", 34.5),
                        "depth": data.get("depth", 24.0),
                    }
            
            elif state.current_step == WizardStep.COMPONENTS:
                component_data = {
                    "name": data.get("name"),
                    "type": data.get("type"),
                    "quantity": data.get("quantity", 1),
                }
                state.components.append(component_data)
            
            elif state.current_step == WizardStep.MATERIAL:
                if data.get("preset_name"):
                    preset = find_material_preset(data["preset_name"])
                    if preset:
                        state.material = {
                            "name": preset.name,
                            "type": preset.type,
                            "thickness": preset.thickness,
                            "price_per_sqft": preset.price_per_sqft
                        }
    
    elif action == "finish":
        state.completed = True
    
    active_wizards[conversation_id] = state
    return state

def next_step(current: WizardStep) -> WizardStep:
    """Get next step in wizard flow"""
    steps = [
        WizardStep.CABINET_TYPE,
        WizardStep.DIMENSIONS,
        WizardStep.COMPONENTS,
        WizardStep.MATERIAL,
        WizardStep.REVIEW,
    ]
    try:
        current_index = steps.index(current)
        return steps[current_index + 1]
    except IndexError:
        return WizardStep.REVIEW

def previous_step(current: WizardStep) -> WizardStep:
    """Get previous step in wizard flow"""
    steps = [
        WizardStep.CABINET_TYPE,
        WizardStep.DIMENSIONS,
        WizardStep.COMPONENTS,
        WizardStep.MATERIAL,
        WizardStep.REVIEW,
    ]
    try:
        current_index = steps.index(current)
        if current_index > 0:
            return steps[current_index - 1]
        return WizardStep.CABINET_TYPE
    except ValueError:
        return WizardStep.CABINET_TYPE

def find_preset(cabinet_type: CabinetType, name: str) -> Optional[PresetDimension]:
    """Find dimension preset by name"""
    for preset in PRESETS.get(cabinet_type, []):
        if preset.name.lower() == name.lower():
            return preset
    return None

def find_material_preset(name: str) -> Optional[MaterialPreset]:
    """Find material preset by name"""
    for preset in MATERIAL_PRESETS:
        if preset.name.lower() == name.lower():
            return preset
    return None

def generate_cabinet_summary(state: WizardState) -> Dict[str, Any]:
    """Generate cabinet summary from wizard state"""
    summary = {
        "cabinet_type": state.cabinet_type.value if state.cabinet_type else None,
        "dimensions": state.dimensions,
        "components": state.components,
        "material": state.material,
    }
    
    # Calculate estimated cost
    if state.dimensions and state.material:
        width_ft = state.dimensions["width"] / 12.0
        height_ft = state.dimensions["height"] / 12.0
        depth_ft = state.dimensions["depth"] / 12.0
        surface_area = 2 * (
            width_ft * height_ft +  # front + back
            width_ft * depth_ft +   # left + right
            height_ft * depth_ft     # top + bottom
        )
        
        estimated_cost = surface_area * state.material["price_per_sqft"]
        summary["estimated_cost"] = round(estimated_cost, 2)
    
    return summary
