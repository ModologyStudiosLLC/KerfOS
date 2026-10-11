from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.cutlist_optimizer import CutListOptimizer, Component
from .materials import CATALOG

router = APIRouter(prefix="/api/quote", tags=["quote"])

SHEET_W = 48.0
SHEET_H = 96.0
WASTE_FACTOR = 0.15   # 15% kerf + offcuts
DEFAULT_TAX = 0.08


def _find_material(material_id: str) -> dict:
    for m in CATALOG:
        if m["id"] == material_id:
            return m
    return None


def _sheets_needed(parts: list[dict], sheet_w: float, sheet_h: float) -> int:
    """Sheets required, from the real cut list optimizer (guillotine packing, rotation allowed)."""
    components = [
        Component(id=str(i), name=p["name"], width=p["width"], height=p["height"], quantity=1, material_id="quote")
        for i, p in enumerate(parts)
    ]
    try:
        return CutListOptimizer(sheet_dims=(sheet_w, sheet_h)).optimize(components).total_sheets
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


class PartIn(BaseModel):
    name: str = Field(max_length=100)
    width: float = Field(gt=0, le=240)    # inches
    height: float = Field(gt=0, le=240)   # inches
    qty: int = Field(default=1, ge=1, le=500)
    material_id: str = Field(max_length=100)


class LineItemOut(BaseModel):
    material_id: str
    material_name: str
    sheets_needed: int
    price_per_sheet: Optional[float]
    price_per_sq_ft: float
    sq_ft_used: float
    subtotal: float


class QuoteResponse(BaseModel):
    line_items: list[LineItemOut]
    materials_subtotal: float
    waste_factor_pct: float
    tax_rate_pct: float
    tax: float
    total: float
    part_count: int
    notes: str


@router.post("", response_model=QuoteResponse)
async def instant_quote(parts: list[PartIn], tax_rate: Optional[float] = None):
    if not parts or len(parts) > 100:
        raise HTTPException(status_code=400, detail="Provide between 1 and 100 parts")

    tax_rate = tax_rate if tax_rate is not None else DEFAULT_TAX

    # Group parts by material
    groups: dict[str, list[dict]] = {}
    for p in parts:
        mat = _find_material(p.material_id)
        if not mat:
            raise HTTPException(status_code=400, detail=f"Unknown material_id: {p.material_id}")
        groups.setdefault(p.material_id, [])
        for _ in range(p.qty):
            groups[p.material_id].append({"name": p.name, "width": p.width, "height": p.height})

    line_items: list[LineItemOut] = []
    materials_subtotal = 0.0

    for mat_id, mat_parts in groups.items():
        mat = _find_material(mat_id)
        sw = mat["sheet_width"] or SHEET_W
        sh = mat["sheet_height"] or SHEET_H

        sheets = _sheets_needed(mat_parts, sw, sh)
        sq_ft_used = sum(p["width"] * p["height"] for p in mat_parts) / 144.0

        if mat["price_per_sheet"]:
            subtotal = sheets * mat["price_per_sheet"] * (1 + WASTE_FACTOR)
        else:
            # Hardwood: price by sq ft used + waste
            subtotal = sq_ft_used * mat["price_per_sq_ft"] * (1 + WASTE_FACTOR)

        materials_subtotal += subtotal
        line_items.append(LineItemOut(
            material_id=mat_id,
            material_name=mat["name"],
            sheets_needed=sheets,
            price_per_sheet=mat["price_per_sheet"],
            price_per_sq_ft=mat["price_per_sq_ft"],
            sq_ft_used=round(sq_ft_used, 2),
            subtotal=round(subtotal, 2),
        ))

    materials_subtotal = round(materials_subtotal, 2)
    tax = round(materials_subtotal * tax_rate, 2)
    total = round(materials_subtotal + tax, 2)
    part_count = sum(p.qty for p in parts)

    return QuoteResponse(
        line_items=line_items,
        materials_subtotal=materials_subtotal,
        waste_factor_pct=WASTE_FACTOR * 100,
        tax_rate_pct=tax_rate * 100,
        tax=tax,
        total=total,
        part_count=part_count,
        notes="15% waste factor included. Sheet count comes from the cut list optimizer.",
    )
