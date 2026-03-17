"""
Cut List Optimizer for Cabinet Designer
Uses 2D bin packing algorithm to optimize cuts on sheet goods
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum


class SheetSize(Enum):
    """Standard plywood/sheet good sizes"""
    FULL_4X8 = (96, 96)  # 4' x 8' (most common)
    HALF_4X4 = (48, 96)  # 4' x 8' (half sheet)
    QUARTER_2X4 = (24, 96)  # 2' x 8' (quarter sheet)
    EURO_4X8 = (120, 240)  # 1.2m x 2.4m (European)


@dataclass
class CutItem:
    """Represents a single cut piece"""
    x: float  # X position on sheet
    y: float  # Y position on sheet
    width: float  # Width of piece
    height: float  # Height of piece
    part_id: str  # ID of the cabinet component
    part_name: str  # Human-readable name
    material_id: str  # Material reference
    rotation: bool = False  # Whether piece is rotated


@dataclass
class CutSheet:
    """Represents a single sheet of material with cuts"""
    sheet_number: int  # Sheet index (1, 2, 3, ...)
    width: float  # Sheet width
    height: float  # Sheet height
    cuts: List[CutItem]  # List of cuts on this sheet
    used_area: float = 0.0  # Total area used by cuts


@dataclass
class Component:
    """Cabinet component to be cut"""
    id: str
    name: str
    width: float
    height: float
    quantity: int
    material_id: str


@dataclass
class OptimizationResult:
    """Result of cut list optimization"""
    sheets: List[CutSheet]
    total_sheets: int
    waste_percentage: float
    used_area: float
    total_area: float
    cuts_per_sheet: Dict[int, int]


class CutListOptimizer:
    """Main optimizer class using 2D bin packing"""
    
    def __init__(self, sheet_size: SheetSize = SheetSize.FULL_4X8):
        self.sheet_size = sheet_size
        self.sheet_width, self.sheet_height = sheet_size.value
        self.sheets: List[CutSheet] = []
        self.current_sheet: Optional[CutSheet] = None
    
    def optimize(self, components: List[Component]) -> OptimizationResult:
        """
        Optimize cut list for given components
        
        Args:
            components: List of cabinet components to cut
            
        Returns:
            OptimizationResult with sheets and metrics
        """
        # Create cut items for each component (multiplied by quantity)
        cut_items = []
        for component in components:
            for _ in range(component.quantity):
                cut_items.append(CutItem(
                    x=0.0,
                    y=0.0,
                    width=component.width,
                    height=component.height,
                    part_id=component.id,
                    part_name=component.name,
                    material_id=component.material_id
                ))
        
        # Sort items by size (largest first for better packing)
        cut_items.sort(key=lambda x: max(x.width, x.height), reverse=True)
        
        # Pack items into sheets
        self._pack_items(cut_items)
        
        # Calculate statistics
        result = self._calculate_results()
        
        return result
    
    def _pack_items(self, items: List[CutItem]) -> None:
        """Pack items into sheets using first-fit algorithm"""
        
        for item in items:
            packed = False
            
            # Try to fit into existing sheets
            for sheet in self.sheets:
                if self._try_fit_item(sheet, item):
                    packed = True
                    break
            
            # If didn't fit, create new sheet
            if not packed:
                self._add_new_sheet()
                if not self._try_fit_item(self.sheets[-1], item):
                    # Try rotation if normal fit failed
                    if self._try_fit_with_rotation(self.sheets[-1], item):
                        packed = True
            
            if not packed:
                # Item too large for sheet - this shouldn't happen with typical cabinets
                raise ValueError(f"Item {item.part_name} ({item.width}x{item.height}) too large for sheet ({self.sheet_width}x{self.sheet_height})")
    
    def _try_fit_item(self, sheet: CutSheet, item: CutItem) -> bool:
        """Try to place item at first available position on sheet"""
        
        for x in self._get_possible_x_positions(sheet, item):
            for y in self._get_possible_y_positions(sheet, item, x):
                if self._can_place_at(sheet, item, x, y):
                    self._place_item(sheet, item, x, y)
                    return True
        
        return False
    
    def _try_fit_with_rotation(self, sheet: CutSheet, item: CutItem) -> bool:
        """Try to fit item by rotating 90 degrees"""
        
        # Swap width and height
        rotated_width = item.height
        rotated_height = item.width
        
        for x in self._get_possible_x_positions(sheet, item, rotated_width, rotated_height):
            for y in self._get_possible_y_positions(sheet, item, x, rotated_width, rotated_height):
                if self._can_place_at(sheet, item, x, y, rotated_width, rotated_height):
                    item.rotation = True
                    self._place_item(sheet, item, x, y, rotated_width, rotated_height)
                    return True
        
        return False
    
    def _get_possible_x_positions(self, sheet: CutSheet, item: CutItem, 
                                width: Optional[float] = None, 
                                height: Optional[float] = None) -> List[float]:
        """Get possible X positions to try"""
        
        item_width = width if width is not None else item.width
        possible_x = [0.0]
        
        for cut in sheet.cuts:
            possible_x.append(cut.x + cut.width)
        
        # Filter out positions where item would go off sheet
        return [x for x in possible_x if x + item_width <= self.sheet_width]
    
    def _get_possible_y_positions(self, sheet: CutSheet, item: CutItem, x: float,
                                width: Optional[float] = None,
                                height: Optional[float] = None) -> List[float]:
        """Get possible Y positions at given X position"""
        
        item_height = height if height is not None else item.height
        possible_y = [0.0]
        
        for cut in sheet.cuts:
            # Check if cut spans past current X position
            if cut.x < x < cut.x + cut.width:
                possible_y.append(cut.y + cut.height)
        
        # Filter out positions where item would go off sheet
        return [y for y in possible_y if y + item_height <= self.sheet_height]
    
    def _can_place_at(self, sheet: CutSheet, item: CutItem, x: float, y: float,
                     width: Optional[float] = None, height: Optional[float] = None) -> bool:
        """Check if item can be placed at given position without overlapping"""
        
        item_width = width if width is not None else item.width
        item_height = height if height is not None else item.height
        
        # Check if item fits on sheet
        if x + item_width > self.sheet_width or y + item_height > self.sheet_height:
            return False
        
        # Check for overlaps with existing cuts
        for cut in sheet.cuts:
            if self._items_overlap(
                x, y, x + item_width, y + item_height,
                cut.x, cut.y, cut.x + cut.width, cut.y + cut.height
            ):
                return False
        
        return True
    
    def _items_overlap(self, x1: float, y1: float, x2: float, y2: float,
                     x3: float, y3: float, x4: float, y4: float) -> bool:
        """Check if two rectangles overlap"""
        
        return not (
            x2 <= x3 or x4 <= x1 or y2 <= y3 or y4 <= y1
        )
    
    def _place_item(self, sheet: CutSheet, item: CutItem, x: float, y: float,
                   width: Optional[float] = None, height: Optional[float] = None) -> None:
        """Place item on sheet at given position"""
        
        item_width = width if width is not None else item.width
        item_height = height if height is not None else item.height
        
        item.x = x
        item.y = y
        item.width = item_width
        item.height = item_height
        
        sheet.cuts.append(item)
        sheet.used_area += item_width * item_height
    
    def _add_new_sheet(self) -> None:
        """Create a new empty sheet"""
        
        sheet = CutSheet(
            sheet_number=len(self.sheets) + 1,
            width=self.sheet_width,
            height=self.sheet_height,
            cuts=[]
        )
        self.sheets.append(sheet)
        self.current_sheet = sheet
    
    def _calculate_results(self) -> OptimizationResult:
        """Calculate optimization statistics"""
        
        total_area = len(self.sheets) * self.sheet_width * self.sheet_height
        used_area = sum(sheet.used_area for sheet in self.sheets)
        waste_percentage = ((total_area - used_area) / total_area) * 100 if total_area > 0 else 0
        
        # Count cuts per sheet
        cuts_per_sheet = {sheet.sheet_number: len(sheet.cuts) for sheet in self.sheets}
        
        return OptimizationResult(
            sheets=self.sheets,
            total_sheets=len(self.sheets),
            waste_percentage=waste_percentage,
            used_area=used_area,
            total_area=total_area,
            cuts_per_sheet=cuts_per_sheet
        )


def optimize_cut_list(components: List[Dict], sheet_size: str = "4x8") -> Dict:
    """
    Convenience function to optimize cut list from component dictionaries
    
    Args:
        components: List of component dicts with id, name, width, height, quantity, material_id
        sheet_size: Size of sheet material ("4x8", "4x4", "2x4", "euro")
        
    Returns:
        Dict with optimized cut list and statistics
    """
    
    # Parse sheet size
    sheet_size_enum = {
        "4x8": SheetSize.FULL_4X8,
        "4x4": SheetSize.HALF_4X4,
        "2x4": SheetSize.QUARTER_2X4,
        "euro": SheetSize.EURO_4X8
    }.get(sheet_size.lower(), SheetSize.FULL_4X8)
    
    # Create component objects
    component_objs = [
        Component(
            id=c["id"],
            name=c["name"],
            width=float(c["width"]),
            height=float(c["height"]),
            quantity=int(c["quantity"]),
            material_id=c["material_id"]
        )
        for c in components
    ]
    
    # Optimize
    optimizer = CutListOptimizer(sheet_size=sheet_size_enum)
    result = optimizer.optimize(component_objs)
    
    # Format result for API
    sheets = [
        {
            "sheet_number": sheet.sheet_number,
            "width": sheet.width,
            "height": sheet.height,
            "cuts": [
                {
                    "x": cut.x,
                    "y": cut.y,
                    "width": cut.width,
                    "height": cut.height,
                    "part_name": cut.part_name,
                    "part_id": cut.part_id
                }
                for cut in sheet.cuts
            ]
        }
        for sheet in result.sheets
    ]
    
    return {
        "cut_list": sheets,
        "waste_percentage": result.waste_percentage,
        "total_sheets": result.total_sheets,
        "used_area": result.used_area,
        "total_area": result.total_area,
        "cuts_per_sheet": result.cuts_per_sheet
    }


# Example usage
if __name__ == "__main__":
    # Test with sample components
    components = [
        {
            "id": "1",
            "name": "Side Panel",
            "width": 24,
            "height": 72,
            "quantity": 2,
            "material_id": "1"
        },
        {
            "id": "2",
            "name": "Top/Bottom",
            "width": 36,
            "height": 24,
            "quantity": 2,
            "material_id": "1"
        },
        {
            "id": "3",
            "name": "Shelf",
            "width": 34,
            "height": 12,
            "quantity": 4,
            "material_id": "1"
        },
        {
            "id": "4",
            "name": "Door Front",
            "width": 35.875,
            "height": 71.875,
            "quantity": 1,
            "material_id": "1"
        }
    ]
    
    result = optimize_cut_list(components, sheet_size="4x8")
    
    print(f"Total Sheets: {result['total_sheets']}")
    print(f"Waste: {result['waste_percentage']:.1f}%")
    print(f"Used Area: {result['used_area']:.2f} sq in")
    print(f"Total Area: {result['total_area']:.2f} sq in")
    print(f"\nCuts per sheet:")
    for sheet_num, cuts_count in result['cuts_per_sheet'].items():
        print(f"  Sheet {sheet_num}: {cuts_count} cuts")
