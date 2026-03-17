"""
Hardware Recommendation Engine
Suggests hardware based on cabinet design, dimensions, and use case.
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum
import math


class CabinetType(str, Enum):
    BASE = "base"
    WALL = "wall"
    TALL = "tall"
    CORNER = "corner"
    VANITY = "vanity"
    PANTRY = "pantry"
    ENTERTAINMENT = "entertainment"
    GARAGE = "garage"


class DoorType(str, Enum):
    SINGLE_DOOR = "single_door"
    DOUBLE_DOOR = "double_door"
    DRAWER_BANK = "drawer_bank"
    DOOR_DRAWER = "door_drawer"
    OPEN_SHELF = "open_shelf"
    LAZY_SUSAN = "lazy_susan"
    NONE = "none"


class HardwareCategory(str, Enum):
    HINGE = "hinge"
    DRAWER_SLIDE = "drawer_slide"
    KNOB = "knob"
    PULL = "pull"
    SHELF_PIN = "shelf_pin"
    SCREW = "screw"
    BRACKET = "bracket"
    CATCH = "catch"
    LIGHTING = "lighting"


@dataclass
class HardwareRecommendation:
    """A single hardware recommendation"""
    category: HardwareCategory
    name: str
    quantity: int
    specifications: str
    supplier_links: Dict[str, str]
    estimated_price_range: tuple  # (low, high)
    priority: int  # 1=essential, 2=recommended, 3=optional
    notes: Optional[str] = None


@dataclass
class DesignAnalysis:
    """Analysis of cabinet design for hardware recommendations"""
    cabinet_type: CabinetType
    door_type: DoorType
    width: float
    height: float
    depth: float
    num_doors: int
    num_drawers: int
    num_shelves: int
    has_soft_close: bool
    has_face_frame: bool
    material_thickness: float


class HardwareRecommendationEngine:
    """
    Generates hardware recommendations based on cabinet design parameters.
    """
    
    # Standard hardware specifications
    HINGE_SPECS = {
        "overlay_standard": {
            "name": "Soft-Close Concealed Hinge 110°",
            "opening_angle": 110,
            "overlay_min": 0.5,
            "overlay_max": 0.75,
            "price_range": (3.50, 8.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=soft+close+hinge",
                "Woodcraft": "https://www.woodcraft.com/search?q=concealed+hinge",
                "Amazon": "https://www.amazon.com/s?k=soft+close+cabinet+hinges"
            }
        },
        "overlay_full": {
            "name": "Full Overlay Soft-Close Hinge",
            "opening_angle": 110,
            "overlay_min": 0.625,
            "overlay_max": 0.75,
            "price_range": (4.00, 10.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=full+overlay+hinge",
                "Woodcraft": "https://www.woodcraft.com/search?q=full+overlay+hinge"
            }
        },
        "inset": {
            "name": "Inset Soft-Close Hinge",
            "opening_angle": 100,
            "price_range": (5.00, 12.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=inset+hinge"
            }
        }
    }
    
    DRAWER_SLIDE_SPECS = {
        "full_extension": {
            "name": "Full Extension Soft-Close Drawer Slide",
            "price_range": (8.00, 25.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=full+extension+drawer+slide",
                "Woodcraft": "https://www.woodcraft.com/search?q=drawer+slides"
            }
        },
        "3_4_extension": {
            "name": "3/4 Extension Drawer Slide",
            "price_range": (5.00, 15.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=3/4+extension+slide"
            }
        },
        "under_mount": {
            "name": "Under-Mount Soft-Close Slide",
            "price_range": (15.00, 40.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=undermount+drawer+slide"
            }
        }
    }
    
    PULL_SPECS = {
        "standard": {
            "name": "Cabinet Pull 5\" CC",
            "price_range": (2.00, 15.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=cabinet+pull",
                "Home Depot": "https://www.homedepot.com/s/cabinet%20pull"
            }
        },
        "appliance": {
            "name": "Appliance Pull 8-12\" CC",
            "price_range": (15.00, 50.00),
            "suppliers": {
                "Rockler": "https://www.rockler.com/search?q=appliance+pull"
            }
        }
    }
    
    def __init__(self):
        self.recommendations: List[HardwareRecommendation] = []
    
    def analyze_design(
        self,
        width: float,
        height: float,
        depth: float,
        cabinet_type: str = "base",
        door_type: str = "single_door",
        num_doors: int = 1,
        num_drawers: int = 0,
        num_shelves: int = 2,
        has_soft_close: bool = True,
        has_face_frame: bool = True,
        material_thickness: float = 0.75
    ) -> DesignAnalysis:
        """
        Analyze cabinet design parameters.
        
        Args:
            width: Cabinet width in inches
            height: Cabinet height in inches
            depth: Cabinet depth in inches
            cabinet_type: Type of cabinet (base, wall, tall, etc.)
            door_type: Type of door configuration
            num_doors: Number of doors
            num_drawers: Number of drawers
            num_shelves: Number of adjustable shelves
            has_soft_close: Whether to use soft-close hardware
            has_face_frame: Whether cabinet has face frame
            material_thickness: Material thickness in inches
            
        Returns:
            DesignAnalysis object
        """
        return DesignAnalysis(
            cabinet_type=CabinetType(cabinet_type.lower()),
            door_type=DoorType(door_type.lower()),
            width=width,
            height=height,
            depth=depth,
            num_doors=num_doors,
            num_drawers=num_drawers,
            num_shelves=num_shelves,
            has_soft_close=has_soft_close,
            has_face_frame=has_face_frame,
            material_thickness=material_thickness
        )
    
    def get_recommendations(self, analysis: DesignAnalysis) -> List[HardwareRecommendation]:
        """
        Generate hardware recommendations based on design analysis.
        
        Args:
            analysis: DesignAnalysis object
            
        Returns:
            List of HardwareRecommendation objects
        """
        self.recommendations = []
        
        # Get recommendations by category
        self._recommend_hinges(analysis)
        self._recommend_drawer_slides(analysis)
        self._recommend_pulls_knobs(analysis)
        self._recommend_shelf_hardware(analysis)
        self._recommend_fasteners(analysis)
        self._recommend_optional_hardware(analysis)
        
        # Sort by priority
        self.recommendations.sort(key=lambda r: r.priority)
        
        return self.recommendations
    
    def _recommend_hinges(self, analysis: DesignAnalysis) -> None:
        """Recommend hinges based on door configuration"""
        
        if analysis.door_type == DoorType.NONE or analysis.door_type == DoorType.OPEN_SHELF:
            return
        
        # Determine hinge type
        if analysis.has_face_frame:
            hinge_type = "overlay_standard"
        else:
            hinge_type = "overlay_full"
        
        spec = self.HINGE_SPECS[hinge_type]
        
        # Calculate number of hinges per door based on height
        hinges_per_door = 2
        if analysis.height >= 40:
            hinges_per_door = 3
        elif analysis.height >= 48:
            hinges_per_door = 4
        
        # Lazy Susan needs 170° hinges
        if analysis.door_type == DoorType.LAZY_SUSAN:
            spec = {
                "name": "170° Wide Opening Hinge",
                "opening_angle": 170,
                "price_range": (6.00, 15.00),
                "suppliers": {
                    "Rockler": "https://www.rockler.com/search?q=170+degree+hinge"
                }
            }
        
        total_hinges = hinges_per_door * analysis.num_doors
        
        self.recommendations.append(HardwareRecommendation(
            category=HardwareCategory.HINGE,
            name=spec["name"],
            quantity=total_hinges,
            specifications=f"{spec['opening_angle']}° opening, soft-close: {analysis.has_soft_close}",
            supplier_links=spec.get("suppliers", {}),
            estimated_price_range=spec["price_range"],
            priority=1,
            notes=f"{hinges_per_door} hinges per door for {analysis.height}\" height"
        ))
    
    def _recommend_drawer_slides(self, analysis: DesignAnalysis) -> None:
        """Recommend drawer slides based on drawer configuration"""
        
        if analysis.num_drawers == 0:
            return
        
        # Determine slide length (depth - 1" clearance)
        slide_length = int(analysis.depth - 1)
        # Round to nearest standard length
        standard_lengths = [12, 14, 15, 16, 18, 20, 21, 22, 24]
        slide_length = min(standard_lengths, key=lambda x: abs(x - slide_length))
        
        # Determine slide type based on cabinet type
        if analysis.cabinet_type == CabinetType.VANITY:
            slide_type = "under_mount"
        elif analysis.has_soft_close:
            slide_type = "full_extension"
        else:
            slide_type = "3_4_extension"
        
        spec = self.DRAWER_SLIDE_SPECS[slide_type]
        
        self.recommendations.append(HardwareRecommendation(
            category=HardwareCategory.DRAWER_SLIDE,
            name=spec["name"],
            quantity=analysis.num_drawers * 2,  # 2 slides per drawer
            specifications=f"{slide_length}\" length, soft-close: {analysis.has_soft_close}",
            supplier_links=spec.get("suppliers", {}),
            estimated_price_range=spec["price_range"],
            priority=1,
            notes=f"{slide_length}\" slides for {analysis.depth}\" cabinet depth"
        ))
    
    def _recommend_pulls_knobs(self, analysis: DesignAnalysis) -> None:
        """Recommend pulls and knobs based on doors and drawers"""
        
        total_pulls = analysis.num_doors + analysis.num_drawers
        
        if total_pulls == 0:
            return
        
        # Recommend pulls for drawers, knobs or pulls for doors
        drawer_pulls = analysis.num_drawers
        door_pulls = analysis.num_doors
        
        # Tall cabinets (pantry) need appliance pulls
        if analysis.cabinet_type == CabinetType.PANTRY or analysis.height >= 72:
            spec = self.PULL_SPECS["appliance"]
            self.recommendations.append(HardwareRecommendation(
                category=HardwareCategory.PULL,
                name=spec["name"],
                quantity=analysis.num_doors,
                specifications="Heavy-duty tall cabinet pull",
                supplier_links=spec.get("suppliers", {}),
                estimated_price_range=spec["price_range"],
                priority=1,
                notes="Appliance-style pull for tall cabinet"
            ))
            total_pulls -= analysis.num_doors
        
        if total_pulls > 0:
            spec = self.PULL_SPECS["standard"]
            self.recommendations.append(HardwareRecommendation(
                category=HardwareCategory.PULL,
                name=spec["name"],
                quantity=total_pulls,
                specifications="5\" center-to-center",
                supplier_links=spec.get("suppliers", {}),
                estimated_price_range=spec["price_range"],
                priority=1
            ))
    
    def _recommend_shelf_hardware(self, analysis: DesignAnalysis) -> None:
        """Recommend shelf pins and supports"""
        
        if analysis.num_shelves == 0:
            return
        
        # 4 pins per shelf (2 per side)
        pins_needed = analysis.num_shelves * 4
        
        self.recommendations.append(HardwareRecommendation(
            category=HardwareCategory.SHELF_PIN,
            name="5mm Shelf Pin",
            quantity=pins_needed,
            specifications="5mm diameter, brass or nickel plated",
            supplier_links={
                "Rockler": "https://www.rockler.com/search?q=shelf+pin",
                "Woodcraft": "https://www.woodcraft.com/search?q=shelf+pin"
            },
            estimated_price_range=(0.25, 1.00),
            priority=2,
            notes=f"4 pins per shelf × {analysis.num_shelves} shelves"
        ))
    
    def _recommend_fasteners(self, analysis: DesignAnalysis) -> None:
        """Recommend screws and fasteners"""
        
        # Assembly screws (estimate based on cabinet size)
        assembly_screws = 20 if analysis.cabinet_type == CabinetType.BASE else 30
        
        self.recommendations.append(HardwareRecommendation(
            category=HardwareCategory.SCREW,
            name="Confirmat Screws (Assembly)",
            quantity=assembly_screws,
            specifications="7mm x 50mm, for cabinet assembly",
            supplier_links={
                "McMaster-Carr": "https://www.mcmaster.com/confirmat-screws",
                "Rockler": "https://www.rockler.com/search?q=confirmat+screw"
            },
            estimated_price_range=(0.15, 0.30),
            priority=2,
            notes="For joining cabinet panels"
        ))
        
        # Pocket hole screws for face frame
        if analysis.has_face_frame:
            self.recommendations.append(HardwareRecommendation(
                category=HardwareCategory.SCREW,
                name="Pocket Hole Screws",
                quantity=50,
                specifications="1-1/4\" coarse thread",
                supplier_links={
                    "Rockler": "https://www.rockler.com/search?q=pocket+hole+screws"
                },
                estimated_price_range=(0.05, 0.10),
                priority=2,
                notes="For face frame assembly"
            ))
    
    def _recommend_optional_hardware(self, analysis: DesignAnalysis) -> None:
        """Recommend optional hardware based on cabinet type"""
        
        # Corner cabinets need lazy susan hardware
        if analysis.cabinet_type == CabinetType.CORNER:
            self.recommendations.append(HardwareRecommendation(
                category=HardwareCategory.BRACKET,
                name="Lazy Susan Hardware",
                quantity=1,
                specifications=f"{min(analysis.width, analysis.depth) - 2}\" diameter",
                supplier_links={
                    "Rockler": "https://www.rockler.com/search?q=lazy+susan+hardware"
                },
                estimated_price_range=(40.00, 100.00),
                priority=2,
                notes="Full rotation corner cabinet hardware"
            ))
        
        # Base cabinets need toe kick
        if analysis.cabinet_type == CabinetType.BASE:
            self.recommendations.append(HardwareRecommendation(
                category=HardwareCategory.BRACKET,
                name="Toe Kick Brackets",
                quantity=4,
                specifications="Adjustable height 4\"-4.5\"",
                supplier_links={
                    "Rockler": "https://www.rockler.com/search?q=toe+kick"
                },
                estimated_price_range=(2.00, 5.00),
                priority=2,
                notes="For adjustable toe kick"
            ))
        
        # Tall cabinets need anti-tip
        if analysis.height >= 72:
            self.recommendations.append(HardwareRecommendation(
                category=HardwareCategory.BRACKET,
                name="Anti-Tip Wall Anchor Kit",
                quantity=1,
                specifications="Heavy-duty wall mounting",
                supplier_links={
                    "Home Depot": "https://www.homedepot.com/s/furniture%20anchor"
                },
                estimated_price_range=(8.00, 20.00),
                priority=1,
                notes="Required for tall cabinet safety"
            ))
        
        # Wall cabinets need mounting hardware
        if analysis.cabinet_type == CabinetType.WALL:
            self.recommendations.append(HardwareRecommendation(
                category=HardwareCategory.BRACKET,
                name="Wall Cabinet Hanger Brackets",
                quantity=2,
                specifications="Heavy-duty steel, 100lb capacity each",
                supplier_links={
                    "Rockler": "https://www.rockler.com/search?q=cabinet+hanger"
                },
                estimated_price_range=(5.00, 15.00),
                priority=1,
                notes="For secure wall mounting"
            ))


def get_hardware_recommendations(
    width: float,
    height: float,
    depth: float,
    cabinet_type: str = "base",
    door_type: str = "single_door",
    num_doors: int = 1,
    num_drawers: int = 0,
    num_shelves: int = 2,
    has_soft_close: bool = True,
    has_face_frame: bool = True
) -> Dict:
    """
    Convenience function to get hardware recommendations.
    
    Args:
        All cabinet design parameters
        
    Returns:
        Dict with recommendations and summary
    """
    engine = HardwareRecommendationEngine()
    
    analysis = engine.analyze_design(
        width=width,
        height=height,
        depth=depth,
        cabinet_type=cabinet_type,
        door_type=door_type,
        num_doors=num_doors,
        num_drawers=num_drawers,
        num_shelves=num_shelves,
        has_soft_close=has_soft_close,
        has_face_frame=has_face_frame
    )
    
    recommendations = engine.get_recommendations(analysis)
    
    # Calculate totals
    total_low = sum(r.estimated_price_range[0] * r.quantity for r in recommendations)
    total_high = sum(r.estimated_price_range[1] * r.quantity for r in recommendations)
    
    return {
        "cabinet_analysis": {
            "type": analysis.cabinet_type.value,
            "dimensions": f"{width}\" × {height}\" × {depth}\"",
            "doors": analysis.num_doors,
            "drawers": analysis.num_drawers,
            "shelves": analysis.num_shelves
        },
        "recommendations": [
            {
                "category": r.category.value,
                "name": r.name,
                "quantity": r.quantity,
                "specifications": r.specifications,
                "suppliers": r.supplier_links,
                "price_low": r.estimated_price_range[0] * r.quantity,
                "price_high": r.estimated_price_range[1] * r.quantity,
                "priority": r.priority,
                "notes": r.notes
            }
            for r in recommendations
        ],
        "summary": {
            "total_items": sum(r.quantity for r in recommendations),
            "total_cost_low": round(total_low, 2),
            "total_cost_high": round(total_high, 2),
            "categories_needed": list(set(r.category.value for r in recommendations))
        }
    }


if __name__ == "__main__":
    # Test with a base cabinet
    result = get_hardware_recommendations(
        width=24,
        height=34.5,
        depth=24,
        cabinet_type="base",
        door_type="door_drawer",
        num_doors=1,
        num_drawers=1,
        num_shelves=1,
        has_soft_close=True
    )
    
    print("Cabinet Analysis:", result["cabinet_analysis"])
    print("\nRecommendations:")
    for rec in result["recommendations"]:
        print(f"  [{rec['priority']}] {rec['name']}: {rec['quantity']} × ${rec['price_low']:.2f}-${rec['price_high']:.2f}")
    print(f"\nTotal: ${result['summary']['total_cost_low']:.2f} - ${result['summary']['total_cost_high']:.2f}")
