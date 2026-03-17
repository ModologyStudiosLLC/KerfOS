"""Design Doctor - Detects common cabinet design mistakes before building."""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Literal
from enum import Enum
import math


class IssueSeverity(Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class IssueCategory(Enum):
    STRUCTURAL = "structural"
    CLEARANCE = "clearance"
    HARDWARE = "hardware"
    MATERIAL = "material"
    SAFETY = "safety"
    AESTHETICS = "aesthetics"


@dataclass
class DesignSuggestion:
    title: str
    description: str
    auto_fixable: bool = False
    fix: Dict[str, Any] = field(default_factory=dict)


@dataclass
class DesignIssue:
    id: str
    title: str
    description: str
    severity: IssueSeverity
    category: IssueCategory
    details: Dict[str, Any] = field(default_factory=dict)
    suggestions: List[DesignSuggestion] = field(default_factory=list)


@dataclass
class DesignDoctorResult:
    issues: List[DesignIssue]
    total_issues: int
    critical_count: int
    warning_count: int
    info_count: int
    score: int
    tips: List[str] = field(default_factory=list)


class DesignDoctor:
    """Analyzes cabinet designs for common mistakes and issues."""
    
    # Maximum unsupported span for different materials (in inches)
    MAX_SPANS = {
        'plywood_3_4': 36,  # 3/4" plywood
        'plywood_1_2': 24,  # 1/2" plywood
        'mdf_3_4': 30,
        'mdf_1_2': 20,
        'particleboard_3_4': 24,
        'solid_wood': 48,
    }
    
    # Minimum clearances (in inches)
    MIN_DRAWER_CLEARANCE = 1.0
    MIN_DOOR_CLEARANCE = 0.125
    MIN_SHELF_CLEARANCE = 0.5
    
    # Hardware requirements
    MIN_DRAWER_SLIDE_LENGTH = 12
    MIN_HINGE_OFFSET = 0.125
    
    def scan(self, design: Dict[str, Any]) -> DesignDoctorResult:
        """Scan a cabinet design for issues."""
        issues: List[DesignIssue] = []
        
        # Run all checks
        issues.extend(self._check_structural_issues(design))
        issues.extend(self._check_clearance_issues(design))
        issues.extend(self._check_hardware_issues(design))
        issues.extend(self._check_material_issues(design))
        issues.extend(self._check_safety_issues(design))
        issues.extend(self._check_aesthetic_issues(design))
        
        # Calculate summary
        critical = sum(1 for i in issues if i.severity == IssueSeverity.CRITICAL)
        warning = sum(1 for i in issues if i.severity == IssueSeverity.WARNING)
        info = sum(1 for i in issues if i.severity == IssueSeverity.INFO)
        
        # Calculate health score (0-100)
        score = max(0, 100 - (critical * 20) - (warning * 5) - (info * 2))
        
        # Generate tips
        tips = self._generate_tips(design, issues)
        
        return DesignDoctorResult(
            issues=issues,
            total_issues=len(issues),
            critical_count=critical,
            warning_count=warning,
            info_count=info,
            score=score,
            tips=tips
        )
    
    def _check_structural_issues(self, design: Dict[str, Any]) -> List[DesignIssue]:
        """Check for structural problems."""
        issues = []
        width = design.get('width', 0)
        height = design.get('height', 0)
        depth = design.get('depth', 0)
        material = design.get('material', 'plywood_3_4')
        
        # Check shelf spans
        shelves = design.get('shelves', [])
        for i, shelf in enumerate(shelves):
            span = width - 1.5  # Account for sides
            max_span = self.MAX_SPANS.get(material, 36)
            
            if span > max_span:
                issues.append(DesignIssue(
                    id=f"shelf_span_{i}",
                    title="Shelf Span Too Wide",
                    description=f"Shelf {i+1} span ({span:.1f}") exceeds maximum recommended ({max_span}") without support",
                    severity=IssueSeverity.WARNING if span <= max_span * 1.2 else IssueSeverity.CRITICAL,
                    category=IssueCategory.STRUCTURAL,
                    details={
                        'shelf_index': i,
                        'current_span': span,
                        'max_span': max_span,
                        'material': material
                    },
                    suggestions=[
                        DesignSuggestion(
                            title="Add center support",
                            description="Add a vertical divider or center stile to support the shelf",
                            auto_fixable=False
                        ),
                        DesignSuggestion(
                            title="Use thicker material",
                            description="Switch to 1" thick material or add edge banding for strength",
                            auto_fixable=False
                        )
                    ]
                ))
        
        # Check for top support on tall cabinets
        if height > 84 and not design.get('has_top_support', False):
            issues.append(DesignIssue(
                id="tall_cabinet_support",
                title="Tall Cabinet Needs Support",
                description=f"Cabinet height ({height}") is over 7 feet and may need additional support",
                severity=IssueSeverity.WARNING,
                category=IssueCategory.STRUCTURAL,
                details={'height': height},
                suggestions=[
                    DesignSuggestion(
                        title="Add top rail",
                        description="Add a structural top rail across the cabinet width",
                        auto_fixable=False
                    )
                ]
            ))
        
        # Check for face frame strength
        if design.get('style') == 'face_frame':
            face_frame_width = design.get('face_frame_width', 1.5)
            if face_frame_width < 1.5:
                issues.append(DesignIssue(
                    id="face_frame_thin",
                    title="Face Frame Too Thin",
                    description="Face frame stiles should be at least 1.5" wide for strength",
                    severity=IssueSeverity.WARNING,
                    category=IssueCategory.STRUCTURAL,
                    details={'current_width': face_frame_width},
                    suggestions=[
                        DesignSuggestion(
                            title="Increase face frame width",
                            description="Set face frame stiles to 1.5" or wider",
                            auto_fixable=True,
                            fix={'face_frame_width': 1.5}
                        )
                    ]
                ))
        
        return issues
    
    def _check_clearance_issues(self, design: Dict[str, Any]) -> List[DesignIssue]:
        """Check for clearance problems."""
        issues = []
        width = design.get('width', 0)
        height = design.get('height', 0)
        
        # Check drawer clearances
        drawers = design.get('drawers', [])
        for i, drawer in enumerate(drawers):
            drawer_height = drawer.get('height', 0)
            # Check if drawer box height allows for slides
            slide_clearance = drawer.get('slide_clearance', 0.5)
            if slide_clearance < self.MIN_DRAWER_CLEARANCE:
                issues.append(DesignIssue(
                    id=f"drawer_clearance_{i}",
                    title="Drawer Slide Clearance Issue",
                    description=f"Drawer {i+1} doesn't have enough clearance for drawer slides",
                    severity=IssueSeverity.CRITICAL,
                    category=IssueCategory.CLEARANCE,
                    details={
                        'drawer_index': i,
                        'current_clearance': slide_clearance,
                        'required_clearance': self.MIN_DRAWER_CLEARANCE
                    },
                    suggestions=[
                        DesignSuggestion(
                            title="Reduce drawer box height",
                            description=f"Reduce drawer box height by {self.MIN_DRAWER_CLEARANCE - slide_clearance:.2f}",
                            auto_fixable=True,
                            fix={'drawers': {i: {'height': drawer_height - (self.MIN_DRAWER_CLEARANCE - slide_clearance)}}}
                        )
                    ]
                ))
        
        # Check door swing clearance
        doors = design.get('doors', [])
        adjacent_obstructions = design.get('adjacent_obstructions', [])
        
        for i, door in enumerate(doors):
            door_width = door.get('width', width / 2)
            swing_arc = door_width  # Full swing arc
            
            # Check for corner cabinet door swing
            if design.get('is_corner_cabinet'):
                issues.append(DesignIssue(
                    id=f"corner_door_swing_{i}",
                    title="Corner Cabinet Door May Not Open Fully",
                    description="Corner cabinet doors need careful planning for full access",
                    severity=IssueSeverity.INFO,
                    category=IssueCategory.CLEARANCE,
                    details={'door_index': i},
                    suggestions=[
                        DesignSuggestion(
                            title="Consider bi-fold doors",
                            description="Bi-fold doors work well for corner cabinets",
                            auto_fixable=False
                        )
                    ]
                ))
        
        # Check for appliance clearances
        if design.get('is_appliance_garage'):
            min_height = design.get('appliance_height', 0) + 2
            if height < min_height:
                issues.append(DesignIssue(
                    id="appliance_clearance",
                    title="Appliance Garage Too Short",
                    description=f"Height ({height}") may be too short for your appliances",
                    severity=IssueSeverity.WARNING,
                    category=IssueCategory.CLEARANCE,
                    details={'current_height': height, 'recommended_height': min_height},
                    suggestions=[
                        DesignSuggestion(
                            title="Increase cabinet height",
                            description=f"Increase height to at least {min_height}",
                            auto_fixable=True,
                            fix={'height': min_height}
                        )
                    ]
                ))
        
        return issues
    
    def _check_hardware_issues(self, design: Dict[str, Any]) -> List[DesignIssue]:
        """Check for hardware compatibility problems."""
        issues = []
        width = design.get('width', 0)
        depth = design.get('depth', 0)
        
        # Check drawer slide availability
        drawers = design.get('drawers', [])
        for i, drawer in enumerate(drawers):
            drawer_depth = drawer.get('depth', depth - 1)
            slide_length = drawer.get('slide_length', drawer_depth)
            
            # Standard slide lengths: 12, 14, 15, 16, 18, 20, 21, 22, 24
            standard_lengths = [12, 14, 15, 16, 18, 20, 21, 22, 24]
            
            if slide_length not in standard_lengths:
                # Find nearest standard length
                nearest = min(standard_lengths, key=lambda x: abs(x - slide_length))
                issues.append(DesignIssue(
                    id=f"slide_length_{i}",
                    title="Non-Standard Drawer Slide Length",
                    description=f"Drawer {i+1} slide length ({slide_length}") is not a standard size. Nearest: {nearest}",
                    severity=IssueSeverity.INFO,
                    category=IssueCategory.HARDWARE,
                    details={
                        'drawer_index': i,
                        'current_length': slide_length,
                        'nearest_standard': nearest
                    },
                    suggestions=[
                        DesignSuggestion(
                            title=f"Use {nearest}" slides",
                            description=f"Standard {nearest}" slides are readily available and cost-effective",
                            auto_fixable=True,
                            fix={'drawers': {i: {'slide_length': nearest}}}
                        )
                    ]
                ))
        
        # Check for hinge conflicts with pullouts
        if design.get('has_pullouts') and design.get('door_type') == 'overlay':
            issues.append(DesignIssue(
                id="hinge_pullout_conflict",
                title="Hinge May Conflict with Pullout",
                description="Overlay doors with pullouts need hidden hinges or careful hinge placement",
                severity=IssueSeverity.WARNING,
                category=IssueCategory.HARDWARE,
                suggestions=[
                    DesignSuggestion(
                        title="Use hidden hinges (Blumotion)",
                        description="Blum concealed hinges with soft-close work well with pullouts",
                        auto_fixable=False
                    ),
                    DesignSuggestion(
                        title="Use face frame hinges",
                        description="Face frame mounted hinges provide more clearance",
                        auto_fixable=False
                    )
                ]
            ))
        
        # Check for lazy susan hardware
        if design.get('is_corner_cabinet') and design.get('has_lazy_susan'):
            issues.append(DesignIssue(
                id="lazy_susan_size",
                title="Check Lazy Susan Size",
                description=f"Verify lazy susan diameter fits in {width}" corner cabinet",
                severity=IssueSeverity.INFO,
                category=IssueCategory.HARDWARE,
                suggestions=[
                    DesignSuggestion(
                        title="Common lazy susan sizes",
                        description="26" to 32" diameter lazy susans are common for 36" corner cabinets",
                        auto_fixable=False
                    )
                ]
            ))
        
        return issues
    
    def _check_material_issues(self, design: Dict[str, Any]) -> List[DesignIssue]:
        """Check for material-related problems."""
        issues = []
        material = design.get('material', 'plywood_3_4')
        
        # Check for moisture-prone areas
        if design.get('location') == 'bathroom':
            if material in ['particleboard_3_4', 'mdf_3_4', 'mdf_1_2']:
                issues.append(DesignIssue(
                    id="moisture_material",
                    title="Material Not Suitable for Bathroom",
                    description="Particleboard and MDF can swell in humid bathroom environments",
                    severity=IssueSeverity.WARNING,
                    category=IssueCategory.MATERIAL,
                    details={'current_material': material},
                    suggestions=[
                        DesignSuggestion(
                            title="Use moisture-resistant plywood",
                            description="Marine-grade or exterior plywood resists moisture better",
                            auto_fixable=True,
                            fix={'material': 'plywood_3_4'}
                        ),
                        DesignSuggestion(
                            title="Apply waterproof finish",
                            description="Seal all edges with polyurethane or similar",
                            auto_fixable=False
                        )
                    ]
                ))
        
        # Check for paint grade vs stain grade
        if design.get('finish_type') == 'stain':
            if material in ['mdf_3_4', 'particleboard_3_4']:
                issues.append(DesignIssue(
                    id="stain_material",
                    title="Material Not Suitable for Staining",
                    description="MDF and particleboard cannot be stained like real wood",
                    severity=IssueSeverity.WARNING,
                    category=IssueCategory.MATERIAL,
                    suggestions=[
                        DesignSuggestion(
                            title="Use real wood veneer plywood",
                            description="Oak, maple, or birch plywood can be stained beautifully",
                            auto_fixable=True,
                            fix={'material': 'oak_plywood_3_4'}
                        )
                    ]
                ))
        
        # Check edge banding requirements
        if design.get('has_exposed_edges') and material in ['plywood_3_4', 'oak_plywood_3_4']:
            if not design.get('edge_banding_type'):
                issues.append(DesignIssue(
                    id="edge_banding_missing",
                    title="Edge Banding Needed",
                    description="Plywood edges should be banded for a finished look",
                    severity=IssueSeverity.INFO,
                    category=IssueCategory.MATERIAL,
                    suggestions=[
                        DesignSuggestion(
                            title="Add edge banding",
                            description="Iron-on veneer edge banding is easy to apply",
                            auto_fixable=False
                        )
                    ]
                ))
        
        return issues
    
    def _check_safety_issues(self, design: Dict[str, Any]) -> List[DesignIssue]:
        """Check for safety concerns."""
        issues = []
        height = design.get('height', 0)
        width = design.get('width', 0)
        
        # Check for tip-over risk on tall cabinets
        if height > 60 and depth < 18:
            issues.append(DesignIssue(
                id="tip_over_risk",
                title="Potential Tip-Over Risk",
                description=f"Tall cabinet ({height}" high) with shallow depth ({depth}") may be unstable",
                severity=IssueSeverity.CRITICAL,
                category=IssueCategory.SAFETY,
                details={'height': height, 'depth': depth},
                suggestions=[
                    DesignSuggestion(
                        title="Add wall anchoring",
                        description="Install anti-tip brackets and secure to wall studs",
                        auto_fixable=False
                    ),
                    DesignSuggestion(
                        title="Increase cabinet depth",
                        description="Deeper cabinets are more stable",
                        auto_fixable=True,
                        fix={'depth': 18}
                    )
                ]
            ))
        
        # Check for wall cabinet height
        if design.get('is_wall_cabinet') and height > 42:
            issues.append(DesignIssue(
                id="wall_cabinet_height",
                title="Very Tall Wall Cabinet",
                description=f"Wall cabinet height ({height}") is taller than standard (30-42")",
                severity=IssueSeverity.WARNING,
                category=IssueCategory.SAFETY,
                suggestions=[
                    DesignSuggestion(
                        title="Verify mounting",
                        description="Use multiple wall studs and heavy-duty mounting hardware",
                        auto_fixable=False
                    )
                ]
            ))
        
        # Check for glass door safety
        if design.get('door_type') == 'glass':
            issues.append(DesignIssue(
                id="glass_safety",
                title="Consider Tempered Glass",
                description="Glass doors should use tempered or safety glass",
                severity=IssueSeverity.WARNING,
                category=IssueCategory.SAFETY,
                suggestions=[
                    DesignSuggestion(
                        title="Order tempered glass",
                        description="Tempered glass shatters into small pieces instead of sharp shards",
                        auto_fixable=False
                    )
                ]
            ))
        
        return issues
    
    def _check_aesthetic_issues(self, design: Dict[str, Any]) -> List[DesignIssue]:
        """Check for aesthetic concerns."""
        issues = []
        width = design.get('width', 0)
        
        # Check for odd-width doors
        doors = design.get('doors', [])
        if len(doors) == 2:  # Two-door cabinet
            door_widths = [d.get('width', width/2) for d in doors]
            if abs(door_widths[0] - door_widths[1]) > 0.5:
                issues.append(DesignIssue(
                    id="uneven_doors",
                    title="Uneven Door Widths",
                    description="Doors have different widths which may look unbalanced",
                    severity=IssueSeverity.INFO,
                    category=IssueCategory.AESTHETICS,
                    details={'door_widths': door_widths},
                    suggestions=[
                        DesignSuggestion(
                            title="Make doors equal width",
                            description=f"Set both doors to {width/2:.2f}" wide",
                            auto_fixable=True,
                            fix={'doors': [{}, {}]}  # Would need actual implementation
                        )
                    ]
                ))
        
        # Check for drawer height progression
        drawers = design.get('drawers', [])
        if len(drawers) >= 3:
            heights = [d.get('height', 0) for d in drawers]
            # Graduated drawers should increase in height from top to bottom
            if heights == sorted(heights):
                issues.append(DesignIssue(
                    id="drawer_progression",
                    title="Consider Graduated Drawers",
                    description="Stacked drawers often look better with graduated heights (smaller on top)",
                    severity=IssueSeverity.INFO,
                    category=IssueCategory.AESTHETICS,
                    suggestions=[
                        DesignSuggestion(
                            title="Use standard progression",
                            description="Top: 5", Middle: 7", Bottom: 9" for a 3-drawer stack",
                            auto_fixable=False
                        )
                    ]
                ))
        
        return issues
    
    def _generate_tips(self, design: Dict[str, Any], issues: List[DesignIssue]) -> List[str]:
        """Generate helpful tips based on the design."""
        tips = []
        
        # Add general tips
        tips.append("Always dry-fit your pieces before final assembly")
        
        if design.get('style') == 'frameless':
            tips.append("Frameless cabinets require precise 32mm system hole drilling")
        
        if design.get('has_drawers'):
            tips.append("Install drawer slides before assembling the cabinet box")
        
        if len(issues) == 0:
            tips.append("Great design! No issues found")
        else:
            tips.append(f"{len(issues)} issue(s) found - review before building")
        
        return tips


# FastAPI router for the design doctor endpoints
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

router = APIRouter(prefix="/api/design-doctor", tags=["design-doctor"])

class ScanRequest(BaseModel):
    design: Dict[str, Any]

class ScanResponse(BaseModel):
    issues: List[Dict[str, Any]]
    total_issues: int
    critical_count: int
    warning_count: int
    info_count: int
    score: int
    tips: List[str]

@router.post("/scan", response_model=ScanResponse)
async def scan_design(request: ScanRequest):
    """Scan a cabinet design for issues."""
    doctor = DesignDoctor()
    result = doctor.scan(request.design)
    
    return ScanResponse(
        issues=[
            {
                "id": issue.id,
                "title": issue.title,
                "description": issue.description,
                "severity": issue.severity.value,
                "category": issue.category.value,
                "details": issue.details,
                "suggestions": [
                    {
                        "title": s.title,
                        "description": s.description,
                        "autoFixable": s.auto_fixable,
                        "fix": s.fix
                    }
                    for s in issue.suggestions
                ]
            }
            for issue in result.issues
        ],
        total_issues=result.total_issues,
        critical_count=result.critical_count,
        warning_count=result.warning_count,
        info_count=result.info_count,
        score=result.score,
        tips=result.tips
    )