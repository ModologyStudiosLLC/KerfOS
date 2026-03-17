"""
Phase 5 Quality of Life Features
- Climate Adjustment: Humidity zone considerations, joint tolerance, finish recommendations
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from enum import Enum
from datetime import datetime


class HumidityZone(str, Enum):
    """US climate zones based on humidity levels"""
    ARID = "arid"           # Southwest (Arizona, Nevada, New Mexico)
    DRY = "dry"             # West Coast, Mountain regions
    MODERATE = "moderate"   # Midwest, Northeast, Pacific Northwest
    HUMID = "humid"         # Southeast, Gulf Coast
    TROPICAL = "tropical"   # Florida, Hawaii, Puerto Rico
    VARIABLE = "variable"   # Areas with extreme seasonal swings


class Season(str, Enum):
    SPRING = "spring"
    SUMMER = "summer"
    FALL = "fall"
    WINTER = "winter"


class MaterialType(str, Enum):
    PLYWOOD = "plywood"
    MDF = "mdf"
    PARTICLE_BOARD = "particle_board"
    SOLID_WOOD = "solid_wood"
    HARDWOOD = "hardwood"
    SOFTWOOD = "softwood"


CLIMATE_DATA = {
    HumidityZone.ARID: {
        "avg_humidity": 15,
        "humidity_range": (10, 25),
        "seasonal_swing": 10,
        "description": "Very dry climate with minimal seasonal variation",
        "wood_movement_factor": 0.5,
        "recommended_moisture_content": (6, 8),
        "concerns": ["Checking and cracking", "Joint separation", "Warping toward dryness"],
    },
    HumidityZone.DRY: {
        "avg_humidity": 30,
        "humidity_range": (20, 40),
        "seasonal_swing": 15,
        "description": "Dry climate with moderate seasonal changes",
        "wood_movement_factor": 0.7,
        "recommended_moisture_content": (7, 9),
        "concerns": ["Seasonal movement", "Edge banding separation", "Panel shrinkage"],
    },
    HumidityZone.MODERATE: {
        "avg_humidity": 50,
        "humidity_range": (35, 65),
        "seasonal_swing": 20,
        "description": "Moderate climate with significant seasonal swings",
        "wood_movement_factor": 1.0,
        "recommended_moisture_content": (8, 11),
        "concerns": ["Significant seasonal movement", "Door warping", "Drawer binding"],
    },
    HumidityZone.HUMID: {
        "avg_humidity": 70,
        "humidity_range": (55, 85),
        "seasonal_swing": 15,
        "description": "Humid climate with year-round moisture",
        "wood_movement_factor": 1.3,
        "recommended_moisture_content": (10, 13),
        "concerns": ["Swelling", "Mold/mildew", "Finish failure", "Hardware corrosion"],
    },
    HumidityZone.TROPICAL: {
        "avg_humidity": 80,
        "humidity_range": (70, 95),
        "seasonal_swing": 10,
        "description": "Tropical climate with constant high humidity",
        "wood_movement_factor": 1.5,
        "recommended_moisture_content": (12, 15),
        "concerns": ["Extreme swelling", "Mold/mildew", "Rot risk", "Adhesive failure"],
    },
    HumidityZone.VARIABLE: {
        "avg_humidity": 50,
        "humidity_range": (25, 75),
        "seasonal_swing": 35,
        "description": "Extreme seasonal humidity variation",
        "wood_movement_factor": 1.4,
        "recommended_moisture_content": (8, 11),
        "concerns": ["Extreme movement", "Joint failure", "Door warping both directions"],
    },
}

SEASONAL_ADJUSTMENTS = {
    Season.SPRING: {
        "humidity_modifier": 0.1,
        "movement_trend": "expanding",
        "recommendations": ["Allow for expansion in joinery", "Check HVAC is working properly"],
    },
    Season.SUMMER: {
        "humidity_modifier": 0.2,
        "movement_trend": "expanding",
        "recommendations": ["Expect maximum expansion", "Do not install tight joints", "Ensure proper ventilation"],
    },
    Season.FALL: {
        "humidity_modifier": -0.05,
        "movement_trend": "contracting",
        "recommendations": ["Wood will start contracting", "Good time for final fitting"],
    },
    Season.WINTER: {
        "humidity_modifier": -0.15,
        "movement_trend": "contracting",
        "recommendations": ["Maximum contraction expected", "Fill gaps may appear", "Run humidifier if needed"],
    },
}

MATERIAL_BEHAVIOR = {
    MaterialType.PLYWOOD: {
        "movement_coefficient": 0.3,  # Fraction of solid wood
        "stable_directions": ["length", "width"],  # Due to cross-grain construction
        "expansion_per_inch": 0.002,  # Inches per inch per 10% RH change
        "notes": "More stable than solid wood, but can still move slightly",
    },
    MaterialType.MDF: {
        "movement_coefficient": 0.4,
        "stable_directions": ["length"],
        "expansion_per_inch": 0.003,
        "notes": "Swells significantly with moisture, especially edges",
    },
    MaterialType.PARTICLE_BOARD: {
        "movement_coefficient": 0.5,
        "stable_directions": ["length"],
        "expansion_per_inch": 0.004,
        "notes": "Least stable, avoid in humid environments",
    },
    MaterialType.SOLID_WOOD: {
        "movement_coefficient": 1.0,
        "stable_directions": ["length"],  # Longitudinal is stable
        "expansion_per_inch": 0.01,
        "notes": "Full wood movement - significant tangential and radial movement",
    },
    MaterialType.HARDWOOD: {
        "movement_coefficient": 1.1,
        "stable_directions": ["length"],
        "expansion_per_inch": 0.011,
        "notes": "Dense wood moves more per inch but is stronger",
    },
    MaterialType.SOFTWOOD: {
        "movement_coefficient": 0.9,
        "stable_directions": ["length"],
        "expansion_per_inch": 0.009,
        "notes": "Less dense, slightly less movement",
    },
}

FINISH_RECOMMENDATIONS = {
    HumidityZone.ARID: {
        "primary_finish": "Polyurethane or Lacquer",
        "alternatives": ["Shellac", "Varnish"],
        "sealer": "Sanding sealer recommended",
        "cautions": ["Avoid water-based finishes in very low humidity - may dry too fast"],
        "top_coats": 2,
    },
    HumidityZone.DRY: {
        "primary_finish": "Polyurethane",
        "alternatives": ["Lacquer", "Conversion varnish"],
        "sealer": "Pre-cat lacquer sealer",
        "cautions": ["Standard application procedures work well"],
        "top_coats": 2,
    },
    HumidityZone.MODERATE: {
        "primary_finish": "Conversion varnish",
        "alternatives": ["Polyurethane", "Catalyzed lacquer"],
        "sealer": "Catalyzed sealer recommended",
        "cautions": ["Allow extra dry time during humid periods"],
        "top_coats": 3,
    },
    HumidityZone.HUMID: {
        "primary_finish": "Marine-grade polyurethane",
        "alternatives": ["Epoxy", "Conversion varnish"],
        "sealer": "Epoxy sealer recommended",
        "cautions": ["Extended dry times", "Avoid shellac in bathrooms/kitchens"],
        "top_coats": 3,
    },
    HumidityZone.TROPICAL: {
        "primary_finish": "Marine epoxy or spar urethane",
        "alternatives": ["Marine-grade polyurethane"],
        "sealer": "Epoxy sealer required",
        "cautions": ["Mold inhibitors needed", "Extended cure times", "Consider all-weather materials"],
        "top_coats": 4,
    },
    HumidityZone.VARIABLE: {
        "primary_finish": "Flexible polyurethane or conversion varnish",
        "alternatives": ["Spar urethane"],
        "sealer": "Catalyzed sealer with flexibility",
        "cautions": ["Must accommodate expansion and contraction", "Flexible finish required"],
        "top_coats": 3,
    },
}


class ClimateAdjustmentResult(BaseModel):
    zone: HumidityZone
    avg_humidity: int
    humidity_range: tuple
    seasonal_swing: int
    wood_movement_factor: float
    recommended_moisture_content: tuple
    concerns: List[str]
    joint_tolerances: Dict[str, float]
    finish_recommendations: Dict[str, Any]
    seasonal_notes: Dict[str, Any]
    material_specific: Dict[str, Any]


def determine_humidity_zone(
    zip_code: str = None,
    state: str = None,
    city: str = None,
    manual_zone: HumidityZone = None,
) -> HumidityZone:
    """
    Determine humidity zone based on location.
    
    Args:
        zip_code: US zip code
        state: State name or abbreviation
        city: City name
        manual_zone: Override automatic detection
    
    Returns:
        HumidityZone enum value
    """
    
    if manual_zone:
        return manual_zone
    
    # State-to-zone mapping
    state_zones = {
        # Arid
        "AZ": HumidityZone.ARID, "arizona": HumidityZone.ARID,
        "NV": HumidityZone.ARID, "nevada": HumidityZone.ARID,
        "NM": HumidityZone.ARID, "new mexico": HumidityZone.ARID,
        "UT": HumidityZone.ARID, "utah": HumidityZone.ARID,
        
        # Dry
        "CA": HumidityZone.DRY, "california": HumidityZone.DRY,
        "CO": HumidityZone.DRY, "colorado": HumidityZone.DRY,
        "WY": HumidityZone.DRY, "wyoming": HumidityZone.DRY,
        "MT": HumidityZone.DRY, "montana": HumidityZone.DRY,
        "ID": HumidityZone.DRY, "idaho": HumidityZone.DRY,
        "WA": HumidityZone.MODERATE, "washington": HumidityZone.MODERATE,  # Western WA is humid
        "OR": HumidityZone.DRY, "oregon": HumidityZone.DRY,
        
        # Tropical
        "HI": HumidityZone.TROPICAL, "hawaii": HumidityZone.TROPICAL,
        "PR": HumidityZone.TROPICAL, "puerto rico": HumidityZone.TROPICAL,
        
        # Humid
        "FL": HumidityZone.TROPICAL, "florida": HumidityZone.TROPICAL,
        "LA": HumidityZone.HUMID, "louisiana": HumidityZone.HUMID,
        "MS": HumidityZone.HUMID, "mississippi": HumidityZone.HUMID,
        "AL": HumidityZone.HUMID, "alabama": HumidityZone.HUMID,
        "GA": HumidityZone.HUMID, "georgia": HumidityZone.HUMID,
        "SC": HumidityZone.HUMID, "south carolina": HumidityZone.HUMID,
        "NC": HumidityZone.HUMID, "north carolina": HumidityZone.HUMID,
        "TN": HumidityZone.HUMID, "tennessee": HumidityZone.HUMID,
        "TX": HumidityZone.HUMID, "texas": HumidityZone.HUMID,  # Most of TX
        "AR": HumidityZone.HUMID, "arkansas": HumidityZone.HUMID,
        
        # Variable (extreme seasonal swings)
        "MN": HumidityZone.VARIABLE, "minnesota": HumidityZone.VARIABLE,
        "ND": HumidityZone.VARIABLE, "north dakota": HumidityZone.VARIABLE,
        "SD": HumidityZone.VARIABLE, "south dakota": HumidityZone.VARIABLE,
        "NE": HumidityZone.VARIABLE, "nebraska": HumidityZone.VARIABLE,
        "IA": HumidityZone.VARIABLE, "iowa": HumidityZone.VARIABLE,
        
        # Moderate (default for most others)
        "NY": HumidityZone.MODERATE, "new york": HumidityZone.MODERATE,
        "PA": HumidityZone.MODERATE, "pennsylvania": HumidityZone.MODERATE,
        "OH": HumidityZone.MODERATE, "ohio": HumidityZone.MODERATE,
        "MI": HumidityZone.MODERATE, "michigan": HumidityZone.MODERATE,
        "IL": HumidityZone.MODERATE, "illinois": HumidityZone.MODERATE,
        "IN": HumidityZone.MODERATE, "indiana": HumidityZone.MODERATE,
        "WI": HumidityZone.MODERATE, "wisconsin": HumidityZone.MODERATE,
        "MO": HumidityZone.MODERATE, "missouri": HumidityZone.MODERATE,
        "KY": HumidityZone.MODERATE, "kentucky": HumidityZone.MODERATE,
        "WV": HumidityZone.MODERATE, "west virginia": HumidityZone.MODERATE,
        "VA": HumidityZone.MODERATE, "virginia": HumidityZone.MODERATE,
        "MD": HumidityZone.MODERATE, "maryland": HumidityZone.MODERATE,
        "NJ": HumidityZone.MODERATE, "new jersey": HumidityZone.MODERATE,
        "CT": HumidityZone.MODERATE, "connecticut": HumidityZone.MODERATE,
        "MA": HumidityZone.MODERATE, "massachusetts": HumidityZone.MODERATE,
        "RI": HumidityZone.MODERATE, "rhode island": HumidityZone.MODERATE,
        "VT": HumidityZone.MODERATE, "vermont": HumidityZone.MODERATE,
        "NH": HumidityZone.MODERATE, "new hampshire": HumidityZone.MODERATE,
        "ME": HumidityZone.MODERATE, "maine": HumidityZone.MODERATE,
        "DE": HumidityZone.MODERATE, "delaware": HumidityZone.MODERATE,
        "OK": HumidityZone.MODERATE, "oklahoma": HumidityZone.MODERATE,
        "KS": HumidityZone.MODERATE, "kansas": HumidityZone.MODERATE,
    }
    
    # Try to match by state
    if state:
        state_lower = state.lower().strip()
        state_upper = state.upper().strip()
        if state_lower in state_zones:
            return state_zones[state_lower]
        if state_upper in state_zones:
            return state_zones[state_upper]
    
    # Default to moderate if not found
    return HumidityZone.MODERATE


def calculate_joint_tolerance(
    material: MaterialType,
    width_inches: float,
    zone: HumidityZone,
    season: Season = None,
) -> Dict[str, float]:
    """
    Calculate recommended joint tolerances for wood movement.
    
    Args:
        material: Material type
        width_inches: Width of the board/panel in inches
        zone: Humidity zone
        season: Current season (for adjustment)
    
    Returns:
        Dictionary with tolerance recommendations
    """
    
    climate_data = CLIMATE_DATA[zone]
    material_data = MATERIAL_BEHAVIOR[material]
    
    # Base expansion calculation
    # Formula: movement = width × expansion_coefficient × humidity_change × movement_factor
    humidity_swing = climate_data["seasonal_swing"]
    expansion_per_inch = material_data["expansion_per_inch"]
    movement_factor = climate_data["wood_movement_factor"]
    
    # Calculate expected movement
    expected_movement = width_inches * expansion_per_inch * (humidity_swing / 10) * movement_factor
    
    # Seasonal adjustment
    if season:
        season_data = SEASONAL_ADJUSTMENTS[season]
        expected_movement *= (1 + season_data["humidity_modifier"])
    
    # Recommend tolerance (1.5x expected movement for safety)
    recommended_tolerance = expected_movement * 1.5
    
    # Minimum tolerances
    min_tolerance = 1/32  # About 0.031"
    max_tolerance = 1/4   # About 0.25"
    
    recommended_tolerance = max(min_tolerance, min(recommended_tolerance, max_tolerance))
    
    return {
        "expected_movement_inches": round(expected_movement, 4),
        "recommended_tolerance_inches": round(recommended_tolerance, 4),
        "recommended_tolerance_fraction": _inches_to_fraction(recommended_tolerance),
        "minimum_gap_inches": round(min_tolerance, 4),
        "humidity_swing_percent": humidity_swing,
        "seasonal_trend": SEASONAL_ADJUSTMENTS.get(season, {}).get("movement_trend", "stable") if season else "variable",
    }


def _inches_to_fraction(inches: float) -> str:
    """Convert decimal inches to nearest common fraction."""
    fractions = [
        (1/32, "1/32"),
        (1/16, "1/16"),
        (3/32, "3/32"),
        (1/8, "1/8"),
        (5/32, "5/32"),
        (3/16, "3/16"),
        (7/32, "7/32"),
        (1/4, "1/4"),
    ]
    
    for decimal, fraction in fractions:
        if inches <= decimal + 1/64:
            return fraction
    
    return f"{inches:.3f}"


def get_finish_recommendations(
    zone: HumidityZone,
    cabinet_location: str = "indoor",  # indoor, bathroom, kitchen, outdoor
    material: MaterialType = MaterialType.PLYWOOD,
) -> Dict[str, Any]:
    """
    Get finish recommendations based on climate and usage.
    
    Args:
        zone: Humidity zone
        cabinet_location: Where cabinet will be installed
        material: Material being finished
    
    Returns:
        Dictionary with finish recommendations
    """
    
    base_recommendations = FINISH_RECOMMENDATIONS[zone]
    
    # Adjust for location
    location_adjustments = {
        "bathroom": {
            "primary_finish": "Marine-grade polyurethane or epoxy",
            "extra_top_coats": 1,
            "cautions": ["High moisture area - use mold-resistant finish", "Consider ventilation requirements"],
            "sealer": "Epoxy sealer required for all zones",
        },
        "kitchen": {
            "primary_finish": "Conversion varnish or polyurethane",
            "extra_top_coats": 1,
            "cautions": ["Grease and heat exposure", "Consider heat-resistant finish near stove"],
            "sealer": "Catalyzed sealer recommended",
        },
        "outdoor": {
            "primary_finish": "Marine spar urethane",
            "extra_top_coats": 2,
            "cautions": ["UV exposure", "Rain/moisture", "Temperature extremes", "Use exterior-grade materials"],
            "sealer": "Marine epoxy sealer required",
        },
        "indoor": {
            "primary_finish": base_recommendations["primary_finish"],
            "extra_top_coats": 0,
            "cautions": base_recommendations["cautions"],
            "sealer": base_recommendations["sealer"],
        },
    }
    
    location_specific = location_adjustments.get(cabinet_location, location_adjustments["indoor"])
    
    # Combine recommendations
    recommendations = {
        "zone": zone.value,
        "location": cabinet_location,
        "material": material.value,
        "primary_finish": location_specific.get("primary_finish", base_recommendations["primary_finish"]),
        "alternatives": base_recommendations["alternatives"],
        "sealer": location_specific.get("sealer", base_recommendations["sealer"]),
        "top_coats": base_recommendations["top_coats"] + location_specific.get("extra_top_coats", 0),
        "cautions": base_recommendations["cautions"] + location_specific.get("cautions", []),
        "application_tips": _get_application_tips(zone, cabinet_location),
    }
    
    return recommendations


def _get_application_tips(zone: HumidityZone, location: str) -> List[str]:
    """Get application tips based on climate."""
    
    tips = []
    
    if zone == HumidityZone.ARID:
        tips.extend([
            "Work quickly - finishes dry faster in low humidity",
            "Avoid spraying in very low humidity (<20% RH)",
            "Use retarder additive to extend open time",
            "Sand between coats to remove dust nibs",
        ])
    elif zone == HumidityZone.HUMID or zone == HumidityZone.TROPICAL:
        tips.extend([
            "Allow extra dry time between coats",
            "Use dehumidifier in finishing area if possible",
            "Watch for blushing in lacquer finishes",
            "Consider moisture-cure urethanes for best results",
        ])
    elif zone == HumidityZone.VARIABLE:
        tips.extend([
            "Check humidity before finishing",
            "Ideal finishing conditions: 40-60% RH",
            "Avoid finishing during extreme weather",
            "Flexible finishes recommended",
        ])
    else:
        tips.extend([
            "Standard application procedures apply",
            "Maintain 40-60% RH in finishing area",
            "Temperature should be 65-75°F",
        ])
    
    if location == "bathroom":
        tips.extend([
            "Ensure excellent ventilation during application",
            "Extra cure time before use",
            "Consider waterproof membrane behind cabinets",
        ])
    elif location == "outdoor":
        tips.extend([
            "Apply in shaded area, not direct sunlight",
            "Temperature should be 50-90°F",
            "Avoid application before rain",
            "UV-protective top coat essential",
        ])
    
    return tips


def get_climate_adjustment(
    zip_code: str = None,
    state: str = None,
    city: str = None,
    season: Season = None,
    materials: List[MaterialType] = None,
    cabinet_widths: List[float] = None,
    cabinet_location: str = "indoor",
) -> ClimateAdjustmentResult:
    """
    Get comprehensive climate adjustment recommendations.
    
    Args:
        zip_code: US zip code
        state: State name or abbreviation
        city: City name
        season: Current season
        materials: List of materials being used
        cabinet_widths: List of cabinet widths in inches
        cabinet_location: Where cabinet will be installed
    
    Returns:
        Comprehensive climate adjustment result
    """
    
    # Determine zone
    zone = determine_humidity_zone(zip_code=zip_code, state=state, city=city)
    climate_data = CLIMATE_DATA[zone]
    
    # Calculate joint tolerances for each material/width combination
    joint_tolerances = {}
    if materials and cabinet_widths:
        for material in materials:
            for width in cabinet_widths:
                key = f"{material.value}_{width}in"
                joint_tolerances[key] = calculate_joint_tolerance(
                    material=material,
                    width_inches=width,
                    zone=zone,
                    season=season,
                )
    
    # Get finish recommendations
    primary_material = materials[0] if materials else MaterialType.PLYWOOD
    finish_recs = get_finish_recommendations(
        zone=zone,
        cabinet_location=cabinet_location,
        material=primary_material,
    )
    
    # Seasonal notes
    seasonal_notes = {}
    if season:
        season_data = SEASONAL_ADJUSTMENTS[season]
        seasonal_notes = {
            "current_season": season.value,
            "movement_trend": season_data["movement_trend"],
            "recommendations": season_data["recommendations"],
        }
    
    # Material-specific recommendations
    material_specific = {}
    if materials:
        for material in materials:
            mat_data = MATERIAL_BEHAVIOR[material]
            material_specific[material.value] = {
                "movement_coefficient": mat_data["movement_coefficient"],
                "stable_directions": mat_data["stable_directions"],
                "expansion_per_inch_per_10rh": mat_data["expansion_per_inch"],
                "notes": mat_data["notes"],
                "suitability": _get_material_suitability(material, zone, cabinet_location),
            }
    
    return ClimateAdjustmentResult(
        zone=zone,
        avg_humidity=climate_data["avg_humidity"],
        humidity_range=climate_data["humidity_range"],
        seasonal_swing=climate_data["seasonal_swing"],
        wood_movement_factor=climate_data["wood_movement_factor"],
        recommended_moisture_content=climate_data["recommended_moisture_content"],
        concerns=climate_data["concerns"],
        joint_tolerances=joint_tolerances,
        finish_recommendations=finish_recs,
        seasonal_notes=seasonal_notes,
        material_specific=material_specific,
    )


def _get_material_suitability(
    material: MaterialType,
    zone: HumidityZone,
    location: str,
) -> Dict[str, Any]:
    """Get material suitability rating for conditions."""
    
    rating = "excellent"
    warnings = []
    
    # Check material against climate
    if material == MaterialType.PARTICLE_BOARD:
        if zone in [HumidityZone.HUMID, HumidityZone.TROPICAL]:
            rating = "poor"
            warnings.append("Particle board swells significantly in humid conditions")
        elif zone == HumidityZone.VARIABLE:
            rating = "fair"
            warnings.append("Particle board may degrade with humidity swings")
        else:
            rating = "good"
    
    elif material == MaterialType.MDF:
        if zone == HumidityZone.TROPICAL:
            rating = "poor"
            warnings.append("MDF edges swell in tropical humidity - seal all edges")
        elif zone == HumidityZone.HUMID:
            rating = "fair"
            warnings.append("Seal MDF edges thoroughly in humid conditions")
        else:
            rating = "good"
    
    elif material in [MaterialType.SOLID_WOOD, MaterialType.HARDWOOD, MaterialType.SOFTWOOD]:
        if zone == HumidityZone.VARIABLE:
            rating = "fair"
            warnings.append("Solid wood requires careful acclimation and joinery")
        else:
            rating = "excellent"
    
    elif material == MaterialType.PLYWOOD:
        rating = "excellent"  # Most stable choice
    
    # Location adjustments
    if location == "bathroom":
        if material == MaterialType.PARTICLE_BOARD:
            rating = "not_recommended"
            warnings.append("Do not use particle board in bathrooms")
        elif material == MaterialType.MDF:
            warnings.append("Use moisture-resistant MDF in bathrooms")
    elif location == "outdoor":
        if material in [MaterialType.PARTICLE_BOARD, MaterialType.MDF]:
            rating = "not_recommended"
            warnings.append("Do not use particle board or MDF outdoors")
        elif material == MaterialType.PLYWOOD:
            warnings.append("Use exterior-grade plywood only")
    
    return {
        "rating": rating,
        "warnings": warnings,
    }


def get_moisture_content_guidelines(
    zone: HumidityZone,
    material: MaterialType = None,
) -> Dict[str, Any]:
    """
    Get moisture content guidelines for wood acclimation.
    
    Args:
        zone: Humidity zone
        material: Material type (optional, for specific recommendations)
    
    Returns:
        Moisture content guidelines
    """
    
    climate_data = CLIMATE_DATA[zone]
    target_mc = climate_data["recommended_moisture_content"]
    
    return {
        "zone": zone.value,
        "target_moisture_content_range": target_mc,
        "target_moisture_content_average": (target_mc[0] + target_mc[1]) / 2,
        "acclimation_days": _get_acclimation_days(zone),
        "acclimation_tips": [
            f"Stack wood with spacers for airflow",
            f"Store in the same environment where cabinets will be installed",
            f"Measure moisture content with a pin or pinless meter",
            f"Target MC: {target_mc[0]}-{target_mc[1]}%",
            f"Check MC in multiple locations on each board",
        ],
        "equilibrium_moisture_content": {
            "description": "The moisture content wood will achieve at the given humidity",
            "formula": "EMC ≈ (humidity% / 30) for rough estimate",
            "zone_emc_estimate": climate_data["avg_humidity"] / 30,
        },
    }


def _get_acclimation_days(zone: HumidityZone) -> int:
    """Get recommended acclimation period in days."""
    
    acclimation_times = {
        HumidityZone.ARID: 14,
        HumidityZone.DRY: 7,
        HumidityZone.MODERATE: 7,
        HumidityZone.HUMID: 10,
        HumidityZone.TROPICAL: 14,
        HumidityZone.VARIABLE: 14,  # Longer due to need for stability
    }
    
    return acclimation_times.get(zone, 7)


def check_design_for_climate(
    design: Dict[str, Any],
    zone: HumidityZone,
    season: Season = None,
) -> Dict[str, Any]:
    """
    Analyze a cabinet design for potential climate-related issues.
    
    Args:
        design: Cabinet design dictionary
        zone: Humidity zone
        season: Current season
    
    Returns:
        Analysis with warnings and recommendations
    """
    
    warnings = []
    recommendations = []
    
    climate_data = CLIMATE_DATA[zone]
    
    # Check for large panels without expansion allowance
    panels = design.get("panels", [])
    for panel in panels:
        width = panel.get("width", 0)
        material = panel.get("material", "plywood")
        
        if width > 24 and material in ["solid_wood", "hardwood"]:
            tolerance = calculate_joint_tolerance(
                material=MaterialType(material),
                width_inches=width,
                zone=zone,
                season=season,
            )
            if tolerance["expected_movement_inches"] > 0.125:
                warnings.append({
                    "type": "panel_expansion",
                    "panel_id": panel.get("id"),
                    "message": f"Panel {panel.get('id')} may move {tolerance['expected_movement_inches']:.3f}\" seasonally",
                    "severity": "warning",
                    "recommendation": f"Allow {tolerance['recommended_tolerance_fraction']}\" tolerance in joinery",
                })
    
    # Check for frameless cabinets in high-humidity
    if design.get("construction_type") == "frameless":
        if zone in [HumidityZone.HUMID, HumidityZone.TROPICAL]:
            warnings.append({
                "type": "construction",
                "message": "Frameless cabinets in humid zones may experience door alignment issues",
                "severity": "info",
                "recommendation": "Consider face-frame construction or adjustable hinges",
            })
    
    # Check for solid wood doors in variable climates
    doors = design.get("doors", [])
    for door in doors:
        if door.get("material") in ["solid_wood", "hardwood"]:
            width = door.get("width", 0)
            if width > 18 and zone == HumidityZone.VARIABLE:
                warnings.append({
                    "type": "door_warping",
                    "door_id": door.get("id"),
                    "message": f"Solid wood door {door.get('id')} may warp with seasonal changes",
                    "severity": "warning",
                    "recommendation": "Consider veneered MDF or plywood for wide doors",
                })
    
    # Generate recommendations
    if zone == HumidityZone.TROPICAL:
        recommendations.extend([
            "Use moisture-resistant materials throughout",
            "Apply extra finish coats on all surfaces",
            "Consider mechanical ventilation in cabinet design",
        ])
    elif zone == HumidityZone.VARIABLE:
        recommendations.extend([
            "Allow generous expansion tolerances",
            "Use floating panel construction where possible",
            "Install cabinets during neutral season (spring/fall)",
        ])
    elif zone == HumidityZone.ARID:
        recommendations.extend([
            "Seal all wood surfaces to prevent moisture loss",
            "Consider using a humidifier in heated spaces",
            "Store materials in conditioned space before building",
        ])
    
    return {
        "zone": zone.value,
        "climate_concerns": climate_data["concerns"],
        "warnings": warnings,
        "recommendations": recommendations,
        "seasonal_considerations": SEASONAL_ADJUSTMENTS.get(season, {}).get("recommendations", []) if season else [],
    }
