"""Sketch to Design - Convert hand-drawn sketches and photos to cabinet designs."""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import base64
import json
import re


@dataclass
class DetectedSpecs:
    width: float
    height: float
    depth: float
    doors: int = 0
    drawers: int = 0
    shelves: int = 0


@dataclass
class GeneratedDesign:
    name: str
    description: str
    specs: DetectedSpecs
    design: Dict[str, Any]
    confidence: float = 0.8


@dataclass
class SketchToDesignResult:
    detected_cabinets: int
    confidence: float
    detected_style: str
    detected_type: str
    designs: List[GeneratedDesign]
    tips: List[str] = field(default_factory=list)


class SketchToDesignProcessor:
    """Convert sketches and photos to cabinet designs."""
    
    # Standard cabinet dimensions for reference
    STANDARD_DIMENSIONS = {
        'base_cabinet': {'height': 34.5, 'depth': 24, 'width_range': (12, 36)},
        'wall_cabinet': {'height': 30, 'depth': 12, 'width_range': (12, 36)},
        'tall_cabinet': {'height': 84, 'depth': 24, 'width_range': (12, 24)},
        'vanity': {'height': 32, 'depth': 21, 'width_range': (18, 48)},
    }
    
    # Common style patterns
    STYLE_PATTERNS = {
        'shaker': ['shaker', 'recessed panel', 'simple frame', 'clean lines'],
        'raised_panel': ['raised panel', 'arched', 'cathedral', 'traditional'],
        'flat': ['flat', 'slab', 'modern', 'minimalist', 'no frame'],
        'beadboard': ['beadboard', 'bead', 'cottage', 'country'],
        'glass': ['glass', 'display', 'showcase', 'transparent'],
    }
    
    def process(self, image_data: str) -> SketchToDesignResult:
        """Process an uploaded image and generate cabinet designs."""
        # Decode base64 image if needed
        if image_data.startswith('data:image'):
            image_data = image_data.split(',', 1)[1]
        
        # In a real implementation, this would use computer vision / ML
        # For now, we'll simulate detection based on common patterns
        
        # Simulate detection results
        detected = self._simulate_detection(image_data)
        
        # Generate design options based on detection
        designs = self._generate_designs(detected)
        
        return SketchToDesignResult(
            detected_cabinets=detected['cabinet_count'],
            confidence=detected['confidence'],
            detected_style=detected['style'],
            detected_type=detected['type'],
            designs=designs,
            tips=self._generate_tips(detected)
        )
    
    def _simulate_detection(self, image_data: str) -> Dict[str, Any]:
        """Simulate image detection (placeholder for ML model)."""
        # In production, this would use:
        # - OpenCV for edge detection
        # - TensorFlow/PyTorch for object detection
        # - Custom trained model for cabinet recognition
        
        # For demo, return a realistic simulation
        import hashlib
        
        # Use image hash to generate consistent "detection" results
        image_hash = hashlib.md5(image_data[:1000].encode()).hexdigest()
        hash_val = int(image_hash[:8], 16)
        
        # Generate varied results based on hash
        styles = ['shaker', 'raised_panel', 'flat', 'beadboard']
        types = ['base_cabinet', 'wall_cabinet', 'tall_cabinet', 'vanity']
        
        style_idx = hash_val % len(styles)
        type_idx = (hash_val >> 8) % len(types)
        
        return {
            'cabinet_count': 1 + (hash_val % 3),  # 1-3 cabinets
            'confidence': 0.7 + (hash_val % 30) / 100,  # 0.7-1.0
            'style': styles[style_idx],
            'type': types[type_idx],
            'dimensions': {
                'width': 12 + ((hash_val >> 16) % 25) * 1,  # 12-36
                'height': 30 + ((hash_val >> 20) % 10) * 1,  # 30-40
                'depth': 12 + ((hash_val >> 24) % 13) * 1,   # 12-24
            },
            'features': {
                'has_doors': (hash_val & 1) == 1,
                'has_drawers': (hash_val & 2) == 2,
                'has_shelves': (hash_val & 4) == 4,
            }
        }
    
    def _generate_designs(self, detected: Dict[str, Any]) -> List[GeneratedDesign]:
        """Generate design options based on detection results."""
        designs = []
        
        # Primary design based on detection
        primary_design = self._create_design_from_detection(detected, "Detected Design")
        designs.append(primary_design)
        
        # Alternative designs with variations
        if detected['confidence'] < 0.9:
            # Add alternative interpretation
            alt_detected = detected.copy()
            alt_detected['style'] = 'flat' if detected['style'] != 'flat' else 'shaker'
            alt_design = self._create_design_from_detection(
                alt_detected, 
                f"Alternative Style ({alt_detected['style'].title()})"
            )
            designs.append(alt_design)
        
        # Add a simplified version
        simple_design = self._create_simple_design(detected)
        designs.append(simple_design)
        
        return designs
    
    def _create_design_from_detection(
        self, 
        detected: Dict[str, Any], 
        name: str
    ) -> GeneratedDesign:
        """Create a design from detection results."""
        dims = detected['dimensions']
        features = detected['features']
        
        design = {
            'name': name,
            'width': dims['width'],
            'height': dims['height'],
            'depth': dims['depth'],
            'style': detected['style'],
            'type': detected['type'],
            'doors': [],
            'drawers': [],
            'shelves': [],
            'material': 'plywood_3_4',
            'finish': 'painted'
        }
        
        # Add doors
        if features['has_doors']:
            door_count = 1 if dims['width'] <= 18 else 2
            door_width = dims['width'] / door_count
            for i in range(door_count):
                design['doors'].append({
                    'width': door_width - 0.125,
                    'height': dims['height'] - 1,
                    'style': detected['style'],
                    'overlay': 0.5
                })
        
        # Add drawers
        if features['has_drawers']:
            drawer_count = 3 if dims['height'] > 30 else 2
            drawer_height = (dims['height'] - 4) / drawer_count
            for i in range(drawer_count):
                design['drawers'].append({
                    'width': dims['width'] - 1.5,
                    'height': drawer_height - 0.75,
                    'depth': dims['depth'] - 2,
                    'slide_type': 'full_extension'
                })
        
        # Add shelves
        if features['has_shelves']:
            shelf_count = 2
            for i in range(shelf_count):
                design['shelves'].append({
                    'width': dims['width'] - 1.5,
                    'depth': dims['depth'] - 0.5,
                    'adjustable': True
                })
        
        return GeneratedDesign(
            name=name,
            description=self._generate_description(detected),
            specs=DetectedSpecs(
                width=dims['width'],
                height=dims['height'],
                depth=dims['depth'],
                doors=len(design['doors']),
                drawers=len(design['drawers']),
                shelves=len(design['shelves'])
            ),
            design=design,
            confidence=detected['confidence']
        )
    
    def _create_simple_design(self, detected: Dict[str, Any]) -> GeneratedDesign:
        """Create a simplified version of the detected design."""
        dims = detected['dimensions']
        
        simple_design = {
            'name': 'Simplified Design',
            'width': dims['width'],
            'height': dims['height'],
            'depth': dims['depth'],
            'style': 'flat',
            'type': detected['type'],
            'doors': [{'width': dims['width'] - 0.125, 'height': dims['height'] - 1}],
            'drawers': [],
            'shelves': [{'width': dims['width'] - 1.5, 'depth': dims['depth'] - 0.5}],
            'material': 'plywood_3_4',
            'finish': 'painted'
        }
        
        return GeneratedDesign(
            name='Simplified Design',
            description='Clean, simple cabinet with flat door - great for beginners',
            specs=DetectedSpecs(
                width=dims['width'],
                height=dims['height'],
                depth=dims['depth'],
                doors=1,
                drawers=0,
                shelves=1
            ),
            design=simple_design,
            confidence=detected['confidence'] * 0.9
        )
    
    def _generate_description(self, detected: Dict[str, Any]) -> str:
        """Generate a description of the detected design."""
        dims = detected['dimensions']
        features = detected['features']
        
        parts = []
        parts.append(f"{detected['style'].replace('_', ' ').title()} style")
        parts.append(detected['type'].replace('_', ' ').title())
        
        features_list = []
        if features['has_doors']:
            features_list.append('doors')
        if features['has_drawers']:
            features_list.append('drawers')
        if features['has_shelves']:
            features_list.append('adjustable shelves')
        
        if features_list:
            parts.append(f"with {', '.join(features_list)}")
        
        return ' '.join(parts)
    
    def _generate_tips(self, detected: Dict[str, Any]) -> List[str]:
        """Generate tips for the user."""
        tips = []
        
        if detected['confidence'] < 0.8:
            tips.append("Upload a clearer image with better lighting for more accurate detection")
        
        if detected['style'] == 'raised_panel':
            tips.append("Raised panel doors require a raised panel router bit set")
        
        if detected['type'] == 'tall_cabinet':
            tips.append("Tall cabinets should be anchored to wall studs for safety")
        
        tips.append("You can customize all dimensions after selecting a design")
        tips.append("Use the Design Doctor to check for any issues before building")
        
        return tips


# FastAPI router for sketch-to-design endpoints
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/sketch-to-design", tags=["sketch-to-design"])


class ProcessRequest(BaseModel):
    image: str  # Base64 encoded image


class ProcessResponse(BaseModel):
    detected_cabinets: int
    confidence: float
    detected_style: str
    detected_type: str
    designs: List[Dict[str, Any]]
    tips: List[str]


@router.post("/process", response_model=ProcessResponse)
async def process_sketch(request: ProcessRequest):
    """Process an uploaded sketch or photo."""
    processor = SketchToDesignProcessor()
    result = processor.process(request.image)
    
    return ProcessResponse(
        detected_cabinets=result.detected_cabinets,
        confidence=result.confidence,
        detected_style=result.detected_style,
        detected_type=result.detected_type,
        designs=[
            {
                "name": d.name,
                "description": d.description,
                "specs": {
                    "width": d.specs.width,
                    "height": d.specs.height,
                    "depth": d.specs.depth,
                    "doors": d.specs.doors,
                    "drawers": d.specs.drawers,
                    "shelves": d.specs.shelves
                },
                "design": d.design,
                "confidence": d.confidence
            }
            for d in result.designs
        ],
        tips=result.tips
    )