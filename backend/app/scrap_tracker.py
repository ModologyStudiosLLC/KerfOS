"""Scrap Tracker Module for Modology Cabinet Designer

Tracks leftover pieces from cut operations and suggests uses for them.
"""
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import json


@dataclass
class ScrapPiece:
    """Represents a leftover piece of material after cutting"""
    id: str
    width: float  # Width in inches
    height: float  # Height in inches
    thickness: float  # Material thickness
    material_id: str
    material_name: str
    sheet_source: int  # Which sheet this came from
    x_position: float  # Original X position on sheet
    y_position: float  # Original Y position on sheet
    grain_direction: Optional[str] = None
    notes: str = ""
    created_at: datetime = None
    is_usable: bool = True
    project_id: Optional[int] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
    
    @property
    def area(self) -> float:
        """Area in square inches"""
        return self.width * self.height
    
    @property
    def area_sqft(self) -> float:
        """Area in square feet"""
        return self.area / 144.0
    
    def can_fit(self, needed_width: float, needed_height: float, allow_rotation: bool = True) -> bool:
        """Check if this scrap can fit a needed piece"""
        if self.width >= needed_width and self.height >= needed_height:
            return True
        if allow_rotation and self.width >= needed_height and self.height >= needed_width:
            return True
        return False


@dataclass
class ScrapSuggestion:
    """Suggestion for using a scrap piece"""
    scrap_id: str
    project_type: str  # drawer_bottom, shelf, small_box, etc.
    description: str
    max_width: float
    max_height: float
    priority: int  # 1 = high (good fit), 2 = medium, 3 = low (tight fit)
    

# Common small parts that scrap can be used for
SCRAP_USE_SUGGESTIONS = [
    {
        "name": "Drawer Bottom",
        "min_width": 12,
        "min_height": 12,
        "description": "Small drawer bottoms for cabinet drawers"
    },
    {
        "name": "Small Shelf",
        "min_width": 8,
        "min_height": 24,
        "description": "Narrow shelves for pantry or closet organizers"
    },
    {
        "name": "Cabinet Back",
        "min_width": 24,
        "min_height": 30,
        "description": "Back panel for small cabinets"
    },
    {
        "name": "Toe Kick",
        "min_width": 4,
        "min_height": 24,
        "description": "Toe kick panels for base cabinets"
    },
    {
        "name": "Drawer Dividers",
        "min_width": 3,
        "min_height": 12,
        "description": "Dividers for drawer organization"
    },
    {
        "name": "Small Box",
        "min_width": 6,
        "min_height": 6,
        "description": "Storage boxes or organizers"
    },
    {
        "name": "Shelf Pins/Supports",
        "min_width": 1,
        "min_height": 1,
        "description": "Small shelf support pieces"
    },
    {
        "name": "Jigs/Templates",
        "min_width": 4,
        "min_height": 12,
        "description": "Shop jigs and templates for future projects"
    },
    {
        "name": "Test Pieces",
        "min_width": 3,
        "min_height": 6,
        "description": "Test pieces for finish samples or practice cuts"
    },
    {
        "name": "Drawer Front (Narrow)",
        "min_width": 6,
        "min_height": 18,
        "description": "Narrow drawer fronts for small drawers"
    }
]


class ScrapTracker:
    """Tracks and manages scrap pieces from cut operations"""
    
    def __init__(self, min_usable_size: float = 4.0):
        """
        Initialize scrap tracker.
        
        Args:
            min_usable_size: Minimum dimension (in inches) for a piece to be considered usable
        """
        self.min_usable_size = min_usable_size
        self.scraps: List[ScrapPiece] = []
    
    def extract_scraps_from_sheet(
        self,
        sheet_width: float,
        sheet_height: float,
        cuts: List[Dict],
        material_id: str,
        material_name: str,
        thickness: float,
        sheet_index: int,
        project_id: Optional[int] = None
    ) -> List[ScrapPiece]:
        """
        Extract usable scrap pieces from a sheet after cuts are made.
        
        Uses a greedy algorithm to find rectangular regions not covered by cuts.
        
        Args:
            sheet_width: Width of the full sheet
            sheet_height: Height of the full sheet
            cuts: List of cut dictionaries with x, y, width, height
            material_id: ID of the material
            material_name: Name of the material
            thickness: Material thickness
            sheet_index: Index of the sheet (1, 2, 3, ...)
            project_id: Optional project ID to associate scraps with
            
        Returns:
            List of ScrapPiece objects representing usable leftovers
        """
        scraps = []
        
        # Create a grid representation of the sheet
        # Mark cells as used (True) or free (False)
        cell_size = 1.0  # 1 inch cells for simplicity
        grid_width = int(sheet_width / cell_size)
        grid_height = int(sheet_height / cell_size)
        grid = [[False] * grid_width for _ in range(grid_height)]
        
        # Mark cut areas as used
        for cut in cuts:
            x = int(cut['x'] / cell_size)
            y = int(cut['y'] / cell_size)
            w = int(cut['width'] / cell_size)
            h = int(cut['height'] / cell_size)
            
            for row in range(y, min(y + h, grid_height)):
                for col in range(x, min(x + w, grid_width)):
                    grid[row][col] = True
        
        # Find rectangular free regions (potential scrap)
        # Use a simple scan-line approach
        for row in range(grid_height):
            col = 0
            while col < grid_width:
                if not grid[row][col]:
                    # Found start of a free region, find its width
                    start_col = col
                    while col < grid_width and not grid[row][col]:
                        col += 1
                    region_width = col - start_col
                    
                    # Try to extend this region downward
                    region_height = 1
                    next_row = row + 1
                    while next_row < grid_height:
                        # Check if the same width is free in this row
                        all_free = True
                        for c in range(start_col, start_col + region_width):
                            if grid[next_row][c]:
                                all_free = False
                                break
                        if all_free:
                            region_height += 1
                            next_row += 1
                        else:
                            break
                    
                    # Convert to inches and check if usable
                    scrap_width = region_width * cell_size
                    scrap_height = region_height * cell_size
                    
                    if scrap_width >= self.min_usable_size and scrap_height >= self.min_usable_size:
                        scrap = ScrapPiece(
                            id=f"scrap_{sheet_index}_{row}_{start_col}_{datetime.utcnow().timestamp()}",
                            width=scrap_width,
                            height=scrap_height,
                            thickness=thickness,
                            material_id=material_id,
                            material_name=material_name,
                            sheet_source=sheet_index,
                            x_position=start_col * cell_size,
                            y_position=row * cell_size,
                            project_id=project_id
                        )
                        scraps.append(scrap)
                        
                        # Mark this region as used to avoid duplicates
                        for r in range(row, row + region_height):
                            for c in range(start_col, start_col + region_width):
                                grid[r][c] = True
                else:
                    col += 1
        
        self.scraps.extend(scraps)
        return scraps
    
    def get_suggestions_for_scrap(self, scrap: ScrapPiece) -> List[ScrapSuggestion]:
        """
        Get suggested uses for a scrap piece based on its size.
        
        Args:
            scrap: The scrap piece to find suggestions for
            
        Returns:
            List of ScrapSuggestion objects sorted by priority
        """
        suggestions = []
        
        for use in SCRAP_USE_SUGGESTIONS:
            min_w = use['min_width']
            min_h = use['min_height']
            
            # Check if scrap can fit this use (with rotation)
            if scrap.can_fit(min_w, min_h, allow_rotation=True):
                # Calculate priority based on how well it fits
                # Priority 1: Good fit (less than 20% waste)
                # Priority 2: Medium fit (20-50% waste)
                # Priority 3: Tight fit (over 50% waste)
                needed_area = min_w * min_h
                waste_ratio = (scrap.area - needed_area) / scrap.area
                
                if waste_ratio < 0.2:
                    priority = 1
                elif waste_ratio < 0.5:
                    priority = 2
                else:
                    priority = 3
                
                suggestion = ScrapSuggestion(
                    scrap_id=scrap.id,
                    project_type=use['name'],
                    description=use['description'],
                    max_width=scrap.width,
                    max_height=scrap.height,
                    priority=priority
                )
                suggestions.append(suggestion)
        
        # Sort by priority
        suggestions.sort(key=lambda x: x.priority)
        return suggestions
    
    def find_scrap_for_piece(
        self,
        needed_width: float,
        needed_height: float,
        material_id: Optional[str] = None,
        thickness: Optional[float] = None
    ) -> List[Tuple[ScrapPiece, bool]]:
        """
        Find scrap pieces that can fit a needed piece.
        
        Args:
            needed_width: Width needed
            needed_height: Height needed
            material_id: Optional material filter
            thickness: Optional thickness filter
            
        Returns:
            List of tuples (scrap, needs_rotation) sorted by best fit
        """
        matching = []
        
        for scrap in self.scraps:
            if not scrap.is_usable:
                continue
            if material_id and scrap.material_id != material_id:
                continue
            if thickness and abs(scrap.thickness - thickness) > 0.01:
                continue
            
            # Check fit without rotation
            if scrap.width >= needed_width and scrap.height >= needed_height:
                waste = (scrap.area - needed_width * needed_height) / scrap.area
                matching.append((scrap, False, waste))
            # Check with rotation
            elif scrap.width >= needed_height and scrap.height >= needed_width:
                waste = (scrap.area - needed_width * needed_height) / scrap.area
                matching.append((scrap, True, waste))
        
        # Sort by waste (best fit first)
        matching.sort(key=lambda x: x[2])
        return [(s[0], s[1]) for s in matching]
    
    def get_total_scrap_area(self, material_id: Optional[str] = None) -> float:
        """Get total area of scrap pieces in square feet"""
        total = 0.0
        for scrap in self.scraps:
            if scrap.is_usable:
                if material_id is None or scrap.material_id == material_id:
                    total += scrap.area_sqft
        return total
    
    def get_scrap_summary(self) -> Dict:
        """Get a summary of all scrap pieces"""
        by_material = {}
        
        for scrap in self.scraps:
            if scrap.material_id not in by_material:
                by_material[scrap.material_id] = {
                    'material_name': scrap.material_name,
                    'pieces': [],
                    'total_area_sqft': 0.0
                }
            by_material[scrap.material_id]['pieces'].append(scrap)
            by_material[scrap.material_id]['total_area_sqft'] += scrap.area_sqft
        
        return {
            'total_pieces': len(self.scraps),
            'total_area_sqft': sum(s.area_sqft for s in self.scraps),
            'by_material': by_material,
            'suggestions_count': sum(len(self.get_suggestions_for_scrap(s)) for s in self.scraps)
        }
    
    def mark_scrap_used(self, scrap_id: str) -> bool:
        """Mark a scrap piece as used"""
        for scrap in self.scraps:
            if scrap.id == scrap_id:
                scrap.is_usable = False
                return True
        return False
    
    def remove_scrap(self, scrap_id: str) -> bool:
        """Remove a scrap piece from tracking"""
        for i, scrap in enumerate(self.scraps):
            if scrap.id == scrap_id:
                self.scraps.pop(i)
                return True
        return False


def process_cutlist_for_scraps(
    cutlist_result: Dict,
    material_id: str,
    material_name: str,
    thickness: float,
    project_id: Optional[int] = None,
    min_usable_size: float = 4.0
) -> List[ScrapPiece]:
    """
    Process a cutlist result to extract and track scrap pieces.
    
    Args:
        cutlist_result: Result from cutlist optimizer with sheets and cuts
        material_id: Material ID
        material_name: Material name
        thickness: Material thickness
        project_id: Optional project ID
        min_usable_size: Minimum dimension for usable scrap
        
    Returns:
        List of ScrapPiece objects
    """
    tracker = ScrapTracker(min_usable_size=min_usable_size)
    all_scraps = []
    
    for sheet_index, sheet in enumerate(cutlist_result.get('cutList', []), 1):
        scraps = tracker.extract_scraps_from_sheet(
            sheet_width=sheet['width'],
            sheet_height=sheet['height'],
            cuts=sheet['cuts'],
            material_id=material_id,
            material_name=material_name,
            thickness=thickness,
            sheet_index=sheet_index,
            project_id=project_id
        )
        all_scraps.extend(scraps)
    
    return all_scraps


# Utility functions for API
def scrap_to_dict(scrap: ScrapPiece) -> Dict:
    """Convert ScrapPiece to dictionary for API response"""
    return {
        'id': scrap.id,
        'width': scrap.width,
        'height': scrap.height,
        'thickness': scrap.thickness,
        'material_id': scrap.material_id,
        'material_name': scrap.material_name,
        'sheet_source': scrap.sheet_source,
        'x_position': scrap.x_position,
        'y_position': scrap.y_position,
        'grain_direction': scrap.grain_direction,
        'notes': scrap.notes,
        'created_at': scrap.created_at.isoformat() if scrap.created_at else None,
        'is_usable': scrap.is_usable,
        'area_sqin': scrap.area,
        'area_sqft': scrap.area_sqft
    }


def suggestion_to_dict(suggestion: ScrapSuggestion) -> Dict:
    """Convert ScrapSuggestion to dictionary for API response"""
    return {
        'scrap_id': suggestion.scrap_id,
        'project_type': suggestion.project_type,
        'description': suggestion.description,
        'max_width': suggestion.max_width,
        'max_height': suggestion.max_height,
        'priority': suggestion.priority
    }
