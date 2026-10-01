# Database models for CutList Cloud

from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, Text, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255))
    name = Column(String(255))
    tier = Column(String(50), default="free")
    stripe_customer_id = Column(String(255))
    stripe_subscription_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="user", cascade="all, delete-orphan")
    usage_events = relationship("UsageEvent", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")
    cabinets = relationship("Cabinet", back_populates="project", cascade="all, delete-orphan")
    cut_lists = relationship("CutList", back_populates="project", cascade="all, delete-orphan")


class Cabinet(Base):
    __tablename__ = "cabinets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    width = Column(Numeric(10, 2), nullable=False)
    height = Column(Numeric(10, 2), nullable=False)
    depth = Column(Numeric(10, 2), nullable=False)
    material = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="cabinets")
    cut_lists = relationship("CutList", back_populates="cabinet", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    thickness = Column(Numeric(10, 2), nullable=False)
    price_per_sheet = Column(Numeric(10, 2), nullable=False)
    sheet_width = Column(Numeric(10, 2), default=48.0)
    sheet_height = Column(Numeric(10, 2), default=96.0)
    is_custom = Column(Boolean, default=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="materials")


class CutList(Base):
    __tablename__ = "cut_lists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    cabinet_id = Column(UUID(as_uuid=True), ForeignKey("cabinets.id", ondelete="CASCADE"))
    # JSONB on Postgres (unchanged schema); plain JSON elsewhere so the
    # models also work on SQLite for tests and local dev.
    cuts = Column(JSON().with_variant(JSONB(), "postgresql"), nullable=False)
    total_parts = Column(Integer)
    material_cost = Column(Numeric(10, 2))
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="cut_lists")
    cabinet = relationship("Cabinet", back_populates="cut_lists")


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # create, export, etc.
    resource_type = Column(String(50), nullable=False)  # project, cut_list, export
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="usage_events")
