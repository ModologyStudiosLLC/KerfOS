"""3D Export Functions for Cabinet Designer


Exports cabinets to various 3D formats for Shapr3D, SketchUp, and other tools.
"""
import json
import base64
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from fastapi import HTTPException

import numpy as np
from scipy.spatial import ConvexHull


@dataclass
class Vertex:
    """3D vertex with x, y, z coordinates"""
    x: float
    y: float
    z: float


@dataclass
class Face:
    """Triangular face with vertex indices"""
    v1: int
    v2: int
    v3: int

    normal: Tuple[float, float, float] = (0.0, 0.0, 1.0)

@dataclass
class MaterialInfo:
    """Material information for exports"""
    name: str
    type: str  # plywood, mdf, hardwood
    thickness: float  # in mm
    color: str = "#8B7355"  # Default wood color

def generate_obj(cabinet_data: Dict[str, Any], material_info: MaterialInfo) -> str:
    """Generate OBJ file for Shapr3D and other 3D tools
    
    Args:
        cabinet_data: Cabinet design with components
        material_info: Material properties
    
    Returns:
        OBJ file content as string
    """
    vertices: List[Vertex] = []
    faces: List[Face] = []
    vertex_count = 0
    
    # Generate cabinet box
    cabinet = cabinet_data
    width = cabinet.get('width', 36.0)  # inches
    height = cabinet.get('height', 34.5)  # inches
    depth = cabinet.get('depth', 24.0)  # inches
    
    # Convert inches to mm for 3D (1 inch = 25.4 mm)
    w_mm = width * 25.4
    h_mm = height * 25.4
    d_mm = depth * 25.4
    thickness = material_info.thickness
    
    # Generate vertices for cabinet box
    # Bottom face (z = 0)
    vertices.extend([
        Vertex(0, 0, 0),
        Vertex(w_mm, 0, 0),
        Vertex(w_mm, d_mm, 0),
        Vertex(0, d_mm, 0),
    ])
    
    # Top face (z = h_mm)
    vertices.extend([
        Vertex(0, 0, h_mm),
        Vertex(w_mm, 0, h_mm),
        Vertex(w_mm, d_mm, h_mm),
        Vertex(0, d_mm, h_mm),
    ])
    
    # Generate faces (triangular)
    # Bottom face
    faces.extend([
        Face(0, 1, 2),
        Face(0, 2, 3),
    ])
    
    # Top face
    faces.extend([
        Face(4, 7, 6),
        Face(4, 6, 5),
    ])
    
    # Front face
    faces.extend([
        Face(0, 4, 5),
        Face(0, 5, 1),
    ])
    
    # Back face
    faces.extend([
        Face(2, 6, 7),
        Face(2, 7, 3),
    ])
    
    # Left face
    faces.extend([
        Face(0, 3, 7),
        Face(0, 7, 4),
    ])
    
    # Right face
    faces.extend([
        Face(1, 5, 6),
        Face(1, 6, 2),
    ])
    
    # Build OBJ content
    obj_content = []
    obj_content.append(f"# Modology Cabinet Designer - OBJ Export")
    obj_content.append(f"# Cabinet: {cabinet.get('name', 'Cabinet')}")
    obj_content.append(f"# Material: {material_info.name}")
    obj_content.append("")
    obj_content.append(f"# Vertices ({len(vertices)})")
    for v in vertices:
        obj_content.append(f"v {v.x:.2f} {v.y:.2f} {v.z:.2f}")
    
    obj_content.append("")
    obj_content.append(f"# Faces ({len(faces)})")
    for i, f in enumerate(faces):
        obj_content.append(f"f {f.v1+1} {f.v2+1} {f.v3+1}")
    
    return "\n".join(obj_content)

def generate_stl(cabinet_data: Dict[str, Any], material_info: MaterialInfo) -> bytes:
    """Generate STL file for 3D printing and CNC
    
    Args:
        cabinet_data: Cabinet design with components
        material_info: Material properties
    
    Returns:
        STL file content as bytes (binary)
    """
    # First generate OBJ, then convert to STL
    obj_content = generate_obj(cabinet_data, material_info)
    lines = obj_content.strip().split('\n')
    
    # Parse vertices and faces
    vertices: List[Tuple[float, float, float]] = []
    faces: List[List[int]] = []
    
    for line in lines:
        if line.startswith('v '):
            parts = line.split()
            x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
            vertices.append((x, y, z))
        elif line.startswith('f '):
            parts = line.split()
            face_indices = [int(p.split('/')[0]) - 1 for p in parts[1:4]]
            faces.append(face_indices)
    
    # Convert to STL binary format
    header = b'\x00' * 80  # 80-byte header
    
    num_triangles = len(faces)
    triangle_count = num_triangles.to_bytes(4, 'little')
    
    stl_data = header + triangle_count
    
    for face in faces:
        for idx in face:
            v = vertices[idx]
            # Convert to mm
            x = v[0].to_bytes(4, 'little')
            y = v[1].to_bytes(4, 'little')
            z = v[2].to_bytes(4, 'little')
            stl_data += x + y + z
        
        # Attribute byte count (unused)
        stl_data += b'\x00\x00'
    
    return stl_data

def generate_3mf(cabinet_data: Dict[str, Any], material_info: MaterialInfo) -> str:
    """Generate 3MF file (3D Manufacturing Format)
    
    3MF is essentially a ZIP file with XML metadata and models.
    For simplicity, we'll generate the XML structure and model data.
    """
    # Generate OBJ content first
    obj_content = generate_obj(cabinet_data, material_info)
    
    # Build 3MF XML structure (simplified)
    xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" author="Modology Cabinet Designer" name="{cabinet_data.get('name', 'Cabinet')}">
  <resources>
    <object id="model-1" type="model">
      <mesh>
        <vertices>
'''
    
    # Parse OBJ vertices and add to XML
    lines = obj_content.split('\n')
    vertex_count = 0
    for line in lines:
        if line.startswith('v '):
            parts = line.split()
            x, y, z = float(parts[1]), float(parts[2]), float(parts[3])
            xml_content += f'          <vertex x="{x:.2f}" y="{y:.2f}" z="{z:.2f}"/>\n'
            vertex_count += 1
    
    xml_content += '''        </vertices>
        <triangles>
'''
    
    # Parse OBJ faces and add to XML
    for line in lines:
        if line.startswith('f '):
            parts = line.split()
            face_indices = [int(p.split('/')[0]) - 1 for p in parts[1:4]]
            xml_content += f'          <triangle v1="{face_indices[0]}" v2="{face_indices[1]}" v3="{face_indices[2]}"/>\n'
    
    xml_content += '''        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="model-1" transform="1 0 0 0 1 0 0 0 1 0 0 0 1"/>
  </build>
  <metadata>
    <entry key="Author">Modology Cabinet Designer</entry>
    <entry key="Date">{datetime.datetime.now().isoformat()}</entry>
    <entry key="Material">{material_info.name}</entry>
    <entry key="Thickness">{material_info.thickness}mm</entry>
  </metadata>
</model>
'''
    
    return xml_content

def generate_dxf(cabinet_data: Dict[str, Any], material_info: MaterialInfo) -> str:
    """Generate DXF file for SketchUp and CAD tools
    
    DXF (Drawing Exchange Format) is widely used for 2D/3D CAD.
    """
    cabinet = cabinet_data
    width = cabinet.get('width', 36.0)
    height = cabinet.get('height', 34.5)
    depth = cabinet.get('depth', 24.0)
    
    # Convert to mm
    w_mm = width * 25.4
    h_mm = height * 25.4
    d_mm = depth * 25.4
    
    dxf_content = f'''0
SECTION
2
HEADER
9
$ACADVERDXF
1
1.4
9
$ACADVERDXF
1
1.4
9
$HANDSEED
9
Modology Cabinet Designer
9
$INSUNITS
70
4
9
$MEASUREMENT
70
1
9
$LIMMIN
10
0.0
10
0.0
10
0.0
9
$LIMMAX
10
{w_mm:.2f}
10
{h_mm:.2f}
10
{d_mm:.2f}
9
$EXTMIN
10
0.0
10
0.0
10
0.0
9
$EXTMAX
10
{w_mm:.2f}
10
{h_mm:.2f}
10
{d_mm:.2f}
0
ENDSEC
9
$ACADVERDXF
1
1.4
9
$ACADVERDXF
1
1.4
9
$HANDSEED
9
Modology Cabinet Designer
9
$INSUNITS
70
4
9
$MEASUREMENT
70
1
0
ENDSEC
9
$ACADVERDXF
1
1.4
9
$ACADVERDXF
1
1.4
9
$HANDSEED
9
Modology Cabinet Designer
9
$INSUNITS
70
4
9
$MEASUREMENT
70
1
0
ENDSEC
9
$ACADVERDXF
1
1.4
9
$ACADVERDXF
1
1.4
9
$HANDSEED
9
Modology Cabinet Designer
9
$INSUNITS
70
4
9
$MEASUREMENT
70
1
0
ENDSEC
'''
    
    return dxf_content

def export_cabinet(cabinet_data: Dict[str, Any], material_info: MaterialInfo, format: str) -> str | bytes:
    """Export cabinet to specified format
    
    Args:
        cabinet_data: Cabinet design data
        material_info: Material properties
        format: 'obj', 'stl', '3mf', or 'dxf'
    
    Returns:
        Exported content (string for text formats, bytes for binary)
    
    Raises:
        HTTPException: If format is unsupported
    """
    format_map = {
        'obj': generate_obj,
        'stl': generate_stl,
        '3mf': generate_3mf,
        'dxf': generate_dxf,
    }
    
    if format not in format_map:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: {format}. Supported: obj, stl, 3mf, dxf"
        )
    
    return format_map[format](cabinet_data, material_info)
