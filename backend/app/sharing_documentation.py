"""
Phase 5 Sharing & Documentation Features
- Brag Sheet Generator: Auto-create shareable before/after posts
- Contractor Handoff Mode: Generate professional PDF for cabinetmakers
- Version History: Track design changes over time
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from enum import Enum
import json


class ExportFormat(str, Enum):
    PDF = "pdf"
    IMAGE = "image"
    SOCIAL = "social"
    PROFESSIONAL = "professional"


# ============================================================================
# BRAG SHEET GENERATOR
# ============================================================================

class BragSheetStyle(str, Enum):
    BEFORE_AFTER = "before_after"
    PROGRESS_TIMELAPSE = "progress_timelapse"
    COMPLETED_SHOWCASE = "completed_showcase"
    COST_BREAKDOWN = "cost_breakdown"
    TECHNIQUE_HIGHLIGHT = "technique_highlight"


class BragSheetTemplate(BaseModel):
    name: str
    style: BragSheetStyle
    title_template: str
    include_cost: bool = True
    include_time: bool = True
    include_materials: bool = True
    include_hardware: bool = True
    include_tips: bool = True
    social_platform: Optional[str] = None  # instagram, facebook, pinterest, reddit


SOCIAL_TEMPLATES = {
    "instagram": {
        "max_chars": 2200,
        "hashtag_style": "space_separated",
        "image_ratio": "4:5",
        "emoji_friendly": True,
    },
    "facebook": {
        "max_chars": 63206,
        "hashtag_style": "inline",
        "image_ratio": "16:9",
        "emoji_friendly": True,
    },
    "pinterest": {
        "max_chars": 500,
        "hashtag_style": "none",
        "image_ratio": "2:3",
        "emoji_friendly": False,
    },
    "reddit": {
        "max_chars": 40000,
        "hashtag_style": "none",
        "image_ratio": "any",
        "emoji_friendly": False,
    },
}

POPULAR_HASHTAGS = {
    "general": ["woodworking", "diy", "cabinetmaking", "woodwork", "maker"],
    "cabinets": ["cabinets", "cabinetmaking", "customcabinets", "kitchencabinets", "bathroomvanity"],
    "tools": ["tablesaw", "router", "kregjig", "woodworkingtools", "workshop"],
    "materials": ["plywood", "hardwood", "mdf", "solidwood", "woodgrain"],
    "style": ["shakerstyle", "midcenturymodern", "rustic", "farmhouse", "modern"],
    "process": ["workinprogress", "buildalong", "tutorial", "howto", "woodworkingtips"],
}

WOODWORKING_EMOJIS = {
    "tools": "🔨🪚🪛🔧",
    "wood": "🪵🪵",
    "building": "🏗️👷‍♂️",
    "success": "✅🎉💪",
    "cabinet": "🗄️🚪",
    "money": "💰💵",
    "time": "⏱️🕐",
}


def generate_brag_sheet(
    project_name: str,
    style: BragSheetStyle,
    before_photos: List[str] = None,
    after_photos: List[str] = None,
    cost_breakdown: Dict[str, float] = None,
    time_invested_hours: float = None,
    materials_used: List[str] = None,
    hardware_used: List[str] = None,
    techniques: List[str] = None,
    lessons_learned: List[str] = None,
    social_platform: str = "instagram",
    custom_title: str = None,
    include_watermark: bool = False,
) -> Dict[str, Any]:
    """
    Generate a shareable brag sheet for social media.
    
    Args:
        project_name: Name of the project
        style: Type of brag sheet to generate
        before_photos: List of before photo URLs/paths
        after_photos: List of after photo URLs/paths
        cost_breakdown: Dictionary of cost categories and amounts
        time_invested_hours: Total hours spent on project
        materials_used: List of materials used
        hardware_used: List of hardware used
        techniques: List of techniques employed
        lessons_learned: Tips and lessons from the build
        social_platform: Target social platform
        custom_title: Custom title override
        include_watermark: Whether to add watermark to images
    
    Returns:
        Dictionary with generated content, hashtags, and export info
    """
    
    template_config = SOCIAL_TEMPLATES.get(social_platform, SOCIAL_TEMPLATES["instagram"])
    
    # Generate title
    if custom_title:
        title = custom_title
    else:
        title_templates = {
            BragSheetStyle.BEFORE_AFTER: f"From Blank Canvas to {project_name}! 🎨",
            BragSheetStyle.PROGRESS_TIMELAPSE: f"Watch {project_name} Come to Life! ⏱️",
            BragSheetStyle.COMPLETED_SHOWCASE: f"Finally Done: {project_name}! 🎉",
            BragSheetStyle.COST_BREAKDOWN: f"How Much Did My {project_name} Cost? 💰",
            BragSheetStyle.TECHNIQUE_HIGHLIGHT: f"The Secret to This {project_name} 🔑",
        }
        title = title_templates.get(style, f"My {project_name} Build")
    
    # Generate caption based on style
    caption = _generate_caption(
        style=style,
        project_name=project_name,
        cost_breakdown=cost_breakdown,
        time_invested_hours=time_invested_hours,
        materials_used=materials_used,
        hardware_used=hardware_used,
        techniques=techniques,
        lessons_learned=lessons_learned,
        platform=social_platform,
        max_chars=template_config["max_chars"],
    )
    
    # Generate hashtags
    hashtags = _generate_hashtags(
        materials=materials_used,
        techniques=techniques,
        style_tags=["custom", "handmade"],
        platform=social_platform,
    )
    
    # Calculate totals
    total_cost = sum(cost_breakdown.values()) if cost_breakdown else 0
    
    # Generate summary stats
    stats = {
        "total_cost": total_cost,
        "time_invested_hours": time_invested_hours,
        "materials_count": len(materials_used) if materials_used else 0,
        "hardware_count": len(hardware_used) if hardware_used else 0,
        "techniques_used": len(techniques) if techniques else 0,
    }
    
    # Generate image layout suggestions
    image_layout = _suggest_image_layout(
        style=style,
        before_count=len(before_photos) if before_photos else 0,
        after_count=len(after_photos) if after_photos else 0,
        platform=social_platform,
    )
    
    return {
        "title": title,
        "caption": caption,
        "hashtags": hashtags,
        "hashtag_string": " ".join(hashtags),
        "stats": stats,
        "image_layout": image_layout,
        "platform_config": template_config,
        "export_ready": True,
        "created_at": datetime.now().isoformat(),
    }


def _generate_caption(
    style: BragSheetStyle,
    project_name: str,
    cost_breakdown: Dict[str, float],
    time_invested_hours: float,
    materials_used: List[str],
    hardware_used: List[str],
    techniques: List[str],
    lessons_learned: List[str],
    platform: str,
    max_chars: int,
) -> str:
    """Generate platform-appropriate caption."""
    
    lines = []
    
    if style == BragSheetStyle.BEFORE_AFTER:
        lines.append(f"Transformed this space with a custom {project_name}!")
        lines.append("")
        lines.append("The before and after says it all. 😤")
        
    elif style == BragSheetStyle.PROGRESS_TIMELAPSE:
        lines.append(f"Building my {project_name} from start to finish!")
        lines.append("")
        lines.append("Swipe to see the entire process →")
        
    elif style == BragSheetStyle.COMPLETED_SHOWCASE:
        lines.append(f"Finally finished my {project_name}! 🎉")
        lines.append("")
        lines.append("This one was a journey but so worth it.")
        
    elif style == BragSheetStyle.COST_BREAKDOWN:
        total = sum(cost_breakdown.values()) if cost_breakdown else 0
        lines.append(f"Full cost breakdown for my {project_name}:")
        lines.append("")
        if cost_breakdown:
            for category, amount in cost_breakdown.items():
                lines.append(f"• {category.title()}: ${amount:.2f}")
            lines.append("")
            lines.append(f"💰 Total: ${total:.2f}")
            
    elif style == BragSheetStyle.TECHNIQUE_HIGHLIGHT:
        lines.append(f"The technique that made this {project_name} possible:")
        lines.append("")
        if techniques:
            lines.append(f"🔧 {techniques[0]}")
    
    # Add time investment
    if time_invested_hours:
        lines.append("")
        if time_invested_hours < 10:
            lines.append(f"⏱️ Time invested: {time_invested_hours:.1f} hours")
        else:
            days = time_invested_hours / 8  # Assume 8-hour workdays
            lines.append(f"⏱️ Time invested: {time_invested_hours:.1f} hours ({days:.1f} days)")
    
    # Add lessons learned
    if lessons_learned and len(lessons_learned) > 0:
        lines.append("")
        lines.append("📚 Lessons learned:")
        for lesson in lessons_learned[:3]:  # Top 3 lessons
            lines.append(f"• {lesson}")
    
    # Add call to action
    lines.append("")
    if platform == "instagram":
        lines.append("Save this for your next project! 📌")
        lines.append("Drop a 🔥 if you're inspired to build something!")
    elif platform == "reddit":
        lines.append("Happy to answer any questions about the build process!")
    elif platform == "facebook":
        lines.append("Feel free to share with fellow woodworkers!")
    
    caption = "\n".join(lines)
    
    # Truncate if needed
    if len(caption) > max_chars:
        caption = caption[:max_chars - 3] + "..."
    
    return caption


def _generate_hashtags(
    materials: List[str],
    techniques: List[str],
    style_tags: List[str],
    platform: str,
) -> List[str]:
    """Generate relevant hashtags."""
    
    hashtags = []
    
    # Add general hashtags
    hashtags.extend(POPULAR_HASHTAGS["general"][:3])
    hashtags.extend(POPULAR_HASHTAGS["cabinets"][:3])
    
    # Add material-specific hashtags
    if materials:
        for material in materials:
            material_lower = material.lower().replace(" ", "")
            if "plywood" in material_lower:
                hashtags.append("plywood")
            elif "mdf" in material_lower:
                hashtags.append("mdf")
            elif "hardwood" in material_lower or "oak" in material_lower or "maple" in material_lower:
                hashtags.append("hardwood")
    
    # Add technique hashtags
    if techniques:
        for technique in techniques[:2]:
            technique_tag = technique.lower().replace(" ", "")
            hashtags.append(f"#{technique_tag}")
    
    # Add style tags
    hashtags.extend(style_tags)
    
    # Remove duplicates and format
    unique_hashtags = []
    seen = set()
    for tag in hashtags:
        formatted = f"#{tag}" if not tag.startswith("#") else tag
        formatted = formatted.lower().replace(" ", "")
        if formatted not in seen:
            seen.add(formatted)
            unique_hashtags.append(formatted)
    
    # Limit based on platform
    if platform == "instagram":
        return unique_hashtags[:30]  # Instagram max
    elif platform == "pinterest":
        return []  # Pinterest doesn't use hashtags
    else:
        return unique_hashtags[:15]


def _suggest_image_layout(
    style: BragSheetStyle,
    before_count: int,
    after_count: int,
    platform: str,
) -> Dict[str, Any]:
    """Suggest optimal image layout for the platform."""
    
    total_images = before_count + after_count
    
    layouts = {
        "instagram": {
            "carousel_max": 10,
            "suggested_ratios": ["4:5", "1:1"],
            "grid_options": ["3x3", "3x1", "1x3"],
        },
        "pinterest": {
            "carousel_max": 5,
            "suggested_ratios": ["2:3", "1:2"],
            "grid_options": ["single"],
        },
        "facebook": {
            "carousel_max": 10,
            "suggested_ratios": ["16:9", "4:3"],
            "grid_options": ["grid"],
        },
        "reddit": {
            "carousel_max": 20,
            "suggested_ratios": ["any"],
            "grid_options": ["album"],
        },
    }
    
    config = layouts.get(platform, layouts["instagram"])
    
    suggestions = {
        "use_carousel": total_images > 1,
        "carousel_count": min(total_images, config["carousel_max"]),
        "suggested_ratio": config["suggested_ratios"][0],
        "ordering": [],
    }
    
    # Suggest ordering based on style
    if style == BragSheetStyle.BEFORE_AFTER:
        suggestions["ordering"] = ["before"] * before_count + ["after"] * after_count
    elif style == BragSheetStyle.PROGRESS_TIMELAPSE:
        suggestions["ordering"] = ["progress"] * total_images
    else:
        suggestions["ordering"] = ["showcase"] * total_images
    
    return suggestions


# ============================================================================
# CONTRACTOR HANDOFF MODE
# ============================================================================

class ContractorDocumentType(str, Enum):
    FULL_SPEC = "full_spec"
    CUT_LIST_ONLY = "cut_list_only"
    MATERIALS_LIST = "materials_list"
    SHOP_DRAWINGS = "shop_drawings"
    CABINET_SCHEDULE = "cabinet_schedule"


class ContractorHandoffDocument(BaseModel):
    project_name: str
    client_name: str
    client_contact: Optional[str] = None
    document_type: ContractorDocumentType
    include_3d_views: bool = True
    include_cut_lists: bool = True
    include_materials: bool = True
    include_hardware: bool = True
    include_assembly_notes: bool = True
    professional_format: bool = True
    include_company_logo: bool = False
    company_name: Optional[str] = None
    company_logo_path: Optional[str] = None


def generate_contractor_handoff(
    project_name: str,
    client_name: str,
    cabinets: List[Dict[str, Any]],
    materials: List[Dict[str, Any]],
    hardware: List[Dict[str, Any]],
    cut_lists: List[Dict[str, Any]],
    document_type: ContractorDocumentType = ContractorDocumentType.FULL_SPEC,
    client_contact: str = None,
    company_name: str = None,
    include_3d_views: bool = True,
    include_assembly_notes: bool = True,
) -> Dict[str, Any]:
    """
    Generate a professional document for cabinetmaker handoff.
    
    Args:
        project_name: Name of the project
        client_name: Client's name
        cabinets: List of cabinet specifications
        materials: List of materials needed
        hardware: List of hardware needed
        cut_lists: Optimized cut lists
        document_type: Type of document to generate
        client_contact: Client contact information
        company_name: Your company name
        include_3d_views: Include 3D renderings
        include_assembly_notes: Include assembly notes
    
    Returns:
        Dictionary with document sections and export info
    """
    
    document = {
        "header": {
            "project_name": project_name,
            "client_name": client_name,
            "client_contact": client_contact,
            "company_name": company_name,
            "generated_date": datetime.now().strftime("%B %d, %Y"),
            "document_type": document_type.value,
            "page_count": 0,
        },
        "sections": [],
        "export_formats": ["pdf", "dxf", "csv"],
    }
    
    # Section 1: Project Summary
    summary = _generate_project_summary(cabinets, materials, hardware)
    document["sections"].append({
        "type": "project_summary",
        "title": "Project Summary",
        "content": summary,
    })
    
    # Section 2: Cabinet Schedule
    if document_type in [ContractorDocumentType.FULL_SPEC, ContractorDocumentType.CABINET_SCHEDULE]:
        cabinet_schedule = _generate_cabinet_schedule(cabinets)
        document["sections"].append({
            "type": "cabinet_schedule",
            "title": "Cabinet Schedule",
            "tables": cabinet_schedule,
        })
    
    # Section 3: Materials List
    if document_type in [ContractorDocumentType.FULL_SPEC, ContractorDocumentType.MATERIALS_LIST]:
        materials_list = _generate_materials_list(materials)
        document["sections"].append({
            "type": "materials_list",
            "title": "Materials List",
            "tables": materials_list,
        })
    
    # Section 4: Hardware List
    if document_type in [ContractorDocumentType.FULL_SPEC]:
        hardware_list = _generate_hardware_list(hardware)
        document["sections"].append({
            "type": "hardware_list",
            "title": "Hardware List",
            "tables": hardware_list,
        })
    
    # Section 5: Cut Lists
    if document_type in [ContractorDocumentType.FULL_SPEC, ContractorDocumentType.CUT_LIST_ONLY]:
        cut_list_section = _generate_cut_list_section(cut_lists)
        document["sections"].append({
            "type": "cut_lists",
            "title": "Cut Lists",
            "sheets": cut_list_section,
        })
    
    # Section 6: Assembly Notes
    if include_assembly_notes and document_type == ContractorDocumentType.FULL_SPEC:
        assembly_notes = _generate_assembly_notes(cabinets)
        document["sections"].append({
            "type": "assembly_notes",
            "title": "Assembly Notes",
            "notes": assembly_notes,
        })
    
    # Section 7: 3D Views (placeholders for image paths)
    if include_3d_views and document_type == ContractorDocumentType.FULL_SPEC:
        document["sections"].append({
            "type": "3d_views",
            "title": "3D Renderings",
            "views": [
                {"name": "Front View", "description": "Front elevation view"},
                {"name": "Side View", "description": "Side elevation view"},
                {"name": "Top View", "description": "Plan view from above"},
                {"name": "Perspective", "description": "3D perspective view"},
            ],
        })
    
    # Calculate page count
    document["header"]["page_count"] = len(document["sections"]) + 1
    
    return document


def _generate_project_summary(
    cabinets: List[Dict],
    materials: List[Dict],
    hardware: List[Dict],
) -> Dict[str, Any]:
    """Generate project summary statistics."""
    
    total_cabinets = len(cabinets)
    total_width = sum(c.get("width", 0) for c in cabinets)
    total_height = sum(c.get("height", 0) for c in cabinets) / max(total_cabinets, 1)
    total_depth = sum(c.get("depth", 0) for c in cabinets) / max(total_cabinets, 1)
    
    # Count cabinet types
    cabinet_types = {}
    for cabinet in cabinets:
        ctype = cabinet.get("type", "unknown")
        cabinet_types[ctype] = cabinet_types.get(ctype, 0) + 1
    
    # Calculate material totals
    material_totals = {}
    for material in materials:
        mtype = material.get("type", "unknown")
        quantity = material.get("quantity", 0)
        material_totals[mtype] = material_totals.get(mtype, 0) + quantity
    
    return {
        "total_cabinets": total_cabinets,
        "linear_feet": round(total_width / 12, 2),
        "average_height_inches": round(total_height, 2),
        "average_depth_inches": round(total_depth, 2),
        "cabinet_types": cabinet_types,
        "material_totals": material_totals,
        "hardware_count": len(hardware),
    }


def _generate_cabinet_schedule(cabinets: List[Dict]) -> List[Dict]:
    """Generate cabinet schedule table."""
    
    schedule = []
    for i, cabinet in enumerate(cabinets, 1):
        schedule.append({
            "mark": f"C{i:03d}",
            "type": cabinet.get("type", "Base Cabinet"),
            "width": cabinet.get("width", 0),
            "height": cabinet.get("height", 0),
            "depth": cabinet.get("depth", 0),
            "material": cabinet.get("material", "Plywood"),
            "finish": cabinet.get("finish", "Paint Grade"),
            "notes": cabinet.get("notes", ""),
        })
    
    return schedule


def _generate_materials_list(materials: List[Dict]) -> List[Dict]:
    """Generate materials list table."""
    
    materials_table = []
    for material in materials:
        materials_table.append({
            "item": material.get("name", "Unknown"),
            "type": material.get("type", "Sheet Goods"),
            "quantity": material.get("quantity", 0),
            "unit": material.get("unit", "sheets"),
            "dimensions": material.get("dimensions", "4x8"),
            "supplier": material.get("supplier", "Local Supplier"),
            "estimated_cost": material.get("cost", 0),
        })
    
    return materials_table


def _generate_hardware_list(hardware: List[Dict]) -> List[Dict]:
    """Generate hardware list table."""
    
    hardware_table = []
    for item in hardware:
        hardware_table.append({
            "item": item.get("name", "Unknown"),
            "type": item.get("type", "Hardware"),
            "quantity": item.get("quantity", 0),
            "unit": item.get("unit", "pcs"),
            "supplier": item.get("supplier", "Various"),
            "part_number": item.get("part_number", ""),
            "estimated_cost": item.get("cost", 0),
        })
    
    return hardware_table


def _generate_cut_list_section(cut_lists: List[Dict]) -> List[Dict]:
    """Generate cut list section."""
    
    sections = []
    for cut_list in cut_lists:
        sections.append({
            "sheet_material": cut_list.get("material", "Plywood"),
            "sheet_dimensions": cut_list.get("sheet_size", "4x8"),
            "sheets_needed": cut_list.get("sheets_needed", 1),
            "parts": cut_list.get("parts", []),
            "waste_percentage": cut_list.get("waste_percentage", 0),
        })
    
    return sections


def _generate_assembly_notes(cabinets: List[Dict]) -> List[str]:
    """Generate assembly notes and tips."""
    
    notes = []
    
    # General notes
    notes.append("General Assembly Notes:")
    notes.append("• Pre-drill all screw holes to prevent splitting")
    notes.append("• Use wood glue on all joints for maximum strength")
    notes.append("• Clamp joints for minimum 30 minutes during glue-up")
    notes.append("• Check for square after each assembly step")
    notes.append("")
    
    # Specific notes based on cabinet types
    cabinet_types = set(c.get("type", "") for c in cabinets)
    
    if "base" in cabinet_types:
        notes.append("Base Cabinet Notes:")
        notes.append("• Install adjustable leg levelers before final positioning")
        notes.append("• Attach to wall studs with 3\" cabinet screws")
        notes.append("• Allow 1/4\" gap above for countertop overhang")
        notes.append("")
    
    if "wall" in cabinet_types:
        notes.append("Wall Cabinet Notes:")
        notes.append("• Mount at 54\" from floor to bottom (standard)")
        notes.append("• Use cabinet hanging rails or French cleat system")
        notes.append("• Ensure level mounting surface")
        notes.append("")
    
    if "tall" in cabinet_types:
        notes.append("Tall Cabinet Notes:")
        notes.append("• Secure to wall at multiple points (top and middle)")
        notes.append("• Consider anti-tip brackets for safety")
        notes.append("• Level base before standing upright")
        notes.append("")
    
    return notes


# ============================================================================
# VERSION HISTORY
# ============================================================================

class VersionChangeType(str, Enum):
    CREATED = "created"
    DIMENSION_CHANGE = "dimension_change"
    MATERIAL_CHANGE = "material_change"
    HARDWARE_CHANGE = "hardware_change"
    COMPONENT_ADDED = "component_added"
    COMPONENT_REMOVED = "component_removed"
    STYLE_CHANGE = "style_change"
    FINISH_CHANGE = "finish_change"
    MAJOR_REVISION = "major_revision"


class ProjectVersion(BaseModel):
    version_id: str
    version_number: int
    timestamp: datetime
    change_type: VersionChangeType
    change_description: str
    changed_by: str
    previous_state: Dict[str, Any]
    current_state: Dict[str, Any]
    notes: Optional[str] = None
    tags: List[str] = []


def create_version_snapshot(
    project_id: str,
    project_data: Dict[str, Any],
    change_type: VersionChangeType,
    change_description: str,
    changed_by: str,
    previous_version: Optional[Dict[str, Any]] = None,
    notes: str = None,
    tags: List[str] = None,
) -> ProjectVersion:
    """
    Create a version snapshot of the project.
    
    Args:
        project_id: Project identifier
        project_data: Current project state
        change_type: Type of change made
        change_description: Human-readable description
        changed_by: User who made the change
        previous_version: Previous version data for comparison
        notes: Optional notes about the change
        tags: Optional tags for categorization
    
    Returns:
        ProjectVersion object
    """
    
    version_number = 1
    if previous_version:
        version_number = previous_version.get("version_number", 0) + 1
    
    version_id = f"{project_id}_v{version_number:04d}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    return ProjectVersion(
        version_id=version_id,
        version_number=version_number,
        timestamp=datetime.now(),
        change_type=change_type,
        change_description=change_description,
        changed_by=changed_by,
        previous_state=previous_version or {},
        current_state=project_data,
        notes=notes,
        tags=tags or [],
    )


def compare_versions(
    version1: Dict[str, Any],
    version2: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Compare two project versions and highlight differences.
    
    Args:
        version1: First version state
        version2: Second version state
    
    Returns:
        Dictionary of differences
    """
    
    differences = {
        "cabinets_added": [],
        "cabinets_removed": [],
        "cabinets_modified": [],
        "materials_changed": [],
        "hardware_changed": [],
        "dimensions_changed": [],
        "other_changes": [],
    }
    
    # Compare cabinets
    v1_cabinets = {c.get("id"): c for c in version1.get("cabinets", [])}
    v2_cabinets = {c.get("id"): c for c in version2.get("cabinets", [])}
    
    v1_ids = set(v1_cabinets.keys())
    v2_ids = set(v2_cabinets.keys())
    
    differences["cabinets_added"] = list(v2_ids - v1_ids)
    differences["cabinets_removed"] = list(v1_ids - v2_ids)
    
    for cid in v1_ids & v2_ids:
        c1, c2 = v1_cabinets[cid], v2_cabinets[cid]
        if c1 != c2:
            changes = {}
            for key in set(c1.keys()) | set(c2.keys()):
                if c1.get(key) != c2.get(key):
                    changes[key] = {
                        "from": c1.get(key),
                        "to": c2.get(key),
                    }
            differences["cabinets_modified"].append({
                "cabinet_id": cid,
                "changes": changes,
            })
    
    # Compare materials
    v1_materials = set(m.get("name") for m in version1.get("materials", []))
    v2_materials = set(m.get("name") for m in version2.get("materials", []))
    
    if v1_materials != v2_materials:
        differences["materials_changed"] = {
            "added": list(v2_materials - v1_materials),
            "removed": list(v1_materials - v2_materials),
        }
    
    # Compare hardware
    v1_hardware = set(h.get("name") for h in version1.get("hardware", []))
    v2_hardware = set(h.get("name") for h in version2.get("hardware", []))
    
    if v1_hardware != v2_hardware:
        differences["hardware_changed"] = {
            "added": list(v2_hardware - v1_hardware),
            "removed": list(v1_hardware - v2_hardware),
        }
    
    return differences


def generate_version_timeline(
    versions: List[ProjectVersion],
) -> Dict[str, Any]:
    """
    Generate a timeline visualization of project versions.
    
    Args:
        versions: List of ProjectVersion objects
    
    Returns:
        Timeline data for visualization
    """
    
    timeline = {
        "versions": [],
        "milestones": [],
        "statistics": {
            "total_versions": len(versions),
            "major_revisions": 0,
            "minor_changes": 0,
            "contributors": set(),
        },
    }
    
    for version in versions:
        entry = {
            "version_id": version.version_id,
            "version_number": version.version_number,
            "timestamp": version.timestamp.isoformat(),
            "change_type": version.change_type.value,
            "change_description": version.change_description,
            "changed_by": version.changed_by,
            "notes": version.notes,
        }
        
        timeline["versions"].append(entry)
        timeline["statistics"]["contributors"].add(version.changed_by)
        
        if version.change_type == VersionChangeType.MAJOR_REVISION:
            timeline["statistics"]["major_revisions"] += 1
            timeline["milestones"].append(entry)
        else:
            timeline["statistics"]["minor_changes"] += 1
    
    timeline["statistics"]["contributors"] = list(timeline["statistics"]["contributors"])
    
    return timeline


def restore_version(
    project_data: Dict[str, Any],
    target_version: Dict[str, Any],
    create_backup: bool = True,
) -> Dict[str, Any]:
    """
    Restore project to a previous version.
    
    Args:
        project_data: Current project state
        target_version: Version to restore to
        create_backup: Whether to create backup of current state
    
    Returns:
        Restored project state
    """
    
    if create_backup:
        backup = {
            "backup_of": project_data.get("project_id"),
            "backup_timestamp": datetime.now().isoformat(),
            "backup_data": project_data,
        }
        # In a real implementation, save backup to database
    
    # Restore from target version
    restored = target_version.get("current_state", target_version)
    restored["restored_from"] = target_version.get("version_id")
    restored["restored_at"] = datetime.now().isoformat()
    
    return restored


def branch_version(
    version: ProjectVersion,
    branch_name: str,
    branched_by: str,
) -> Dict[str, Any]:
    """
    Create a branch from a specific version.
    
    Args:
        version: Version to branch from
        branch_name: Name for the new branch
        branched_by: User creating the branch
    
    Returns:
        New branched project data
    """
    
    branch = {
        "branch_id": f"{version.version_id}_branch_{branch_name}",
        "branch_name": branch_name,
        "branched_from": version.version_id,
        "branched_at": datetime.now().isoformat(),
        "branched_by": branched_by,
        "project_data": version.current_state,
        "versions": [],
    }
    
    return branch
