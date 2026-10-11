import pytest

from tools import base_cabinet_parts


def test_base_cabinet_parts_match_standard_carcass():
    parts = {p["name"]: p for p in base_cabinet_parts(24, 34.5, 23.25, "ply")}
    assert parts["Side"]["qty"] == 2 and parts["Side"]["width"] == 23.25 and parts["Side"]["height"] == 34.5
    assert parts["Bottom"]["width"] == pytest.approx(22.5)
    assert parts["Back"]["height"] == pytest.approx(33.75)
    assert sum(p["qty"] for p in parts.values()) == 6
