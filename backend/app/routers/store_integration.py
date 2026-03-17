"""
Home Depot & Lowe's Integration API
One-click "Add to Cart" with local store inventory check
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import urllib.parse

router = APIRouter()

# Store locations and info
STORES_DB = {
    "homedepot": {
        "name": "Home Depot",
        "base_url": "https://www.homedepot.com",
        "search_url": "https://www.homedepot.com/s/{query}",
        "cart_url": "https://www.homedepot.com/cart",
        "store_locator": "https://www.homedepot.com/l/",
        "color": "#F96302"
    },
    "lowes": {
        "name": "Lowe's",
        "base_url": "https://www.lowes.com",
        "search_url": "https://www.lowes.com/search?searchTerm={query}",
        "cart_url": "https://www.lowes.com/cart",
        "store_locator": "https://www.lowes.com/store/",
        "color": "#004990"
    },
    "menards": {
        "name": "Menards",
        "base_url": "https://www.menards.com",
        "search_url": "https://www.menards.com/main/search.html?search={query}",
        "cart_url": "https://www.menards.com/cart",
        "store_locator": "https://www.menards.com/storeLocator/",
        "color": "#0033A0"
    }
}

# Material SKUs and product info (simulated database)
PRODUCTS_DB = {
    # Plywood
    "plywood_3_4_bc": {
        "name": "3/4 in. x 4 ft. x 8 ft. BC Sanded Plywood",
        "sku": {"homedepot": "204609753", "lowes": "3002442"},
        "category": "plywood",
        "price": {"homedepot": 54.98, "lowes": 52.97},
        "unit": "sheet",
        "url": {
            "homedepot": "https://www.homedepot.com/p/204609753",
            "lowes": "https://www.lowes.com/pd/3002442"
        }
    },
    "plywood_3_4_birch": {
        "name": "3/4 in. x 4 ft. x 8 ft. Birch Plywood",
        "sku": {"homedepot": "318959261", "lowes": "1000411025"},
        "category": "plywood",
        "price": {"homedepot": 67.98, "lowes": 69.97},
        "unit": "sheet",
        "url": {
            "homedepot": "https://www.homedepot.com/p/318959261",
            "lowes": "https://www.lowes.com/pd/1000411025"
        }
    },
    "plywood_1_2": {
        "name": "1/2 in. x 4 ft. x 8 ft. Sanded Plywood",
        "sku": {"homedepot": "204609661", "lowes": "3002435"},
        "category": "plywood",
        "price": {"homedepot": 39.98, "lowes": 38.97},
        "unit": "sheet",
        "url": {
            "homedepot": "https://www.homedepot.com/p/204609661",
            "lowes": "https://www.lowes.com/pd/3002435"
        }
    },
    "plywood_1_4": {
        "name": "1/4 in. x 4 ft. x 8 ft. Sanded Plywood",
        "sku": {"homedepot": "204609517", "lowes": "3002428"},
        "category": "plywood",
        "price": {"homedepot": 24.98, "lowes": 23.97},
        "unit": "sheet",
        "url": {
            "homedepot": "https://www.homedepot.com/p/204609517",
            "lowes": "https://www.lowes.com/pd/3002428"
        }
    },
    
    # MDF
    "mdf_3_4": {
        "name": "3/4 in. x 4 ft. x 8 ft. MDF Panel",
        "sku": {"homedepot": "100005759", "lowes": "3002539"},
        "category": "mdf",
        "price": {"homedepot": 39.98, "lowes": 41.97},
        "unit": "sheet",
        "url": {
            "homedepot": "https://www.homedepot.com/p/100005759",
            "lowes": "https://www.lowes.com/pd/3002539"
        }
    },
    
    # Hardware - Hinges
    "hinge_soft_close": {
        "name": "Soft-Close Concealed Cabinet Hinge (2-Pack)",
        "sku": {"homedepot": "311123561", "lowes": "1001918593"},
        "category": "hardware",
        "price": {"homedepot": 14.98, "lowes": 15.47},
        "unit": "pack",
        "url": {
            "homedepot": "https://www.homedepot.com/p/311123561",
            "lowes": "https://www.lowes.com/pd/1001918593"
        }
    },
    "hinge_euro_100": {
        "name": "European Style Cabinet Hinge 100° (2-Pack)",
        "sku": {"homedepot": "100400549", "lowes": "3338936"},
        "category": "hardware",
        "price": {"homedepot": 8.98, "lowes": 9.27},
        "unit": "pack",
        "url": {
            "homedepot": "https://www.homedepot.com/p/100400549",
            "lowes": "https://www.lowes.com/pd/3338936"
        }
    },
    
    # Hardware - Drawer Slides
    "slide_18_soft_close": {
        "name": "18 in. Soft-Close Full Extension Drawer Slide (Pair)",
        "sku": {"homedepot": "311122834", "lowes": "1001918475"},
        "category": "hardware",
        "price": {"homedepot": 24.98, "lowes": 26.47},
        "unit": "pair",
        "url": {
            "homedepot": "https://www.homedepot.com/p/311122834",
            "lowes": "https://www.lowes.com/pd/1001918475"
        }
    },
    "slide_22_full_ext": {
        "name": "22 in. Full Extension Drawer Slide (Pair)",
        "sku": {"homedepot": "1001814093", "lowes": "3343822"},
        "category": "hardware",
        "price": {"homedepot": 18.98, "lowes": 19.97},
        "unit": "pair",
        "url": {
            "homedepot": "https://www.homedepot.com/p/1001814093",
            "lowes": "https://www.lowes.com/pd/3343822"
        }
    },
    
    # Edge Banding
    "edge_banding_3_4_birch": {
        "name": "3/4 in. x 25 ft. Birch Edge Banding",
        "sku": {"homedepot": "205821496", "lowes": "1000437681"},
        "category": "edge_banding",
        "price": {"homedepot": 9.98, "lowes": 10.47},
        "unit": "roll",
        "url": {
            "homedepot": "https://www.homedepot.com/p/205821496",
            "lowes": "https://www.lowes.com/pd/1000437681"
        }
    },
    
    # Screws & Fasteners
    "screws_pocket_1_25": {
        "name": "Kreg 1-1/4 in. Pocket Hole Screws (500-Pack)",
        "sku": {"homedepot": "205817637", "lowes": "50403319"},
        "category": "fasteners",
        "price": {"homedepot": 24.98, "lowes": 26.97},
        "unit": "pack",
        "url": {
            "homedepot": "https://www.homedepot.com/p/205817637",
            "lowes": "https://www.lowes.com/pd/50403319"
        }
    },
    "screws_wood_1_25": {
        "name": "#8 x 1-1/4 in. Wood Screws (1 lb. Pack)",
        "sku": {"homedepot": "204274039", "lowes": "3019671"},
        "category": "fasteners",
        "price": {"homedepot": 8.98, "lowes": 9.27},
        "unit": "pack",
        "url": {
            "homedepot": "https://www.homedepot.com/p/204274039",
            "lowes": "https://www.lowes.com/pd/3019671"
        }
    },
    
    # Shelf Pins
    "shelf_pins_5mm": {
        "name": "5mm Shelf Pins (48-Pack)",
        "sku": {"homedepot": "202041030", "lowes": "3338896"},
        "category": "hardware",
        "price": {"homedepot": 4.98, "lowes": 5.27},
        "unit": "pack",
        "url": {
            "homedepot": "https://www.homedepot.com/p/202041030",
            "lowes": "https://www.lowes.com/pd/3338896"
        }
    }
}

# Shopping cart storage
shopping_carts: Dict[str, Dict] = {}

class CartItem(BaseModel):
    product_id: str
    quantity: int
    store: str = "homedepot"

class Cart(BaseModel):
    cart_id: str
    items: List[Dict[str, Any]]
    total: float
    store_links: Dict[str, str]

class StoreInventory(BaseModel):
    store: str
    product_id: str
    in_stock: bool
    quantity_available: int
    store_name: str
    store_address: str
    price: float
    last_updated: str

@router.get("/stores")
async def list_stores() -> List[Dict[str, Any]]:
    """List all supported stores"""
    return [
        {"id": store_id, **store_info}
        for store_id, store_info in STORES_DB.items()
    ]

@router.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    """List all products, optionally filtered"""
    products = []
    for prod_id, prod_info in PRODUCTS_DB.items():
        if category and prod_info.get("category") != category:
            continue
        if search and search.lower() not in prod_info["name"].lower():
            continue
        products.append({"id": prod_id, **prod_info})
    return products

@router.get("/products/{product_id}")
async def get_product(product_id: str) -> Dict[str, Any]:
    """Get product details"""
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"id": product_id, **PRODUCTS_DB[product_id]}

@router.post("/cart/create")
async def create_cart() -> Dict[str, str]:
    """Create a new shopping cart"""
    cart_id = f"cart_{uuid.uuid4().hex[:8]}"
    shopping_carts[cart_id] = {
        "cart_id": cart_id,
        "items": [],
        "created_at": datetime.utcnow().isoformat()
    }
    return {"cart_id": cart_id, "message": "Cart created"}

@router.post("/cart/{cart_id}/add")
async def add_to_cart(cart_id: str, item: CartItem) -> Dict[str, Any]:
    """Add item to cart"""
    if cart_id not in shopping_carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if item.product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if item.store not in STORES_DB:
        raise HTTPException(status_code=400, detail="Invalid store")
    
    product = PRODUCTS_DB[item.product_id]
    
    cart_item = {
        "product_id": item.product_id,
        "name": product["name"],
        "quantity": item.quantity,
        "price": product["price"].get(item.store, 0),
        "total": product["price"].get(item.store, 0) * item.quantity,
        "sku": product["sku"].get(item.store),
        "url": product["url"].get(item.store),
        "store": item.store
    }
    
    shopping_carts[cart_id]["items"].append(cart_item)
    
    return {
        "cart_id": cart_id,
        "item": cart_item,
        "message": f"Added {item.quantity}x {product['name']} to cart"
    }

@router.get("/cart/{cart_id}", response_model=Cart)
async def get_cart(cart_id: str) -> Cart:
    """Get cart contents with store links"""
    if cart_id not in shopping_carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = shopping_carts[cart_id]
    items = cart["items"]
    total = sum(item["total"] for item in items)
    
    # Generate store links
    store_links = {}
    for store_id in STORES_DB:
        store_items = [i for i in items if i["store"] == store_id]
        if store_items:
            # Generate search URL for all items
            query = " ".join([i["name"] for i in store_items[:3]])
            store_links[store_id] = STORES_DB[store_id]["search_url"].format(
                query=urllib.parse.quote(query)
            )
    
    return Cart(
        cart_id=cart_id,
        items=items,
        total=round(total, 2),
        store_links=store_links
    )

@router.delete("/cart/{cart_id}/item/{item_index}")
async def remove_from_cart(cart_id: str, item_index: int) -> Dict[str, Any]:
    """Remove item from cart"""
    if cart_id not in shopping_carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = shopping_carts[cart_id]
    if item_index >= len(cart["items"]):
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    removed = cart["items"].pop(item_index)
    return {
        "cart_id": cart_id,
        "removed_item": removed,
        "message": f"Removed {removed['name']} from cart"
    }

@router.get("/inventory/{product_id}")
async def check_inventory(
    product_id: str,
    zip_code: str = Query(..., min_length=5, max_length=5),
    store: str = "homedepot"
) -> List[StoreInventory]:
    """
    Check inventory at local stores.
    Simulated for demo - would integrate with store APIs in production.
    """
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = PRODUCTS_DB[product_id]
    
    # Simulate inventory data (would call real store APIs)
    # Different inventory based on zip code hash for demo
    zip_hash = sum(int(c) for c in zip_code)
    
    inventory = []
    for store_id in ["homedepot", "lowes", "menards"]:
        if store_id not in STORES_DB:
            continue
        
        # Simulate stock based on zip hash
        in_stock = (zip_hash + hash(store_id)) % 3 != 0
        quantity = (zip_hash * 7 + hash(store_id)) % 50 + 5 if in_stock else 0
        
        inventory.append(StoreInventory(
            store=store_id,
            product_id=product_id,
            in_stock=in_stock,
            quantity_available=quantity,
            store_name=f"{STORES_DB[store_id]['name']} #{zip_hash % 1000 + 100}",
            store_address=f"{zip_hash % 9000 + 100} Main St, Your City",
            price=product["price"].get(store_id, 0),
            last_updated=datetime.utcnow().isoformat()
        ))
    
    return inventory

@router.post("/shopping-list")
async def generate_shopping_list(
    project_type: str,
    width: float,
    height: float,
    depth: float,
    store: str = "homedepot"
) -> Dict[str, Any]:
    """
    Generate a complete shopping list for a cabinet project.
    Includes materials, hardware, and fasteners.
    """
    # Calculate materials needed
    materials = []
    
    # Plywood calculation (simplified)
    plywood_sqft = (width * height * 2 + width * depth * 2 + height * depth * 2) / 144
    sheets_needed = max(1, int(plywood_sqft / 32) + 1)  # 4x8 = 32 sq ft
    
    materials.append({
        "product_id": "plywood_3_4_bc",
        "name": PRODUCTS_DB["plywood_3_4_bc"]["name"],
        "quantity": sheets_needed,
        "price": PRODUCTS_DB["plywood_3_4_bc"]["price"].get(store, 0),
        "total": PRODUCTS_DB["plywood_3_4_bc"]["price"].get(store, 0) * sheets_needed
    })
    
    # Back panel (1/4" plywood)
    back_sqft = (width * height) / 144
    back_sheets = max(1, int(back_sqft / 32) + 1)
    
    materials.append({
        "product_id": "plywood_1_4",
        "name": PRODUCTS_DB["plywood_1_4"]["name"],
        "quantity": back_sheets,
        "price": PRODUCTS_DB["plywood_1_4"]["price"].get(store, 0),
        "total": PRODUCTS_DB["plywood_1_4"]["price"].get(store, 0) * back_sheets
    })
    
    # Hardware
    hardware = [
        {
            "product_id": "hinge_soft_close",
            "name": PRODUCTS_DB["hinge_soft_close"]["name"],
            "quantity": 2,  # 2 packs = 4 hinges
            "price": PRODUCTS_DB["hinge_soft_close"]["price"].get(store, 0),
            "total": PRODUCTS_DB["hinge_soft_close"]["price"].get(store, 0) * 2
        },
        {
            "product_id": "shelf_pins_5mm",
            "name": PRODUCTS_DB["shelf_pins_5mm"]["name"],
            "quantity": 1,
            "price": PRODUCTS_DB["shelf_pins_5mm"]["price"].get(store, 0),
            "total": PRODUCTS_DB["shelf_pins_5mm"]["price"].get(store, 0)
        }
    ]
    
    # Fasteners
    fasteners = [
        {
            "product_id": "screws_pocket_1_25",
            "name": PRODUCTS_DB["screws_pocket_1_25"]["name"],
            "quantity": 1,
            "price": PRODUCTS_DB["screws_pocket_1_25"]["price"].get(store, 0),
            "total": PRODUCTS_DB["screws_pocket_1_25"]["price"].get(store, 0)
        }
    ]
    
    # Edge banding
    edge_length = width * 2 + height * 4  # Simplified
    edge_rolls = max(1, int(edge_length / 300) + 1)  # 25ft = 300 inches
    
    edge_banding = [
        {
            "product_id": "edge_banding_3_4_birch",
            "name": PRODUCTS_DB["edge_banding_3_4_birch"]["name"],
            "quantity": edge_rolls,
            "price": PRODUCTS_DB["edge_banding_3_4_birch"]["price"].get(store, 0),
            "total": PRODUCTS_DB["edge_banding_3_4_birch"]["price"].get(store, 0) * edge_rolls
        }
    ]
    
    # Calculate totals
    all_items = materials + hardware + fasteners + edge_banding
    total = sum(item["total"] for item in all_items)
    
    return {
        "project_type": project_type,
        "dimensions": {"width": width, "height": height, "depth": depth},
        "store": store,
        "materials": materials,
        "hardware": hardware,
        "fasteners": fasteners,
        "edge_banding": edge_banding,
        "total_items": len(all_items),
        "estimated_total": round(total, 2),
        "store_url": STORES_DB[store]["base_url"],
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/compare/{product_id}")
async def compare_prices(product_id: str) -> Dict[str, Any]:
    """Compare product prices across all stores"""
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = PRODUCTS_DB[product_id]
    
    comparisons = []
    for store_id, price in product["price"].items():
        if store_id in STORES_DB:
            comparisons.append({
                "store": store_id,
                "store_name": STORES_DB[store_id]["name"],
                "price": price,
                "sku": product["sku"].get(store_id),
                "url": product["url"].get(store_id)
            })
    
    # Sort by price
    comparisons.sort(key=lambda x: x["price"])
    
    return {
        "product_id": product_id,
        "product_name": product["name"],
        "category": product["category"],
        "comparisons": comparisons,
        "best_price": comparisons[0] if comparisons else None,
        "price_range": {
            "min": min(c["price"] for c in comparisons) if comparisons else 0,
            "max": max(c["price"] for c in comparisons) if comparisons else 0
        }
    }

@router.get("/quick-add/{product_id}")
async def get_quick_add_link(product_id: str, store: str = "homedepot") -> Dict[str, str]:
    """Get direct add-to-cart link for a product"""
    if product_id not in PRODUCTS_DB:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = PRODUCTS_DB[product_id]
    
    # Return direct product URL
    return {
        "product_id": product_id,
        "name": product["name"],
        "store": store,
        "url": product["url"].get(store, STORES_DB[store]["search_url"].format(
            query=urllib.parse.quote(product["name"])
        ))
    }
