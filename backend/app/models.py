"""
Database models for Modology Cabinet Designer
Includes cabinet-specific models + user auth + collaboration
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


# Association table for many-to-many relationship between projects and cabinets
project_cabinets = Table(
    "project_cabinets",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("cabinet_id", Integer, ForeignKey("cabinets.id"), primary_key=True)
)


class User(Base):
    """User model for authentication and collaboration"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    shared_projects = relationship("ProjectShare", back_populates="user")


class Project(Base):
    """Project model for grouping cabinets with sharing support"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for backward compat
    is_public = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    shares = relationship("ProjectShare", back_populates="project", cascade="all, delete-orphan")
    cabinets = relationship("Cabinet", secondary=project_cabinets, back_populates="projects")
    sheets = relationship("Sheet", back_populates="project", cascade="all, delete-orphan")
    parts = relationship("Part", back_populates="project", cascade="all, delete-orphan")


class ProjectShare(Base):
    """Project sharing with permission levels"""
    __tablename__ = "project_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    permission = Column(String, default="view")  # view, edit, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="shares")
    user = relationship("User", back_populates="shared_projects")


class Cabinet(Base):
    """Cabinet model for storing cabinet designs"""
    __tablename__ = "cabinets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    width = Column(Float)  # Width in inches
    height = Column(Float)  # Height in inches
    depth = Column(Float)  # Depth in inches
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    material = relationship("Material", back_populates="cabinets")
    components = relationship("CabinetComponent", back_populates="cabinet", cascade="all, delete-orphan")
    cut_lists = relationship("CutList", back_populates="cabinet", cascade="all, delete-orphan")
    projects = relationship("Project", secondary=project_cabinets, back_populates="cabinets")


class Material(Base):
    """Material model for storing sheet goods (plywood, MDF, etc.)"""
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # plywood, mdf, hardwood, particleboard
    thickness = Column(Float)  # Thickness in inches (e.g., 0.75 for 3/4")
    sheet_width = Column(Float, default=48.0)  # Standard 4x8 sheet width
    sheet_height = Column(Float, default=96.0)  # Standard 4x8 sheet height
    price_per_sqft = Column(Float)  # Price per square foot
    supplier = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cabinets = relationship("Cabinet", back_populates="material")


class Hardware(Base):
    """Hardware model for storing cabinet hardware (hinges, slides, etc.)"""
    __tablename__ = "hardware"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # hinge, slide, screw, bracket, handle, knob, etc.
    description = Column(Text, nullable=True)
    price = Column(Float)
    supplier = Column(String, nullable=True)
    url = Column(String, nullable=True)  # Link to supplier
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CabinetComponent(Base):
    """CabinetComponent model for storing individual parts of a cabinet"""
    __tablename__ = "cabinet_components"
    
    id = Column(Integer, primary_key=True, index=True)
    cabinet_id = Column(Integer, ForeignKey("cabinets.id"))
    name = Column(String)  # Side, top, bottom, back, shelf, door, drawer
    width = Column(Float)  # Width in inches
    height = Column(Float)  # Height in inches
    thickness = Column(Float, nullable=True)  # Thickness in inches
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    quantity = Column(Integer, default=1)
    edge_banding = Column(String, nullable=True)  # none, all, top, bottom, left, right
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cabinet = relationship("Cabinet", back_populates="components")
    material = relationship("Material")


class CutList(Base):
    """CutList model for storing optimized cutting plans"""
    __tablename__ = "cut_lists"
    
    id = Column(Integer, primary_key=True, index=True)
    cabinet_id = Column(Integer, ForeignKey("cabinets.id"))
    name = Column(String)
    optimization_algorithm = Column(String, default="guillotine")  # guillotine, nested
    material_id = Column(Integer, ForeignKey("materials.id"))
    total_sheets_needed = Column(Integer, default=0)
    waste_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cabinet = relationship("Cabinet", back_populates="cut_lists")
    material = relationship("Material")
    cut_items = relationship("CutItem", back_populates="cut_list", cascade="all, delete-orphan")


class CutItem(Base):
    """CutItem model for storing individual cut positions on a sheet"""
    __tablename__ = "cut_items"
    
    id = Column(Integer, primary_key=True, index=True)
    cut_list_id = Column(Integer, ForeignKey("cut_lists.id"))
    component_id = Column(Integer, ForeignKey("cabinet_components.id"))
    sheet_index = Column(Integer)  # Which sheet this cut belongs to
    x_position = Column(Float)  # X position on sheet (inches)
    y_position = Column(Float)  # Y position on sheet (inches)
    width = Column(Float)  # Width of cut (inches)
    height = Column(Float)  # Height of cut (inches)
    rotation = Column(Boolean, default=False)  # Whether part is rotated 90 degrees
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cut_list = relationship("CutList", back_populates="cut_items")


class Sheet(Base):
    """Sheet model for cutlist optimizer sheets"""
    __tablename__ = "sheets"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    name = Column(String, nullable=False)
    material = Column(String)
    width = Column(Float, nullable=False)
    length = Column(Float, nullable=False)
    thickness = Column(Float, default=0.75)
    quantity = Column(Integer, default=1)
    cost = Column(Float, default=0.0)
    
    # Relationships
    project = relationship("Project", back_populates="sheets")


class Part(Base):
    """Part model for cutlist optimizer parts"""
    __tablename__ = "parts"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    name = Column(String, nullable=False)
    width = Column(Float, nullable=False)
    length = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    grain_direction = Column(String, default="none")
    edge_banding = Column(String)
    notes = Column(Text)
    
    # Relationships
    project = relationship("Project", back_populates="parts")


class OptimizationResult(Base):
    """OptimizationResult model for storing optimization results"""
    __tablename__ = "optimization_results"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    waste_percentage = Column(Float)
    total_sheets_used = Column(Integer)
    layout_data = Column(Text)  # JSON serialized layout
    settings = Column(Text)  # JSON serialized settings
