"""Style Presets for Cabinet Designer - One-click cabinet styles."""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Literal
from enum import Enum


class StylePresetCategory(Enum):
    DOOR_STYLE = "door_style"
    FRAME_TYPE = "frame_type"
    DRAWER_STYLE = "drawer_style"
    FINISH = "finish"
    HARDWARE = "hardware"


@dataclass
class StylePreset:
    id: str
    name: str
    description: str
    category: StylePresetCategory
    settings: Dict[str, Any]
    icon: str = "📦"
    preview_image: Optional[str] = None
    features: List[str] = field(default_factory=list)
    popular: bool = False
    tags: List[str] = field(default_factory=list)


# Define all style presets
STYLE_PRESETS: Dict[str, StylePreset] = {
    # Door Styles
    "shaker": StylePreset(
        id="shaker",
        name="Classic Shaker",
        description="Timeless recessed panel design",
        category=StylePresetCategory.DOOR_STYLE,
        icon="🚪",
        settings={
            "doorStyle": "shaker",
            "doorPanel": "recessed",
            "panelDepth": 0.25,
            "stileWidth": 2.5,
            "railWidth": 2.5,
            "insideEdgeProfile": "square",
            "outsideEdgeProfile": "rounded"
        },
        features=[
            "Recessed flat center panel",
            "2.5" stiles and rails",
            "Square inside edges",
            "Works with any finish"
        ],
        popular=True,
        tags=["traditional", "timeless", "versatile"]
    ),
    
    "flat_panel": StylePreset(
        id="flat_panel",
        name="Modern Flat Panel",
        description="Clean, minimalist slab doors",
        category=StylePresetCategory.DOOR_STYLE,
        icon="⬜",
        settings={
            "doorStyle": "flat",
            "doorThickness": 0.75,
            "edgeProfile": "square",
            "hasEdgeBanding": True
        },
        features=[
            "Solid slab construction",
            "No visible frames",
            "Perfect for modern kitchens",
            "Easy to clean"
        ],
        popular=True,
        tags=["modern", "minimalist", "contemporary"]
    ),
    
    "raised_panel": StylePreset(
        id="raised_panel",
        name="Traditional Raised Panel",
        description="Elegant raised center panel with profiled edges",
        category=StylePresetCategory.DOOR_STYLE,
        icon="🖼️",
        settings={
            "doorStyle": "raised_panel",
            "panelProfile": "cathedral",
            "raiseHeight": 0.5,
            "stileWidth": 2.25,
            "railWidth": 2.25,
            "insideEdgeProfile": "ogee",
            "outsideEdgeProfile": "ogee"
        },
        features=[
            "Raised center panel",
            "Cathedral or arch profile options",
            "Ogee edge detailing",
            "Traditional elegance"
        ],
        tags=["traditional", "elegant", "classic"]
    ),
    
    "beadboard": StylePreset(
        id="beadboard",
        name="Cottage Beadboard",
        description="Charming beadboard panel design",
        category=StylePresetCategory.DOOR_STYLE,
        icon="🏡",
        settings={
            "doorStyle": "beadboard",
            "beadSpacing": 2.5,
            "beadDepth": 0.125,
            "stileWidth": 2.0,
            "railWidth": 2.0
        },
        features=[
            "Vertical beadboard center panel",
            "Cottage/country style",
            "2.5" bead spacing",
            "Great for painted finishes"
        ],
        tags=["cottage", "country", "farmhouse"]
    ),
    
    "louvered": StylePreset(
        id="louvered",
        name="Ventilated Louvered",
        description="Slatted design for ventilation",
        category=StylePresetCategory.DOOR_STYLE,
        icon="🌬️",
        settings={
            "doorStyle": "louvered",
            "louverAngle": 45,
            "louverSpacing": 1.5,
            "louverWidth": 2.0
        },
        features=[
            "Angled slats for airflow",
            "Perfect for laundry rooms",
            "Media cabinet ventilation",
            "Unique visual appeal"
        ],
        tags=["ventilation", "functional", "unique"]
    ),
    
    "glass_frame": StylePreset(
        id="glass_frame",
        name="Glass Frame Display",
        description="Frame with glass insert for display cabinets",
        category=StylePresetCategory.DOOR_STYLE,
        icon="🪟",
        settings={
            "doorStyle": "glass",
            "glassType": "clear",
            "frameWidth": 2.0,
            "glassThickness": 0.125,
            "hasMullions": False
        },
        features=[
            "Glass center panel",
            "Display cabinet ready",
            "Optional mullion dividers",
            "Multiple glass options"
        ],
        tags=["display", "showcase", "elegant"]
    ),
    
    # Frame Types
    "face_frame": StylePreset(
        id="face_frame",
        name="Traditional Face Frame",
        description="Overlay doors on face frame construction",
        category=StylePresetCategory.FRAME_TYPE,
        icon="🖼️",
        settings={
            "frameType": "face_frame",
            "faceFrameWidth": 1.5,
            "faceFrameThickness": 0.75,
            "stilesVisible": True,
            "doorOverlay": 0.5,
            "drawerOverlay": 0.5
        },
        features=[
            "1.5" face frame stiles",
            "Traditional American style",
            "Doors overlay the frame",
            "Easier installation tolerance"
        ],
        popular=True,
        tags=["traditional", "american", "classic"]
    ),
    
    "frameless": StylePreset(
        id="frameless",
        name="European Frameless",
        description="Full-access frameless construction",
        category=StylePresetCategory.FRAME_TYPE,
        icon="📦",
        settings={
            "frameType": "frameless",
            "edgeBanding": True,
            "fullOverlay": True,
            "doorOverlay": 1.25,
            "drawerOverlay": 1.25,
            "systemHoles": True
        },
        features=[
            "Maximum interior access",
            "32mm system hole drilling",
            "Sleek European look",
            "Full overlay doors"
        ],
        popular=True,
        tags=["modern", "european", "efficient"]
    ),
    
    "inset": StylePreset(
        id="inset",
        name="Premium Inset",
        description="Doors and drawers fit inside the frame",
        category=StylePresetCategory.FRAME_TYPE,
        icon="🎯",
        settings={
            "frameType": "inset",
            "doorInset": 0.125,
            "drawerInset": 0.125,
            "requiresPrecision": True,
            "beadedFrame": False
        },
        features=[
            "Doors flush with frame",
            "High-end craftsmanship",
            "Reveals precise joinery",
            "Premium hardware required"
        ],
        tags=["premium", "luxury", "custom"]
    ),
    
    # Drawer Styles
    "flat_drawer": StylePreset(
        id="flat_drawer",
        name="Flat Slab Drawer",
        description="Simple flat drawer front",
        category=StylePresetCategory.DRAWER_STYLE,
        icon="📁",
        settings={
            "drawerStyle": "flat",
            "drawerFrontThickness": 0.75,
            "edgeProfile": "square"
        },
        features=[
            "Clean modern look",
            "Easy to build",
            "Works with any cabinet style"
        ],
        tags=["modern", "simple", "minimal"]
    ),
    
    "shaker_drawer": StylePreset(
        id="shaker_drawer",
        name="Shaker Drawer Front",
        description="Recessed panel drawer front matching shaker doors",
        category=StylePresetCategory.DRAWER_STYLE,
        icon="🗄️",
        settings={
            "drawerStyle": "shaker",
            "panelDepth": 0.25,
            "stileWidth": 2.5,
            "railWidth": 2.5
        },
        features=[
            "Matches shaker cabinet doors",
            "Recessed center panel",
            "Traditional look"
        ],
        popular=True,
        tags=["traditional", "shaker", "classic"]
    ),
    
    "applied_molding": StylePreset(
        id="applied_molding",
        name="Applied Molding Drawer",
        description="Decorative molding on drawer front",
        category=StylePresetCategory.DRAWER_STYLE,
        icon="🏛️",
        settings={
            "drawerStyle": "applied_molding",
            "moldingProfile": "ogee",
            "moldingWidth": 1.0,
            "moldingThickness": 0.375
        },
        features=[
            "Decorative molding detail",
            "Traditional elegance",
            "Custom molding options"
        ],
        tags=["traditional", "decorative", "elegant"]
    ),
    
    # Finishes
    "painted_white": StylePreset(
        id="painted_white",
        name="Classic White Paint",
        description="Clean white painted finish",
        category=StylePresetCategory.FINISH,
        icon="🎨",
        settings={
            "finishType": "paint",
            "finishColor": "#FFFFFF",
            "finishName": "White",
            "finishSheen": "satin",
            "primerRequired": True,
            "paintType": "latex"
        },
        features=[
            "Bright, clean look",
            "Makes spaces feel larger",
            "Easy to touch up",
            "Matches any decor"
        ],
        popular=True,
        tags=["white", "bright", "versatile"]
    ),
    
    "painted_gray": StylePreset(
        id="painted_gray",
        name="Modern Gray Paint",
        description="Contemporary gray painted finish",
        category=StylePresetCategory.FINISH,
        icon="🎨",
        settings={
            "finishType": "paint",
            "finishColor": "#808080",
            "finishName": "Gray",
            "finishSheen": "satin",
            "primerRequired": True,
            "paintType": "latex"
        },
        features=[
            "Contemporary look",
            "Pairs well with wood tones",
            "Hides dirt better than white"
        ],
        popular=True,
        tags=["gray", "modern", "contemporary"]
    ),
    
    "stained_oak": StylePreset(
        id="stained_oak",
        name="Natural Oak Stain",
        description="Warm oak wood finish",
        category=StylePresetCategory.FINISH,
        icon="🪵",
        settings={
            "finishType": "stain",
            "finishColor": "#C4A35A",
            "finishName": "Natural Oak",
            "woodSpecies": "red_oak",
            "stainColor": "natural",
            "topcoat": "polyurethane",
            "topcoatSheen": "satin"
        },
        features=[
            "Shows natural wood grain",
            "Warm, traditional look",
            "Requires oak veneer plywood",
            "Clear protective topcoat"
        ],
        tags=["wood", "oak", "natural", "warm"]
    ),
    
    "stained_walnut": StylePreset(
        id="stained_walnut",
        name="Dark Walnut Stain",
        description="Rich dark walnut finish",
        category=StylePresetCategory.FINISH,
        icon="🪵",
        settings={
            "finishType": "stain",
            "finishColor": "#5D4037",
            "finishName": "Dark Walnut",
            "woodSpecies": "walnut",
            "stainColor": "dark_walnut",
            "topcoat": "polyurethane",
            "topcoatSheen": "satin"
        },
        features=[
            "Rich, dark appearance",
            "Luxury look",
            "Requires walnut veneer plywood",
            "Elegant and timeless"
        ],
        tags=["wood", "walnut", "dark", "luxury"]
    ),
    
    # Hardware
    "hardware_modern": StylePreset(
        id="hardware_modern",
        name="Modern Pulls",
        description="Sleek bar pulls for contemporary style",
        category=StylePresetCategory.HARDWARE,
        icon="➖",
        settings={
            "hardwareType": "bar_pull",
            "hardwareFinish": "brushed_nickel",
            "pullLength": 5,
            "pullProjection": 1.0,
            "hardwarePlacement": "horizontal"
        },
        features=[
            "Clean, linear look",
            "Easy to grip",
            "Works with modern cabinets"
        ],
        popular=True,
        tags=["modern", "contemporary", "minimal"]
    ),
    
    "hardware_traditional": StylePreset(
        id="hardware_traditional",
        name="Traditional Knobs",
        description="Classic round knobs for traditional style",
        category=StylePresetCategory.HARDWARE,
        icon="🔘",
        settings={
            "hardwareType": "knob",
            "hardwareFinish": "oil_rubbed_bronze",
            "knobDiameter": 1.25,
            "knobProjection": 1.0
        },
        features=[
            "Traditional style",
            "Classic appeal",
            "Multiple finish options"
        ],
        tags=["traditional", "classic", "knob"]
    ),
    
    "hardware_cup": StylePreset(
        id="hardware_cup",
        name="Cup Pulls",
        description="Farmhouse style cup pulls",
        category=StylePresetCategory.HARDWARE,
        icon="☕",
        settings={
            "hardwareType": "cup_pull",
            "hardwareFinish": "oil_rubbed_bronze",
            "pullWidth": 3,
            "pullProjection": 1.25
        },
        features=[
            "Farmhouse/cottage style",
            "Easy to grip",
            "Vintage charm"
        ],
        tags=["farmhouse", "vintage", "cottage"]
    ),
    
    "hardware_integrated": StylePreset(
        id="hardware_integrated",
        name="Integrated Handles",
        description="Built-in finger pulls for seamless look",
        category=StylePresetCategory.HARDWARE,
        icon="👋",
        settings={
            "hardwareType": "integrated",
            "fingerPullDepth": 0.75,
            "fingerPullHeight": 1.0,
            "edgeProfile": "finger_pull"
        },
        features=[
            "No visible hardware",
            "Ultra-modern look",
            "Easy to clean",
            "Requires special edge routing"
        ],
        tags=["modern", "minimal", "integrated"]
    ),
}


def get_presets_by_category(category: StylePresetCategory) -> List[StylePreset]:
    """Get all presets in a category."""
    return [p for p in STYLE_PRESETS.values() if p.category == category]


def get_popular_presets() -> List[StylePreset]:
    """Get all popular presets."""
    return [p for p in STYLE_PRESETS.values() if p.popular]


def search_presets(query: str) -> List[StylePreset]:
    """Search presets by name, description, or tags."""
    query_lower = query.lower()
    return [
        p for p in STYLE_PRESETS.values()
        if query_lower in p.name.lower()
        or query_lower in p.description.lower()
        or any(query_lower in tag.lower() for tag in p.tags)
    ]


def apply_preset_to_design(design: Dict[str, Any], preset_id: str) -> Dict[str, Any]:
    """Apply a preset's settings to a design."""
    if preset_id not in STYLE_PRESETS:
        raise ValueError(f"Unknown preset: {preset_id}")
    
    preset = STYLE_PRESETS[preset_id]
    updated_design = design.copy()
    updated_design.update(preset.settings)
    
    return updated_design


# FastAPI router for style presets
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/style-presets", tags=["style-presets"])


class ApplyPresetRequest(BaseModel):
    design: Dict[str, Any]
    preset_id: str


@router.get("/list")
async def list_presets(category: str = None):
    """List all available style presets."""
    presets = list(STYLE_PRESETS.values())
    
    if category:
        try:
            cat = StylePresetCategory(category)
            presets = [p for p in presets if p.category == cat]
        except ValueError:
            pass
    
    return {
        "presets": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category.value,
                "icon": p.icon,
                "previewImage": p.preview_image,
                "features": p.features,
                "popular": p.popular,
                "tags": p.tags,
                "settings": p.settings
            }
            for p in presets
        ]
    }


@router.get("/{preset_id}")
async def get_preset(preset_id: str):
    """Get details for a specific preset."""
    if preset_id not in STYLE_PRESETS:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    preset = STYLE_PRESETS[preset_id]
    return {
        "id": preset.id,
        "name": preset.name,
        "description": preset.description,
        "category": preset.category.value,
        "icon": preset.icon,
        "previewImage": preset.preview_image,
        "features": preset.features,
        "popular": preset.popular,
        "tags": preset.tags,
        "settings": preset.settings
    }


@router.post("/apply")
async def apply_preset(request: ApplyPresetRequest):
    """Apply a preset to a design and return the updated design."""
    try:
        updated_design = apply_preset_to_design(request.design, request.preset_id)
        return {"design": updated_design}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))