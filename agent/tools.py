"""Tools the KerfOS assistant can call. Numbers come from the KerfOS backend, never from the model."""
import os

import httpx
from langchain_core.tools import tool

KERFOS_API_URL = os.environ.get("KERFOS_API_URL", "http://localhost:8000")
PLY = 0.75  # carcass material thickness, inches


def base_cabinet_parts(width: float, height: float, depth: float, material_id: str) -> list[dict]:
    """Standard frameless base cabinet carcass: two sides, a bottom, two stretchers and a back."""
    inner = width - 2 * PLY
    return [
        {"name": "Side", "width": depth, "height": height, "qty": 2, "material_id": material_id},
        {"name": "Bottom", "width": inner, "height": depth, "qty": 1, "material_id": material_id},
        {"name": "Stretcher", "width": inner, "height": 3.0, "qty": 2, "material_id": material_id},
        {"name": "Back", "width": inner, "height": height - PLY, "qty": 1, "material_id": material_id},
    ]


@tool
def list_materials() -> list[dict]:
    """List the sheet and lumber materials KerfOS can price: id, name, price per sheet or per square foot."""
    r = httpx.get(f"{KERFOS_API_URL}/api/materials", timeout=15)
    r.raise_for_status()
    body = r.json()
    items = body.get("materials") or body.get("items") or body
    return [
        {k: m.get(k) for k in ("id", "name", "category", "thickness", "price_per_sheet", "price_per_sq_ft")}
        for m in items
    ]


@tool
def quote_base_cabinet(width: float, height: float, depth: float, material_id: str, count: int = 1) -> dict:
    """Quote a standard base cabinet carcass (inches) in one material, using the real cut list optimizer.

    Assumes 3/4" material, two sides, a bottom, two 3" stretchers and a back. Returns sheets needed,
    subtotal, tax and total from the KerfOS backend.
    """
    parts = base_cabinet_parts(width, height, depth, material_id)
    for p in parts:
        p["qty"] *= count
    r = httpx.post(f"{KERFOS_API_URL}/api/quote", json=parts, timeout=15)
    if r.status_code == 400:
        return {"error": r.json().get("detail", "Quote rejected")}
    r.raise_for_status()
    return {"parts": parts, "quote": r.json()}
