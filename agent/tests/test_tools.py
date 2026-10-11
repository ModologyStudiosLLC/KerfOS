import pytest

from tools import base_cabinet_parts


def test_base_cabinet_parts_match_standard_carcass():
    parts = {p["name"]: p for p in base_cabinet_parts(24, 34.5, 23.25, "ply")}
    assert parts["Side"]["qty"] == 2 and parts["Side"]["width"] == 23.25 and parts["Side"]["height"] == 34.5
    assert parts["Bottom"]["width"] == pytest.approx(22.5)
    assert parts["Back"]["height"] == pytest.approx(33.75)
    assert sum(p["qty"] for p in parts.values()) == 6


def test_quote_tool_rejects_oversize_inputs_without_calling_the_backend():
    from tools import quote_base_cabinet

    too_big = quote_base_cabinet.invoke({"width": 24, "height": 34.5, "depth": 23.25, "material_id": "x", "count": 100000})
    assert "error" in too_big
    huge = quote_base_cabinet.invoke({"width": 5000, "height": 34.5, "depth": 23.25, "material_id": "x"})
    assert "error" in huge
