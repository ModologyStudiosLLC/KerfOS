"""
Edge Banding Optimization Module
Calculates and optimizes edge banding requirements for cabinet components.
"""

from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class EdgeBandingType(str, Enum):
    WOOD_VENEER = "wood_veneer"
    PVC = "pvc"
    MELAMINE = "melamine"
    ABS = "abs"
    METAL = "metal"
    NONE = "none"


class EdgePosition(str, Enum):
    TOP = "top"
    BOTTOM = "bottom"
    LEFT = "left"
    RIGHT = "right"
    ALL = "all"
    NONE = "none"


@dataclass
class EdgeBandingSpec:
    """Specification for edge banding on a component"""
    material: EdgeBandingType
    thickness: float  # in mm (typical: 0.5mm, 1mm, 2mm)
    width: float  # in inches (typically matches material thickness)
    color: Optional[str] = None
    pre_glued: bool = False
    
    def get_cost_per_foot(self) -> float:
        """Estimate cost per linear foot based on type"""
        costs = {
            EdgeBandingType.WOOD_VENEER: 0.15,
            EdgeBandingType.PVC: 0.08,
            EdgeBandingType.MELAMINE: 0.05,
            EdgeBandingType.ABS: 0.12,
            EdgeBandingType.METAL: 0.35,
            EdgeBandingType.NONE: 0.0
        }
        return costs.get(self.material, 0.10) * (self.thickness / 1.0)


@dataclass
class ComponentEdge:
    """Edge banding requirement for a single component edge"""
    component_id: str
    component_name: str
    edge_position: EdgePosition
    length: float  # in inches
    banding_spec: Optional[EdgeBandingSpec] = None
    is_visible: bool = True  # Whether edge is visible in final assembly
    priority: int = 1  # 1=must have, 2=should have, 3=nice to have


@dataclass
class EdgeBandingResult:
    """Result of edge banding optimization"""
    total_linear_feet: float
    total_cost: float
    edges_by_component: Dict[str, List[ComponentEdge]]
    edges_by_material: Dict[str, float]  # linear feet per material type
    purchase_list: List[Dict]
    waste_factor: float = 1.1  # 10% waste factor


class EdgeBandingOptimizer:
    """
    Optimizes edge banding requirements for cabinet projects.
    Calculates total linear footage, costs, and generates purchase lists.
    """
    
    # Standard roll lengths in feet
    ROLL_LENGTHS = {
        "small": 25,
        "medium": 50,
        "large": 250
    }
    
    def __init__(self, waste_factor: float = 1.1):
        self.waste_factor = waste_factor
        self.edges: List[ComponentEdge] = []
    
    def add_component(
        self,
        component_id: str,
        component_name: str,
        width: float,
        height: float,
        edge_positions: List[EdgePosition],
        banding_spec: EdgeBandingSpec,
        is_visible: bool = True,
        priority: int = 1
    ) -> None:
        """
        Add a component with edge banding requirements.
        
        Args:
            component_id: Unique identifier for the component
            component_name: Human-readable name
            width: Component width in inches
            height: Component height in inches
            edge_positions: Which edges need banding
            banding_spec: Edge banding specification
            is_visible: Whether edges are visible
            priority: Priority level (1-3)
        """
        for position in edge_positions:
            length = self._get_edge_length(position, width, height)
            self.edges.append(ComponentEdge(
                component_id=component_id,
                component_name=component_name,
                edge_position=position,
                length=length,
                banding_spec=banding_spec,
                is_visible=is_visible,
                priority=priority
            ))
    
    def _get_edge_length(
        self,
        position: EdgePosition,
        width: float,
        height: float
    ) -> float:
        """Get the length of an edge based on position"""
        if position in [EdgePosition.TOP, EdgePosition.BOTTOM]:
            return width
        elif position in [EdgePosition.LEFT, EdgePosition.RIGHT]:
            return height
        elif position == EdgePosition.ALL:
            return 2 * (width + height)
        return 0.0
    
    def calculate(self) -> EdgeBandingResult:
        """
        Calculate edge banding requirements.
        
        Returns:
            EdgeBandingResult with totals and purchase list
        """
        # Group by component
        edges_by_component: Dict[str, List[ComponentEdge]] = {}
        for edge in self.edges:
            if edge.component_id not in edges_by_component:
                edges_by_component[edge.component_id] = []
            edges_by_component[edge.component_id].append(edge)
        
        # Calculate totals by material
        edges_by_material: Dict[str, float] = {}
        for edge in self.edges:
            if edge.banding_spec:
                material_key = f"{edge.banding_spec.material.value}_{edge.banding_spec.thickness}mm"
                if material_key not in edges_by_material:
                    edges_by_material[material_key] = 0.0
                edges_by_material[material_key] += edge.length
        
        # Convert to linear feet with waste factor
        total_linear_feet = sum(edges_by_material.values()) / 12.0 * self.waste_factor
        
        # Calculate total cost
        total_cost = 0.0
        purchase_list = []
        
        for material_key, linear_inches in edges_by_material.items():
            material_type, thickness = material_key.rsplit("_", 1)
            thickness_mm = float(thickness.replace("mm", ""))
            
            linear_feet = linear_inches / 12.0 * self.waste_factor
            
            spec = EdgeBandingSpec(
                material=EdgeBandingType(material_type),
                thickness=thickness_mm,
                width=0.75  # Standard 3/4" width
            )
            
            cost_per_foot = spec.get_cost_per_foot()
            edge_cost = linear_feet * cost_per_foot
            total_cost += edge_cost
            
            # Determine roll size needed
            roll_size = self._determine_roll_size(linear_feet)
            
            purchase_list.append({
                "material": material_type.replace("_", " ").title(),
                "thickness_mm": thickness_mm,
                "linear_feet_needed": round(linear_feet, 2),
                "roll_size": roll_size,
                "rolls_needed": self._calculate_rolls_needed(linear_feet, roll_size),
                "cost_per_foot": round(cost_per_foot, 2),
                "total_cost": round(edge_cost, 2)
            })
        
        return EdgeBandingResult(
            total_linear_feet=round(total_linear_feet, 2),
            total_cost=round(total_cost, 2),
            edges_by_component=edges_by_component,
            edges_by_material={
                k: round(v / 12.0, 2) for k, v in edges_by_material.items()
            },
            purchase_list=purchase_list,
            waste_factor=self.waste_factor
        )
    
    def _determine_roll_size(self, linear_feet: float) -> int:
        """Determine appropriate roll size for the needed footage"""
        if linear_feet <= 20:
            return self.ROLL_LENGTHS["small"]
        elif linear_feet <= 40:
            return self.ROLL_LENGTHS["medium"]
        else:
            return self.ROLL_LENGTHS["large"]
    
    def _calculate_rolls_needed(self, linear_feet: float, roll_size: int) -> int:
        """Calculate number of rolls needed"""
        import math
        return math.ceil(linear_feet / roll_size)


def calculate_edge_banding(
    components: List[Dict],
    default_banding_type: str = "wood_veneer",
    default_thickness: float = 1.0,
    waste_factor: float = 1.1
) -> Dict:
    """
    Calculate edge banding requirements from component list.
    
    Args:
        components: List of component dicts with id, name, width, height, 
                   edges (list of edge positions: "top", "bottom", "left", "right")
        default_banding_type: Default edge banding material type
        default_thickness: Default thickness in mm
        waste_factor: Waste factor multiplier
        
    Returns:
        Dict with edge banding calculations
    """
    optimizer = EdgeBandingOptimizer(waste_factor=waste_factor)
    
    banding_spec = EdgeBandingSpec(
        material=EdgeBandingType(default_banding_type),
        thickness=default_thickness,
        width=0.75
    )
    
    for comp in components:
        edge_positions = [
            EdgePosition(e.lower()) for e in comp.get("edges", [])
            if e.lower() in [e.value for e in EdgePosition]
        ]
        
        if edge_positions:
            optimizer.add_component(
                component_id=comp["id"],
                component_name=comp["name"],
                width=comp["width"],
                height=comp["height"],
                edge_positions=edge_positions,
                banding_spec=banding_spec,
                is_visible=comp.get("visible_edges", True),
                priority=comp.get("priority", 1)
            )
    
    result = optimizer.calculate()
    
    return {
        "total_linear_feet": result.total_linear_feet,
        "total_cost": result.total_cost,
        "waste_factor": result.waste_factor,
        "edges_by_component": {
            comp_id: [
                {
                    "position": e.edge_position.value,
                    "length_inches": round(e.length, 4),
                    "is_visible": e.is_visible
                }
                for e in edges
            ]
            for comp_id, edges in result.edges_by_component.items()
        },
        "linear_feet_by_material": result.edges_by_material,
        "purchase_list": result.purchase_list
    }


# Convenience function for quick calculations
def get_edge_banding_summary(
    width: float,
    height: float,
    edges: List[str],
    banding_type: str = "wood_veneer",
    thickness: float = 1.0
) -> Dict:
    """
    Quick edge banding calculation for a single component.
    
    Args:
        width: Component width in inches
        height: Component height in inches
        edges: List of edges to band ("top", "bottom", "left", "right")
        banding_type: Type of edge banding
        thickness: Thickness in mm
        
    Returns:
        Dict with summary
    """
    components = [{
        "id": "1",
        "name": "Component",
        "width": width,
        "height": height,
        "edges": edges
    }]
    
    return calculate_edge_banding(components, banding_type, thickness)


if __name__ == "__main__":
    # Test with sample cabinet components
    components = [
        {
            "id": "1",
            "name": "Side Panel Left",
            "width": 24,
            "height": 34.5,
            "edges": ["front"]  # Front edge only
        },
        {
            "id": "2",
            "name": "Side Panel Right",
            "width": 24,
            "height": 34.5,
            "edges": ["front"]
        },
        {
            "id": "3",
            "name": "Top Shelf",
            "width": 22.5,
            "height": 23.25,
            "edges": ["front"]  # Front edge
        },
        {
            "id": "4",
            "name": "Adjustable Shelf",
            "width": 22.5,
            "height": 11.25,
            "edges": ["front"],
            "quantity": 3
        }
    ]
    
    result = calculate_edge_banding(components)
    print(f"Total Linear Feet: {result['total_linear_feet']}")
    print(f"Total Cost: ${result['total_cost']:.2f}")
    print("\nPurchase List:")
    for item in result['purchase_list']:
        print(f"  {item['material']}: {item['linear_feet_needed']} ft @ ${item['cost_per_foot']}/ft")
