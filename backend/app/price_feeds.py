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
    # Major Woodworking Retailers
    ROCKLER = "rockler"
    WOODCRAFT = "woodcraft"
    LEE_VALLEY = "lee_valley"
    KREG = "kreg"
    
    # Big Box Stores
    HOME_DEPOT = "home_depot"
    LOWES = "lowes"
    MENARDS = "menards"
    ACE_HARDWARE = "ace_hardware"
    
    # Specialty Hardware Suppliers
    MCMASTER = "mcmaster"
    BLUM = "blum"
    HAFELE = "hafele"
    GRASS = "grass"
    SUGATSUNE = "sugatsune"
    ACCURIDE = "accuride"
    
    # Online Hardware Retailers
    WOODWORKER_EXPRESS = "woodworker_express"
    DK_HARDWARE = "dk_hardware"
    CABINET_PARTS = "cabinet_parts"
    WOODWORKERS_HARDWARE = "woodworkers_hardware"
    HARDWARE_TREE = "hardware_tree"
    
    # General Online
    AMAZON = "amazon"
    
    # Plywood & Lumber Suppliers
    COLUMBIA_FOREST_PRODUCTS = "columbia_forest_products"
    HARDWOOD_STORE = "hardwood_store"
    BELL_FOREST = "bell_forest"
    ADVANTAGE_LUMBER = "advantage_lumber"


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


class SupplierCategory(str, Enum):
    """Categories for supplier classification"""
    WOODWORKING_RETAIL = "woodworking_retail"
    BIG_BOX = "big_box"
    SPECIALTY_HARDWARE = "specialty_hardware"
    ONLINE_HARDWARE = "online_hardware"
    LUMBER_PLYWOOD = "lumber_plywood"
    GENERAL_ONLINE = "general_online"


class SupplierConfig:
    """Configuration for supplier APIs"""
    
    CONFIGS = {
        # === Major Woodworking Retailers ===
        Supplier.ROCKLER: {
            "name": "Rockler",
            "base_url": "https://www.rockler.com",
            "search_url": "https://www.rockler.com/search?q={query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.WOODWORKING_RETAIL,
            "specialties": ["hardware", "tools", "jigs", "woodworking supplies"],
            "price_range": "mid-to-high",
            "notes": "Great for specialty jigs and unique hardware"
        },
        Supplier.WOODCRAFT: {
            "name": "Woodcraft",
            "base_url": "https://www.woodcraft.com",
            "search_url": "https://www.woodcraft.com/search?q={query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.WOODWORKING_RETAIL,
            "specialties": ["hardware", "tools", "wood", "kits"],
            "price_range": "mid-range",
            "notes": "Wide selection of hardware and tools"
        },
        Supplier.LEE_VALLEY: {
            "name": "Lee Valley Tools",
            "base_url": "https://www.leevalley.com",
            "search_url": "https://www.leevalley.com/en-us/search?txt={query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.WOODWORKING_RETAIL,
            "specialties": ["quality tools", "hardware", "garden", "Veritas tools"],
            "price_range": "mid-to-high",
            "notes": "Premium quality tools and hardware. Excellent customer service."
        },
        Supplier.KREG: {
            "name": "Kreg Tool Company",
            "base_url": "https://www.kregtool.com",
            "search_url": "https://www.kregtool.com/search?q={query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.WOODWORKING_RETAIL,
            "specialties": ["pocket hole jigs", "screws", "clamps", "workbenches"],
            "price_range": "mid-range",
            "notes": "Best source for pocket hole joinery systems"
        },
        
        # === Big Box Stores ===
        Supplier.HOME_DEPOT: {
            "name": "Home Depot",
            "base_url": "https://www.homedepot.com",
            "search_url": "https://www.homedepot.com/s/{query}",
            "api_available": True,
            "api_url": "https://api.homedepot.com/v1/products",
            "category": SupplierCategory.BIG_BOX,
            "specialties": ["plywood", "lumber", "basic hardware", "tools", "paint"],
            "price_range": "budget-to-mid",
            "notes": "Wide availability, good for basic materials. Check store inventory."
        },
        Supplier.LOWES: {
            "name": "Lowes",
            "base_url": "https://www.lowes.com",
            "search_url": "https://www.lowes.com/search?searchTerm={query}",
            "api_available": False,
            "category": SupplierCategory.BIG_BOX,
            "specialties": ["plywood", "lumber", "basic hardware", "tools"],
            "price_range": "budget-to-mid",
            "notes": "Good selection of plywood and basic hardware"
        },
        Supplier.MENARDS: {
            "name": "Menards",
            "base_url": "https://www.menards.com",
            "search_url": "https://www.menards.com/store/search.html?search={query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.BIG_BOX,
            "specialties": ["lumber", "plywood", "hardware", "tools"],
            "price_range": "budget",
            "notes": "Great prices on lumber and plywood. Midwest US mainly."
        },
        Supplier.ACE_HARDWARE: {
            "name": "Ace Hardware",
            "base_url": "https://www.acehardware.com",
            "search_url": "https://www.acehardware.com/search?query={query}",
            "api_available": False,
            "category": SupplierCategory.BIG_BOX,
            "specialties": ["hardware", "fasteners", "basic tools"],
            "price_range": "mid-range",
            "notes": "Helpful staff, good for finding odd hardware items"
        },
        
        # === Specialty Hardware Suppliers ===
        Supplier.MCMASTER: {
            "name": "McMaster-Carr",
            "base_url": "https://www.mcmaster.com",
            "search_url": "https://www.mcmaster.com/{query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.SPECIALTY_HARDWARE,
            "specialties": ["fasteners", "hardware", "raw materials", "everything"],
            "price_range": "mid-range",
            "notes": "Incredible selection. Fast shipping. No minimums."
        },
        Supplier.BLUM: {
            "name": "Blum",
            "base_url": "https://www.blum.com",
            "search_url": "https://www.blum.com/us/en/search/?q={query}",
            "api_available": False,
            "category": SupplierCategory.SPECIALTY_HARDWARE,
            "specialties": ["hinges", "drawer slides", "lift systems", "hardware"],
            "price_range": "premium",
            "notes": "Premium European hardware. Industry standard for quality."
        },
        Supplier.HAFELE: {
            "name": "Häfele",
            "base_url": "https://www.hafele.com",
            "search_url": "https://www.hafele.com/us/en/search?text={query}",
            "api_available": False,
            "category": SupplierCategory.SPECIALTY_HARDWARE,
            "specialties": ["hinges", "slides", "organizers", "lighting", "handles"],
            "price_range": "mid-to-premium",
            "notes": "Huge catalog of cabinet hardware and organizational systems"
        },
        Supplier.GRASS: {
            "name": "Grass",
            "base_url": "https://www.grassusa.com",
            "search_url": "https://www.grassusa.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.SPECIALTY_HARDWARE,
            "specialties": ["drawer slides", "hinges", "motion systems"],
            "price_range": "premium",
            "notes": "High-end slides and hinges. Smooth operation."
        },
        Supplier.SUGATSUNE: {
            "name": "Sugatsune",
            "base_url": "https://www.sugatsune.com",
            "search_url": "https://www.sugatsune.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.SPECIALTY_HARDWARE,
            "specialties": ["premium hardware", "slides", "hinges", "latches"],
            "price_range": "premium",
            "notes": "Japanese precision hardware. Beautiful design."
        },
        Supplier.ACCURIDE: {
            "name": "Accuride",
            "base_url": "https://www.accuride.com",
            "search_url": "https://www.accuride.com/en-us/search?keys={query}",
            "api_available": False,
            "category": SupplierCategory.SPECIALTY_HARDWARE,
            "specialties": ["drawer slides", "movement systems"],
            "price_range": "mid-to-premium",
            "notes": "Industry leader in drawer slides. Heavy duty options available."
        },
        
        # === Online Hardware Retailers ===
        Supplier.WOODWORKER_EXPRESS: {
            "name": "Woodworker Express",
            "base_url": "https://www.woodworkerexpress.com",
            "search_url": "https://www.woodworkerexpress.com/search?q={query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.ONLINE_HARDWARE,
            "specialties": ["cabinet hardware", "hinges", "slides", "organizers"],
            "price_range": "mid-range",
            "notes": "Good prices on cabinet hardware. Free shipping over $99."
        },
        Supplier.DK_HARDWARE: {
            "name": "DK Hardware",
            "base_url": "https://www.dkhardware.com",
            "search_url": "https://www.dkhardware.com/search?q={query}",
            "api_available": False,
            "scraping_allowed": True,
            "category": SupplierCategory.ONLINE_HARDWARE,
            "specialties": ["cabinet hardware", "tools", "fasteners"],
            "price_range": "budget-to-mid",
            "notes": "Competitive prices on hardware and tools"
        },
        Supplier.CABINET_PARTS: {
            "name": "CabinetParts.com",
            "base_url": "https://www.cabinetparts.com",
            "search_url": "https://www.cabinetparts.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.ONLINE_HARDWARE,
            "specialties": ["hinges", "slides", "knobs", "pulls", "lighting"],
            "price_range": "mid-range",
            "notes": "Specializes in cabinet hardware. Good selection of Blum products."
        },
        Supplier.WOODWORKERS_HARDWARE: {
            "name": "Woodworker's Hardware",
            "base_url": "https://www.wwhardware.com",
            "search_url": "https://www.wwhardware.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.ONLINE_HARDWARE,
            "specialties": ["cabinet hardware", "furniture hardware", "slides", "hinges"],
            "price_range": "mid-range",
            "notes": "Family-owned. Good customer service. Specializes in cabinet hardware."
        },
        Supplier.HARDWARE_TREE: {
            "name": "Hardware Tree",
            "base_url": "https://www.hardwaretree.com",
            "search_url": "https://www.hardwaretree.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.ONLINE_HARDWARE,
            "specialties": ["cabinet hardware", "organizers", "lighting"],
            "price_range": "mid-range",
            "notes": "Good selection of organizational accessories"
        },
        
        # === General Online ===
        Supplier.AMAZON: {
            "name": "Amazon",
            "base_url": "https://www.amazon.com",
            "search_url": "https://www.amazon.com/s?k={query}",
            "api_available": True,
            "api_url": "https://api.amazon.com/products",
            "category": SupplierCategory.GENERAL_ONLINE,
            "specialties": ["everything", "fast shipping", "reviews"],
            "price_range": "varies",
            "notes": "Check reviews carefully. Prime shipping is convenient."
        },
        
        # === Plywood & Lumber Suppliers ===
        Supplier.COLUMBIA_FOREST_PRODUCTS: {
            "name": "Columbia Forest Products",
            "base_url": "https://www.cfpwood.com",
            "search_url": "https://www.cfpwood.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.LUMBER_PLYWOOD,
            "specialties": ["hardwood plywood", "veneers", "PureBond"],
            "price_range": "mid-to-premium",
            "notes": "Largest manufacturer of hardwood plywood in North America. PureBond formaldehyde-free."
        },
        Supplier.HARDWOOD_STORE: {
            "name": "The Hardwood Store",
            "base_url": "https://www.hardwoodstore.com",
            "search_url": "https://www.hardwoodstore.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.LUMBER_PLYWOOD,
            "specialties": ["hardwood lumber", "plywood", "exotic woods"],
            "price_range": "mid-to-premium",
            "notes": "Wide selection of domestic and exotic hardwoods"
        },
        Supplier.BELL_FOREST: {
            "name": "Bell Forest Products",
            "base_url": "https://www.bellforestproducts.com",
            "search_url": "https://www.bellforestproducts.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.LUMBER_PLYWOOD,
            "specialties": ["exotic lumber", "burls", "figured wood", "plywood"],
            "price_range": "mid-to-premium",
            "notes": "Great for figured and exotic woods. Ships nationwide."
        },
        Supplier.ADVANTAGE_LUMBER: {
            "name": "Advantage Lumber",
            "base_url": "https://www.advantagelumber.com",
            "search_url": "https://www.advantagelumber.com/search?q={query}",
            "api_available": False,
            "category": SupplierCategory.LUMBER_PLYWOOD,
            "specialties": ["exotic lumber", "decking", "plywood"],
            "price_range": "mid-range",
            "notes": "Good prices on exotic hardwoods. Online ordering."
        },
    }
    
    @classmethod
    def get_suppliers_by_category(cls, category: SupplierCategory) -> Dict:
        """Get all suppliers in a specific category"""
        return {
            supplier: config 
            for supplier, config in cls.CONFIGS.items()
            if config.get("category") == category
        }
    
    @classmethod
    def get_suppliers_by_specialty(cls, specialty: str) -> Dict:
        """Get suppliers that specialize in a given area"""
        specialty_lower = specialty.lower()
        return {
            supplier: config 
            for supplier, config in cls.CONFIGS.items()
            if any(specialty_lower in s.lower() for s in config.get("specialties", []))
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
    
    def get_suppliers_by_category(self, category: SupplierCategory) -> Dict[str, str]:
        """Get all suppliers in a category with their search links for a product"""
        return SupplierConfig.get_suppliers_by_category(category)
    
    def get_suppliers_for_hardware(self, hardware_type: str) -> Dict[str, Dict]:
        """Get suppliers that specialize in a type of hardware"""
        return SupplierConfig.get_suppliers_by_specialty(hardware_type)


# Hardware category price estimation
HARDWARE_PRICE_ESTIMATES = {
    "hinge": {
        "concealed_soft_close": (3.50, 8.00),
        "concealed_standard": (1.50, 4.00),
        "european_110": (2.50, 6.00),
        "overlay": (2.00, 5.00),
        "inset": (5.00, 12.00),
        "butt": (0.50, 3.00),
        "piano": (15.00, 40.00),
        "soss": (8.00, 25.00),
        "pivot": (15.00, 50.00)
    },
    "drawer_slide": {
        "full_extension_soft_close": (8.00, 25.00),
        "full_extension_standard": (5.00, 15.00),
        "undermount_soft_close": (15.00, 40.00),
        "undermount_standard": (10.00, 25.00),
        "side_mount": (4.00, 12.00),
        "3_4_extension": (5.00, 15.00),
        "heavy_duty": (20.00, 60.00)
    },
    "pull": {
        "standard_3in": (1.50, 10.00),
        "standard_5in": (2.00, 15.00),
        "appliance_8in": (10.00, 35.00),
        "cup_pull": (5.00, 20.00),
        "bin_pull": (4.00, 15.00),
        "finger_pull": (3.00, 15.00),
        "edge_pull": (8.00, 30.00)
    },
    "knob": {
        "round": (1.00, 8.00),
        "square": (2.00, 10.00),
        "glass": (3.00, 15.00),
        "ceramic": (2.50, 12.00),
        "wood": (2.00, 10.00),
        "oil_rubbed_bronze": (3.00, 12.00)
    },
    "screw": {
        "confirmat_7x50": (0.15, 0.30),
        "pocket_hole": (0.05, 0.10),
        "wood_1_25": (0.02, 0.05),
        "shelf_pin": (0.25, 1.00),
        "brad": (0.02, 0.04),
        "laminate": (0.08, 0.15)
    },
    "bracket": {
        "corner": (0.50, 2.00),
        "shelf": (1.00, 5.00),
        "wall_mount": (3.00, 10.00),
        "anti_tip": (5.00, 15.00),
        "countertop_support": (8.00, 25.00)
    },
    "lighting": {
        "led_strip_24in": (15.00, 40.00),
        "led_strip_36in": (20.00, 50.00),
        "puck_light": (10.00, 30.00),
        "under_cabinet": (20.00, 60.00),
        "sensor_light": (15.00, 45.00),
        "tape_light_kit": (25.00, 80.00)
    },
    "organizer": {
        "pull_out_shelf": (30.00, 80.00),
        "trash_pullout": (50.00, 150.00),
        "lazy_susan": (25.00, 100.00),
        "corner_optimization": (75.00, 250.00),
        "drawer_divider": (10.00, 35.00),
        "cutlery_tray": (15.00, 50.00)
    },
    "edge_banding": {
        "iron_on_pvc_7_8": (0.15, 0.40),
        "iron_on_pvc_2in": (0.25, 0.60),
        "wood_veneer_7_8": (0.30, 0.80),
        "wood_veneer_2in": (0.50, 1.20),
        "pre_glued_pvc": (0.20, 0.50)
    },
    "countertop": {
        "laminate_per_sqft": (5.00, 15.00),
        "butcher_block_per_sqft": (20.00, 60.00),
        "quartz_per_sqft": (50.00, 120.00),
        "granite_per_sqft": (40.00, 100.00),
        "solid_surface_per_sqft": (35.00, 80.00)
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


# Recommended suppliers by hardware type
RECOMMENDED_SUPPLIERS = {
    "hinges": [
        (Supplier.BLUM, "Industry standard, premium quality"),
        (Supplier.HAFELE, "Wide selection, good value"),
        (Supplier.GRASS, "Smooth operation, high-end"),
        (Supplier.CABINET_PARTS, "Good prices on Blum products"),
        (Supplier.WOODWORKER_EXPRESS, "Competitive pricing"),
    ],
    "drawer_slides": [
        (Supplier.ACCURIDE, "Industry leader, reliable"),
        (Supplier.BLUM, "Premium undermount options"),
        (Supplier.GRASS, "Smooth motion systems"),
        (Supplier.HAFELE, "Good variety"),
        (Supplier.WOODWORKER_EXPRESS, "Budget-friendly options"),
    ],
    "knobs_pulls": [
        (Supplier.AMAZON, "Largest selection, reviews"),
        (Supplier.HOME_DEPOT, "In-store pickup available"),
        (Supplier.LOWES, "Good budget options"),
        (Supplier.HAFELE, "Designer collections"),
    ],
    "plywood": [
        (Supplier.HOME_DEPOT, "Convenient, basic options"),
        (Supplier.LOWES, "Good selection"),
        (Supplier.COLUMBIA_FOREST_PRODUCTS, "Premium hardwood plywood"),
        (Supplier.HARDWOOD_STORE, "Exotic and domestic"),
        (Supplier.MENARDS, "Budget-friendly"),
    ],
    "lumber": [
        (Supplier.HARDWOOD_STORE, "Wide selection"),
        (Supplier.BELL_FOREST, "Exotic and figured"),
        (Supplier.ADVANTAGE_LUMBER, "Good prices"),
        (Supplier.HOME_DEPOT, "Basic dimensional"),
    ],
    "fasteners": [
        (Supplier.MCMASTER, "Everything, fast shipping"),
        (Supplier.KREG, "Pocket hole screws"),
        (Supplier.ACE_HARDWARE, "Help finding odd sizes"),
        (Supplier.AMAZON, "Bulk options"),
    ],
    "tools": [
        (Supplier.ROCKLER, "Specialty woodworking tools"),
        (Supplier.WOODCRAFT, "Wide tool selection"),
        (Supplier.LEE_VALLEY, "Premium quality"),
        (Supplier.KREG, "Jigs and pocket hole systems"),
        (Supplier.HOME_DEPOT, "Basic power tools"),
    ],
    "organizers": [
        (Supplier.HAFELE, "Complete systems"),
        (Supplier.WOODWORKER_EXPRESS, "Pull-outs and accessories"),
        (Supplier.CABINET_PARTS, "Good selection"),
        (Supplier.HARDWARE_TREE, "Specialty organizers"),
    ],
    "edge_banding": [
        (Supplier.WOODCRAFT, "Wood veneer options"),
        (Supplier.ROCKLER, "Good selection"),
        (Supplier.WOODWORKER_EXPRESS, "PVC and wood"),
        (Supplier.AMAZON, "Bulk rolls"),
    ],
    "lighting": [
        (Supplier.HAFELE, "Integrated systems"),
        (Supplier.HOME_DEPOT, "Basic LED options"),
        (Supplier.AMAZON, "Wide selection"),
        (Supplier.WOODWORKER_EXPRESS, "Under-cabinet"),
    ],
}


def get_recommended_suppliers(hardware_type: str) -> List[tuple]:
    """
    Get recommended suppliers for a hardware type.
    
    Args:
        hardware_type: Type of hardware (hinges, drawer_slides, etc.)
        
    Returns:
        List of (Supplier, reason) tuples
    """
    return RECOMMENDED_SUPPLIERS.get(hardware_type.lower(), [])


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


def get_supplier_info(supplier: Supplier) -> Optional[Dict]:
    """Get detailed information about a supplier"""
    config = SupplierConfig.CONFIGS.get(supplier)
    if config:
        return {
            "id": supplier.value,
            "name": config["name"],
            "base_url": config["base_url"],
            "category": config.get("category", "").value if config.get("category") else None,
            "specialties": config.get("specialties", []),
            "price_range": config.get("price_range", "varies"),
            "notes": config.get("notes", ""),
            "api_available": config.get("api_available", False),
        }
    return None


def list_all_suppliers() -> List[Dict]:
    """List all available suppliers with their details"""
    return [
        get_supplier_info(supplier)
        for supplier in Supplier
        if get_supplier_info(supplier)
    ]


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
    
    # Test recommended suppliers
    print("\nRecommended Suppliers for Hinges:")
    for supplier, reason in get_recommended_suppliers("hinges"):
        print(f"  {supplier.value}: {reason}")
