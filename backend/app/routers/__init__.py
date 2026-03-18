"""
Routers package for KerfOS
"""
from . import (
    cabinets, materials, hardware, cutlists, auth, collaboration,
    projects, gcode, stripe, price_feeds, advanced_nesting,
    edge_banding, hardware_recommendations, scrap, gdpr,
    ar_scanner, community_gallery, localization, scratch_build,
    sketch_to_design, store_integration
)

__all__ = [
    # Core routers
    "cabinets",
    "materials", 
    "hardware",
    "cutlists",
    "auth",
    "collaboration", 
    "projects",
    "gcode",
    # Payment & Pricing
    "stripe",
    "price_feeds",
    # Phase 4 - Advanced Features
    "advanced_nesting",
    "edge_banding",
    "hardware_recommendations",
    # Phase 5 - Quality of Life
    "scrap",
    "ar_scanner",
    "sketch_to_design",
    "scratch_build",
    # Phase 5 - Localization & Community
    "localization",
    "community_gallery",
    "store_integration",
    # Phase 6 - Compliance
    "gdpr",
]
