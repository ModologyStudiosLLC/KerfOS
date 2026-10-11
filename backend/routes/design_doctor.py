"""Design Doctor route — inline DFM analysis, called on every assembly change."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.design_doctor import DesignDoctor

router = APIRouter(prefix="/design-doctor", tags=["design-doctor"])
_doctor = DesignDoctor()


# ─── Request / response models ────────────────────────────────────────────────

class ComponentIn(BaseModel):
    id: str
    type: str  # box | door | drawer | shelf | divider | toe-kick
    name: str
    width: float
    height: float
    depth: float


class ScanRequest(BaseModel):
    id: str
    name: str
    width: float
    height: float
    depth: float
    material: str
    components: list[ComponentIn] = []


class ViolationOut(BaseModel):
    component_id: str
    severity: str  # critical | warning | info
    title: str
    description: str


class ScanResponse(BaseModel):
    score: int
    violations: list[ViolationOut]   # component-level
    cabinet_issues: list[ViolationOut]  # cabinet-level (no specific component)
    total_issues: int
    critical_count: int
    warning_count: int


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _material_key(name: str) -> str:
    """Map friendly material name to DesignDoctor key."""
    n = name.lower()
    if "mdf" in n:
        return "mdf_3_4"
    if "hardwood" in n or "oak" in n or "maple" in n or "walnut" in n:
        return "solid_wood"
    return "plywood_3_4"


def _build_design(req: ScanRequest) -> dict:
    """Translate frontend component shape into what DesignDoctor expects."""
    shelves  = [c for c in req.components if c.type == "shelf"]
    drawers  = [c for c in req.components if c.type == "drawer"]
    doors    = [c for c in req.components if c.type == "door"]
    dividers = [c for c in req.components if c.type == "divider"]

    return {
        "id": req.id,
        "name": req.name,
        "width": req.width,
        "height": req.height,
        "depth": req.depth,
        "material": _material_key(req.material),
        "shelves":  [{"id": c.id, "width": c.width, "height": c.height, "depth": c.depth} for c in shelves],
        "drawers":  [{"id": c.id, "width": c.width, "height": c.height, "depth": c.depth} for c in drawers],
        "doors":    [{"id": c.id, "width": c.width, "height": c.height, "depth": c.depth} for c in doors],
        "dividers": [{"id": c.id, "width": c.width, "height": c.height, "depth": c.depth} for c in dividers],
    }


def _comp_id_for_issue(issue, req: ScanRequest) -> Optional[str]:
    """Try to map an issue to a specific component ID."""
    details = issue.details or {}

    # Shelf span issues — indexed by shelf_index
    if "shelf_index" in details:
        shelves = [c for c in req.components if c.type == "shelf"]
        idx = details["shelf_index"]
        if idx < len(shelves):
            return shelves[idx].id

    # Drawer issues
    if "drawer_index" in details:
        drawers = [c for c in req.components if c.type == "drawer"]
        idx = details["drawer_index"]
        if idx < len(drawers):
            return drawers[idx].id

    # Door issues
    if "door_index" in details:
        doors = [c for c in req.components if c.type == "door"]
        idx = details["door_index"]
        if idx < len(doors):
            return doors[idx].id

    return None


# ─── Route ────────────────────────────────────────────────────────────────────

@router.post("/scan", response_model=ScanResponse)
async def scan(req: ScanRequest):
    design = _build_design(req)
    result = _doctor.scan(design)

    violations: list[ViolationOut] = []
    cabinet_issues: list[ViolationOut] = []

    for issue in result.issues:
        comp_id = _comp_id_for_issue(issue, req)
        out = ViolationOut(
            component_id=comp_id or "",
            severity=issue.severity.value,
            title=issue.title,
            description=issue.description,
        )
        if comp_id:
            violations.append(out)
        else:
            cabinet_issues.append(out)

    return ScanResponse(
        score=result.score,
        violations=violations,
        cabinet_issues=cabinet_issues,
        total_issues=result.total_issues,
        critical_count=result.critical_count,
        warning_count=result.warning_count,
    )
