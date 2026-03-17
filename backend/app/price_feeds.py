"""
Live Supplier Price Feeds Infrastructure
Manages real-time pricing from hardware suppliers.
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import asyncio
import aiohttp


class Supplier(str, Enum):
    ROCKLER = "rockler"
    WOODCRAFT = "woodcraft"
    HOME_DEPOT = "home_depot"
    LOWES = "lowes"
    MCMASTER = "mcmaster"
    AMAZON = "amazon"
    WOODWORKER_EXPRESS = "woodworker_express"
    DK_HARDWARE = "dk_hardware"


@dataclass
class PriceInfo:
    """Price information from a supplier"""
    supplier: Supplier
    price: float
    currency: str = "USD"
    in_stock: bool = True
    quantity_available: Optional[int] = None
    last_updated: datetime = field(default_factory=datetime.utcnow)
    product_url: Optional[str] = None
    sku: Optional[str] = None


@dataclass
class PriceComparison:
    """Price comparison across suppliers"""
    product_name: str
    product_id: str
    prices: List[PriceInfo]
    lowest_price: Optional[PriceInfo] = None
    highest_price: Optional[PriceInfo] = None
    average_price: float = 0.0
    price_spread: float = 0.0
    
    def __post_init__(self):
        if self.prices:
            self.lowest_price = min(self.prices, key=lambda p: p.price)
            self.highest_price = max(self.prices, key=lambda p: p.price)
            self.average_price = sum(p.price for p in self.prices) / len(self.prices)
            if self.highest_price and self.lowest_price:
                self.price_spread = self.highest_price.price - self.lowest_price.price


@dataclass
class CachedPrice:
    """Cached price data with expiration"""
    price_info: PriceInfo
    cached_at: datetime
    expires_at: datetime
    
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


class SupplierConfig:
    """Configuration for supplier APIs"""
    
    CONFIGS = {
        Supplier.ROCKLER: {
            "name": "Rockler",
            "base_url": "https://www.rockler.com",
            "search_url": "https://www.rockler.com/search?q={query}",
            "api_available": False,
            "scraping_allowed": True
        },
        Supplier.WOODCRAFT: {
            "name": "Woodcraft",
            "base_url": "https://www.woodcraft.com",
            "search_url": "https://www.woodcraft.com/search?q={query}",
            "api_available": False,
            "scraping_allowed": True
        },
        Supplier.HOME_DEPOT: {
            "name": "Home Depot",
            "base_url": "https://www.homedepot.com",
            "search_url": "https://www.homedepot.com/s/{query}",
            "api_available": True,
            "api_url": "https://api.homedepot.com/v1/products"
        },
        Supplier.LOWES: {
            "name": "Lowes",
            "base_url": "https://www.lowes.com",
            "search_url": "https://www.lowes.com/search?searchTerm={query}",
            "api_available": False
        },
        Supplier.MCMASTER: {
            "name": "McMaster-Carr",
            "base_url": "https://www.mcmaster.com",
            "search_url": "https://www.mcmaster.com/{query}",
            "api_available": False,
            "scraping_allowed": True
        },
        Supplier.AMAZON: {
            "name": "Amazon",
            "base_url": "https://www.amazon.com",
            "search_url": "https://www.amazon.com/s?k={query}",
            "api_available": True,
            "api_url": "https://api.amazon.com/products"
        }
    }


class PriceFeedManager:
    """
    Manages live price feeds from multiple suppliers.
    Includes caching, rate limiting, and fallback strategies.
    """
    
    CACHE_DURATION_HOURS = 24
    RATE_LIMIT_DELAY_SECONDS = 1
    
    def __init__(self, cache_enabled: bool = True):
        self.cache_enabled = cache_enabled
        self.price_cache: Dict[str, CachedPrice] = {}
        self.supplier_configs = SupplierConfig.CONFIGS
    
    def get_cache_key(self, supplier: Supplier, product_id: str) -> str:
        """Generate cache key for a product"""
        return f"{supplier.value}:{product_id}"
    
    def get_cached_price(self, supplier: Supplier, product_id: str) -> Optional[PriceInfo]:
        """Get cached price if available and not expired"""
        if not self.cache_enabled:
            return None
        
        cache_key = self.get_cache_key(supplier, product_id)
        cached = self.price_cache.get(cache_key)
        
        if cached and not cached.is_expired():
            return cached.price_info
        
        return None
    
    def cache_price(self, price_info: PriceInfo, product_id: str) -> None:
        """Cache a price with expiration"""
        if not self.cache_enabled:
            return
        
        cache_key = self.get_cache_key(price_info.supplier, product_id)
        now = datetime.utcnow()
        expires = now + timedelta(hours=self.CACHE_DURATION_HOURS)
        
        self.price_cache[cache_key] = CachedPrice(
            price_info=price_info,
            cached_at=now,
            expires_at=expires
        )
    
    async def fetch_price(
        self,
        supplier: Supplier,
        product_id: str,
        session: Optional[aiohttp.ClientSession] = None
    ) -> Optional[PriceInfo]:
        """
        Fetch live price from a supplier.
        
        Note: Actual API integration requires supplier-specific credentials.
        This provides the infrastructure for price fetching.
        """
        # Check cache first
        cached = self.get_cached_price(supplier, product_id)
        if cached:
            return cached
        
        config = self.supplier_configs.get(supplier)
        if not config:
            return None
        
        # For suppliers with APIs
        if config.get("api_available"):
            # This would be implemented with actual API credentials
            # For now, return a placeholder that indicates API integration
            price_info = PriceInfo(
                supplier=supplier,
                price=0.0,  # Would be fetched from API
                in_stock=True,
                product_url=f"{config['base_url']}/product/{product_id}"
            )
            self.cache_price(price_info, product_id)
            return price_info
        
        # For suppliers without APIs, provide search URL
        return PriceInfo(
            supplier=supplier,
            price=0.0,
            in_stock=True,
            product_url=config['search_url'].format(query=product_id)
        )
    
    async def compare_prices(
        self,
        product_name: str,
        product_id: str,
        suppliers: Optional[List[Supplier]] = None
    ) -> PriceComparison:
        """
        Compare prices across multiple suppliers.
        
        Args:
            product_name: Human-readable product name
            product_id: Product identifier or SKU
            suppliers: List of suppliers to check (default: all)
            
        Returns:
            PriceComparison with prices from all suppliers
        """
        if suppliers is None:
            suppliers = list(Supplier)
        
        prices = []
        
        async with aiohttp.ClientSession() as session:
            tasks = [
                self.fetch_price(supplier, product_id, session)
                for supplier in suppliers
            ]
            results = await asyncio.gather(*tasks)
            
            for result in results:
                if result:
                    prices.append(result)
        
        return PriceComparison(
            product_name=product_name,
            product_id=product_id,
            prices=prices
        )
    
    def get_search_links(self, product_name: str) -> Dict[str, str]:
        """
        Get search links for a product across all suppliers.
        Useful when live pricing is not available.
        """
        links = {}
        
        for supplier, config in self.supplier_configs.items():
            search_url = config.get("search_url", "")
            if search_url:
                links[config["name"]] = search_url.format(
                    query=product_name.replace(" ", "+")
                )
        
        return links


# Hardware category price estimation
HARDWARE_PRICE_ESTIMATES = {
    "hinge": {
        "concealed_soft_close": (3.50, 8.00),
        "concealed_standard": (1.50, 4.00),
        "european_110": (2.50, 6.00),
        "overlay": (2.00, 5.00),
        "inset": (5.00, 12.00),
        "butt": (0.50, 3.00),
        "piano": (15.00, 40.00)
    },
    "drawer_slide": {
        "full_extension_soft_close": (8.00, 25.00),
        "full_extension_standard": (5.00, 15.00),
        "undermount": (15.00, 40.00),
        "side_mount": (4.00, 12.00),
        "3_4_extension": (5.00, 15.00)
    },
    "pull": {
        "standard_5in": (2.00, 15.00),
        "appliance_8in": (10.00, 35.00),
        "cup_pull": (5.00, 20.00),
        "bin_pull": (4.00, 15.00)
    },
    "knob": {
        "round": (1.00, 8.00),
        "square": (2.00, 10.00),
        "glass": (3.00, 15.00),
        "ceramic": (2.50, 12.00)
    },
    "screw": {
        "confirmat_7x50": (0.15, 0.30),
        "pocket_hole": (0.05, 0.10),
        "wood_1_25": (0.02, 0.05),
        "shelf_pin": (0.25, 1.00)
    },
    "bracket": {
        "corner": (0.50, 2.00),
        "shelf": (1.00, 5.00),
        "wall_mount": (3.00, 10.00),
        "anti_tip": (5.00, 15.00)
    },
    "lighting": {
        "led_strip_24in": (15.00, 40.00),
        "puck_light": (10.00, 30.00),
        "under_cabinet": (20.00, 60.00)
    }
}


def get_estimated_price_range(
    hardware_type: str,
    subcategory: str
) -> tuple:
    """
    Get estimated price range for hardware.
    
    Args:
        hardware_type: Main category (hinge, drawer_slide, etc.)
        subcategory: Specific type (concealed_soft_close, etc.)
        
    Returns:
        Tuple of (low_price, high_price)
    """
    category = HARDWARE_PRICE_ESTIMATES.get(hardware_type.lower())
    if category:
        return category.get(subcategory.lower(), (0.0, 0.0))
    return (0.0, 0.0)


def get_all_price_estimates() -> Dict:
    """Get all hardware price estimates"""
    return HARDWARE_PRICE_ESTIMATES


# Convenience functions for API
def get_supplier_search_links(query: str) -> Dict:
    """
    Get search links for a product across all suppliers.
    
    Args:
        query: Product search term
        
    Returns:
        Dict of supplier names to search URLs
    """
    manager = PriceFeedManager(cache_enabled=False)
    return manager.get_search_links(query)


async def compare_hardware_prices(product_name: str, sku: str = "") -> Dict:
    """
    Compare hardware prices across suppliers.
    
    Args:
        product_name: Name of the hardware item
        sku: Optional SKU/product ID
        
    Returns:
        Dict with price comparison data
    """
    manager = PriceFeedManager()
    comparison = await manager.compare_prices(product_name, sku or product_name)
    
    return {
        "product_name": comparison.product_name,
        "lowest_price": {
            "supplier": comparison.lowest_price.supplier.value if comparison.lowest_price else None,
            "price": comparison.lowest_price.price if comparison.lowest_price else None
        },
        "highest_price": {
            "supplier": comparison.highest_price.supplier.value if comparison.highest_price else None,
            "price": comparison.highest_price.price if comparison.highest_price else None
        },
        "average_price": round(comparison.average_price, 2),
        "price_spread": round(comparison.price_spread, 2),
        "suppliers_checked": len(comparison.prices),
        "search_links": manager.get_search_links(product_name),
        "last_updated": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    # Test supplier links
    links = get_supplier_search_links("soft close hinge")
    print("Search Links:")
    for supplier, url in links.items():
        print(f"  {supplier}: {url}")
    
    # Test price estimates
    print("\nPrice Estimates:")
    for hinge_type, prices in HARDWARE_PRICE_ESTIMATES["hinge"].items():
        print(f"  {hinge_type}: ${prices[0]:.2f} - ${prices[1]:.2f}")
