"""Tests for the cut list optimizer and its hand-off to the G-code generator"""
import pytest

from app.cutlist_optimizer import optimize_cut_list, SheetSize
from app.gcode_generator import GCodeGenerator

BASE_CABINET = [
    {"id": "side", "name": "Side", "width": 23.25, "height": 34.5, "quantity": 2, "material_id": "ply"},
    {"id": "bottom", "name": "Bottom", "width": 22.5, "height": 23.25, "quantity": 1, "material_id": "ply"},
    {"id": "rail", "name": "Rail", "width": 22.5, "height": 3.0, "quantity": 2, "material_id": "ply"},
    {"id": "back", "name": "Back", "width": 22.5, "height": 33.75, "quantity": 1, "material_id": "ply"},
]


def _violations(sheets):
    bad = 0
    for sheet in sheets:
        cuts = sheet["cuts"]
        for i, a in enumerate(cuts):
            if a["x"] + a["width"] > sheet["width"] + 1e-9 or a["y"] + a["height"] > sheet["height"] + 1e-9:
                bad += 1
            for b in cuts[i + 1:]:
                if not (
                    a["x"] + a["width"] <= b["x"] + 1e-9 or b["x"] + b["width"] <= a["x"] + 1e-9
                    or a["y"] + a["height"] <= b["y"] + 1e-9 or b["y"] + b["height"] <= a["y"] + 1e-9
                ):
                    bad += 1
    return bad


def test_sheet_sizes_are_real_sheet_dimensions():
    assert SheetSize.FULL_4X8.value == (48, 96)
    assert SheetSize.HALF_4X4.value == (48, 48)
    assert SheetSize.QUARTER_2X4.value == (24, 48)


def test_base_cabinet_fits_one_sheet_without_overlaps():
    result = optimize_cut_list(BASE_CABINET, "4x8")
    assert result["total_sheets"] == 1
    assert sum(len(s["cuts"]) for s in result["cut_list"]) == 6
    assert _violations(result["cut_list"]) == 0


def test_oversize_part_raises():
    huge = [{"id": "x", "name": "Huge", "width": 60, "height": 120, "quantity": 1, "material_id": "ply"}]
    with pytest.raises(ValueError, match="too large"):
        optimize_cut_list(huge, "4x8")


def test_rotation_can_be_disabled_to_keep_grain_direction():
    result = optimize_cut_list(BASE_CABINET, "4x8", allow_rotation=False)
    for sheet in result["cut_list"]:
        for cut in sheet["cuts"]:
            original = next(c for c in BASE_CABINET if c["id"] == cut["part_id"])
            assert (cut["width"], cut["height"]) == (original["width"], original["height"])
    assert _violations(result["cut_list"]) == 0


def test_layout_feeds_gcode_generator_with_part_names():
    result = optimize_cut_list(BASE_CABINET, "4x8")
    gcode = GCodeGenerator(machine_type="grbl").generate(result["layout"])
    assert "G90" in gcode
    assert "; --- Side ---" in gcode
