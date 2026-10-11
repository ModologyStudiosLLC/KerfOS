from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/api/materials", tags=["materials"])

LAST_UPDATED = "2026-04-20"

# Realistic US market pricing as of Q1 2026
# Sheet goods: price_per_sheet for 4×8 sheet
# Hardwoods: price_per_board_foot converted to price_per_sq_ft at given thickness
CATALOG = [
    # ── Sheet Goods ───────────────────────────────────────────────────────────
    {
        "id": "sg-001",
        "name": "Birch Plywood 3/4\"",
        "category": "sheet_goods",
        "type": "plywood",
        "species": "Birch",
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 72.00,
        "price_per_sq_ft": 1.875,
        "supplier": "Home Depot / Lowe's",
        "sku_hint": "Purebond Birch",
        "notes": "Cabinet-grade, void-free core",
    },
    {
        "id": "sg-002",
        "name": "Birch Plywood 1/2\"",
        "category": "sheet_goods",
        "type": "plywood",
        "species": "Birch",
        "thickness": 0.5,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 58.00,
        "price_per_sq_ft": 1.51,
        "supplier": "Home Depot / Lowe's",
        "sku_hint": "Purebond Birch",
        "notes": "Drawer boxes, cabinet backs",
    },
    {
        "id": "sg-003",
        "name": "Birch Plywood 1/4\"",
        "category": "sheet_goods",
        "type": "plywood",
        "species": "Birch",
        "thickness": 0.25,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 38.00,
        "price_per_sq_ft": 0.99,
        "supplier": "Home Depot / Lowe's",
        "sku_hint": "Purebond Birch",
        "notes": "Cabinet backs, drawer bottoms",
    },
    {
        "id": "sg-004",
        "name": "Maple Plywood 3/4\"",
        "category": "sheet_goods",
        "type": "plywood",
        "species": "Maple",
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 89.00,
        "price_per_sq_ft": 2.32,
        "supplier": "Woodcraft / Rockler",
        "sku_hint": "Purebond Maple",
        "notes": "Premium face, no formaldehyde",
    },
    {
        "id": "sg-005",
        "name": "Oak Plywood 3/4\"",
        "category": "sheet_goods",
        "type": "plywood",
        "species": "Oak",
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 94.00,
        "price_per_sq_ft": 2.45,
        "supplier": "Woodcraft / Rockler",
        "sku_hint": "Red Oak veneer plywood",
        "notes": "Common face veneer, good match to solid oak trim",
    },
    {
        "id": "sg-006",
        "name": "MDF 3/4\"",
        "category": "sheet_goods",
        "type": "mdf",
        "species": None,
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 52.00,
        "price_per_sq_ft": 1.35,
        "supplier": "Home Depot / Lowe's",
        "sku_hint": "Standard MDF",
        "notes": "Flat, stable, paintable — heavy (97 lbs/sheet)",
    },
    {
        "id": "sg-007",
        "name": "MDF 1/2\"",
        "category": "sheet_goods",
        "type": "mdf",
        "species": None,
        "thickness": 0.5,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 38.00,
        "price_per_sq_ft": 0.99,
        "supplier": "Home Depot / Lowe's",
        "sku_hint": "Standard MDF",
        "notes": "Door panels, drawer faces",
    },
    {
        "id": "sg-008",
        "name": "Melamine 3/4\"",
        "category": "sheet_goods",
        "type": "melamine",
        "species": None,
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 64.00,
        "price_per_sq_ft": 1.67,
        "supplier": "Home Depot / Lowe's",
        "sku_hint": "White Melamine MDF",
        "notes": "Pre-finished, no painting needed — interior cabinet boxes",
    },
    {
        "id": "sg-009",
        "name": "MDO 3/4\"",
        "category": "sheet_goods",
        "type": "mdo",
        "species": None,
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 98.00,
        "price_per_sq_ft": 2.55,
        "supplier": "Lumber yard / specialty",
        "sku_hint": "Medium Density Overlay",
        "notes": "Exterior-grade, paintable, ultra-flat — signs and exterior cabs",
    },
    # ── Hardwoods ─────────────────────────────────────────────────────────────
    {
        "id": "hw-001",
        "name": "Red Oak S4S 4/4",
        "category": "hardwood",
        "type": "hardwood",
        "species": "Red Oak",
        "thickness": 0.75,
        "sheet_width": None,
        "sheet_height": None,
        "price_per_sheet": None,
        "price_per_sq_ft": 4.25,
        "supplier": "Woodcraft / local lumber yard",
        "sku_hint": "Red Oak 1\" nominal S4S",
        "notes": "4/4 surfaced = ~0.75\" finished. $5.50/BF",
    },
    {
        "id": "hw-002",
        "name": "Hard Maple S4S 4/4",
        "category": "hardwood",
        "type": "hardwood",
        "species": "Hard Maple",
        "thickness": 0.75,
        "sheet_width": None,
        "sheet_height": None,
        "price_per_sheet": None,
        "price_per_sq_ft": 5.10,
        "supplier": "Woodcraft / Rockler",
        "sku_hint": "Hard Maple 1\" nominal S4S",
        "notes": "$6.60/BF. Tight grain, excellent for cabinet faces",
    },
    {
        "id": "hw-003",
        "name": "Cherry S4S 4/4",
        "category": "hardwood",
        "type": "hardwood",
        "species": "Cherry",
        "thickness": 0.75,
        "sheet_width": None,
        "sheet_height": None,
        "price_per_sheet": None,
        "price_per_sq_ft": 7.50,
        "supplier": "Woodcraft / Rockler",
        "sku_hint": "American Cherry S4S",
        "notes": "$9.75/BF. Premium finish, natural aging",
    },
    {
        "id": "hw-004",
        "name": "Black Walnut S4S 4/4",
        "category": "hardwood",
        "type": "hardwood",
        "species": "Black Walnut",
        "thickness": 0.75,
        "sheet_width": None,
        "sheet_height": None,
        "price_per_sheet": None,
        "price_per_sq_ft": 14.00,
        "supplier": "Woodcraft / Rockler",
        "sku_hint": "American Walnut S4S",
        "notes": "$18.20/BF. Highest value domestic species",
    },
    {
        "id": "hw-005",
        "name": "Poplar S4S 4/4",
        "category": "hardwood",
        "type": "hardwood",
        "species": "Poplar",
        "thickness": 0.75,
        "sheet_width": None,
        "sheet_height": None,
        "price_per_sheet": None,
        "price_per_sq_ft": 3.00,
        "supplier": "Home Depot / Lowe's",
        "sku_hint": "Poplar S4S boards",
        "notes": "$3.90/BF. Budget paint-grade hardwood, stable",
    },
    {
        "id": "hw-006",
        "name": "White Oak S4S 4/4",
        "category": "hardwood",
        "type": "hardwood",
        "species": "White Oak",
        "thickness": 0.75,
        "sheet_width": None,
        "sheet_height": None,
        "price_per_sheet": None,
        "price_per_sq_ft": 6.25,
        "supplier": "Woodcraft / lumber yard",
        "sku_hint": "White Oak S4S",
        "notes": "$8.10/BF. Trending in modern/Shaker styles",
    },
    # ── Composites ────────────────────────────────────────────────────────────
    {
        "id": "cp-001",
        "name": "HPL / Formica 3/4\" MDF",
        "category": "composite",
        "type": "hpl",
        "species": None,
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 145.00,
        "price_per_sq_ft": 3.78,
        "supplier": "Wilsonart / Formica distributor",
        "sku_hint": "HPL bonded to MDF substrate",
        "notes": "Commercial-grade surface, scratch/moisture resistant",
    },
    {
        "id": "cp-002",
        "name": "Bamboo Plywood 3/4\"",
        "category": "composite",
        "type": "bamboo",
        "species": "Bamboo",
        "thickness": 0.75,
        "sheet_width": 48.0,
        "sheet_height": 96.0,
        "price_per_sheet": 118.00,
        "price_per_sq_ft": 3.07,
        "supplier": "Lumber Liquidators / specialty",
        "sku_hint": "Carbonized or natural bamboo ply",
        "notes": "Sustainable, harder than most hardwoods",
    },
    {
        "id": "cp-003",
        "name": "Baltic Birch 3/4\"",
        "category": "composite",
        "type": "baltic_birch",
        "species": "Baltic Birch",
        "thickness": 0.75,
        "sheet_width": 60.0,
        "sheet_height": 60.0,
        "price_per_sheet": 85.00,
        "price_per_sq_ft": 3.40,
        "supplier": "Woodcraft / specialty import",
        "sku_hint": "BB/BB grade 5×5 sheet",
        "notes": "Void-free, 13-ply, 5×5 format — superior for drawers and jigs",
    },
]


class MaterialOut(BaseModel):
    id: str
    name: str
    category: str
    type: str
    species: Optional[str]
    thickness: float
    sheet_width: Optional[float]
    sheet_height: Optional[float]
    price_per_sheet: Optional[float]
    price_per_sq_ft: float
    supplier: str
    sku_hint: str
    notes: str


class CatalogResponse(BaseModel):
    materials: list[MaterialOut]
    last_updated: str
    count: int


@router.get("", response_model=CatalogResponse)
async def list_materials(category: Optional[str] = None):
    items = CATALOG
    if category and category in ("sheet_goods", "hardwood", "composite"):
        items = [m for m in CATALOG if m["category"] == category]
    return CatalogResponse(
        materials=items,
        last_updated=LAST_UPDATED,
        count=len(items),
    )


@router.get("/{material_id}", response_model=MaterialOut)
async def get_material(material_id: str):
    for m in CATALOG:
        if m["id"] == material_id:
            return m
    raise HTTPException(status_code=404, detail="Material not found")
