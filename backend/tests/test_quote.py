"""Tests for the instant quote endpoint (router mounted on its own, no database needed)"""
import os

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# routes/__init__ imports auth, which needs these set before import
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-only-secret-not-for-production-use-0123456789")

from routes import materials, quote  # noqa: E402

app = FastAPI()
app.include_router(materials.router)
app.include_router(quote.router)
client = TestClient(app)

BASE_CABINET = [
    {"name": "Side", "width": 23.25, "height": 34.5, "qty": 2, "material_id": None},
    {"name": "Bottom", "width": 22.5, "height": 23.25, "qty": 1, "material_id": None},
    {"name": "Back", "width": 22.5, "height": 33.75, "qty": 1, "material_id": None},
]


def _sheet_material_id():
    data = client.get("/api/materials").json()
    items = data.get("materials") or data.get("items") or data
    return next(m["id"] for m in items if m.get("price_per_sheet") and m.get("sheet_width") == 48.0)


def _parts(material_id):
    return [{**p, "material_id": material_id} for p in BASE_CABINET]


def test_quote_prices_a_cabinet_from_one_sheet():
    r = client.post("/api/quote", json=_parts(_sheet_material_id()))
    assert r.status_code == 200
    body = r.json()
    assert body["part_count"] == 4
    assert body["line_items"][0]["sheets_needed"] == 1
    assert body["total"] == pytest.approx(body["materials_subtotal"] + body["tax"], abs=0.01)


def test_quote_rejects_part_larger_than_a_sheet():
    mid = _sheet_material_id()
    r = client.post("/api/quote", json=[{"name": "Huge", "width": 60, "height": 120, "qty": 1, "material_id": mid}])
    assert r.status_code == 400
    assert "too large" in r.json()["detail"]


def test_quote_rejects_unknown_material():
    r = client.post("/api/quote", json=[{"name": "X", "width": 10, "height": 10, "qty": 1, "material_id": "nope"}])
    assert r.status_code == 400


def test_quote_rejects_unreasonable_sizes():
    mid = _sheet_material_id()
    assert client.post("/api/quote", json=[{"name": "A", "width": 10, "height": 10, "qty": 100000, "material_id": mid}]).status_code == 422
    assert client.post("/api/quote", json=[{"name": "A", "width": 99999, "height": 10, "qty": 1, "material_id": mid}]).status_code == 422
    too_many = [{"name": "A", "width": 10, "height": 10, "qty": 1, "material_id": mid}] * 101
    assert client.post("/api/quote", json=too_many).status_code == 400
