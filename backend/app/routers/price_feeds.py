"""
Price Feeds Router - Live supplier price comparison and search links
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

from app.price_feeds import (
    PriceFeedManager,
    Supplier,
    get_supplier_search_links,
    compare_hardware_prices,
    get_estimated_price_range,
    get_all_price_estimates
)

router = APIRouter(prefix="/price-feeds", tags=["price-feeds"])


class PriceComparisonRequest(BaseModel):
    product_name: str
    sku: Optional[str] = ""


class PriceEstimateResponse(BaseModel):
    hardware_type: str
    subcategory: str
    price_low: float
    price_high: float


@router.get("/suppliers")
async def list_suppliers():
    """List all supported suppliers with their details."""
    return {
        "suppliers": [
            {"id": Supplier.ROCKLER.value, "name": "Rockler", "url": "https://www.rockler.com"},
            {"id": Supplier.WOODCRAFT.value, "name": "Woodcraft", "url": "https://www.woodcraft.com"},
            {"id": Supplier.HOME_DEPOT.value, "name": "Home Depot", "url": "https://www.homedepot.com"},
            {"id": Supplier.LOWES.value, "name": "Lowes", "url": "https://www.lowes.com"},
            {"id": Supplier.MCMASTER.value, "name": "McMaster-Carr", "url": "https://www.mcmaster.com"},
            {"id": Supplier.AMAZON.value, "name": "Amazon", "url": "https://www.amazon.com"},
            {"id": Supplier.WOODWORKER_EXPRESS.value, "name": "Woodworker Express", "url": "https://www.woodworkerexpress.com"},
            {"id": Supplier.DK_HARDWARE.value, "name": "DK Hardware", "url": "https://www.dkhardware.com"},
        ]
    }


@router.get("/search-links/{query}")
async def get_search_links(query: str):
    """
    Get search links for a product across all suppliers.
    Useful when live pricing is not available.
    """
    links = get_supplier_search_links(query)
    return {
        "query": query,
        "search_links": links,
        "last_updated": datetime.utcnow().isoformat()
    }


@router.post("/compare")
async def compare_prices(request: PriceComparisonRequest):
    """
    Compare prices across multiple suppliers for a hardware item.
    Returns price comparison with search links.
    """
    try:
        result = await compare_hardware_prices(request.product_name, request.sku or "")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price comparison failed: {str(e)}")


@router.get("/estimates")
async def get_all_estimates():
    """
    Get all hardware price estimates by category.
    Returns estimated price ranges for common hardware types.
    """
    estimates = get_all_price_estimates()
    
    formatted = {}
    for category, subcategories in estimates.items():
        formatted[category] = [
            {
                "subcategory": subcategory,
                "price_low": price_range[0],
                "price_high": price_range[1]
            }
            for subcategory, price_range in subcategories.items()
        ]
    
    return {
        "price_estimates": formatted,
        "note": "Prices are estimates and may vary by supplier and region",
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/estimates/{hardware_type}/{subcategory}")
async def get_specific_estimate(hardware_type: str, subcategory: str):
    """
    Get price estimate for a specific hardware type and subcategory.
    """
    price_low, price_high = get_estimated_price_range(hardware_type, subcategory)
    
    if price_low == 0.0 and price_high == 0.0:
        raise HTTPException(
            status_code=404, 
            detail=f"No price estimate found for {hardware_type}/{subcategory}"
        )
    
    return {
        "hardware_type": hardware_type,
        "subcategory": subcategory,
        "price_low": price_low,
        "price_high": price_high,
        "currency": "USD"
    }


@router.get("/hardware-categories")
async def get_hardware_categories():
    """
    Get all hardware categories with subcategories for price estimation.
    """
    estimates = get_all_price_estimates()
    
    categories = []
    for category, subcategories in estimates.items():
        categories.append({
            "category": category,
            "subcategories": list(subcategories.keys())
        })
    
    return {"categories": categories}
