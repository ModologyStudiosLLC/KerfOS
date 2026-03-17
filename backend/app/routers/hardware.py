"""
API routers for hardware management
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Hardware
from pydantic import BaseModel

router = APIRouter(prefix="/api/hardware", tags=["hardware"])

# Pydantic models for request/response
class HardwareCreate(BaseModel):
    name: str
    type: str  # hinge, slide, screw, bracket, handle, knob, etc.
    description: Optional[str] = None
    price: float
    supplier: Optional[str] = None
    url: Optional[str] = None

class HardwareResponse(BaseModel):
    id: int
    name: str
    type: str
    description: Optional[str] = None
    price: float
    supplier: Optional[str] = None
    url: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True

@router.post("/", response_model=HardwareResponse)
def create_hardware(hardware: HardwareCreate, db: Session = Depends(get_db)):
    """
    Create new hardware
    """
    db_hardware = Hardware(**hardware.dict())
    db.add(db_hardware)
    db.commit()
    db.refresh(db_hardware)
    return db_hardware

@router.get("/", response_model=List[HardwareResponse])
def list_hardware(
    db: Session = Depends(get_db),
    type_filter: Optional[str] = Query(None, alias="type")
):
    """
    List all hardware, optionally filtered by type
    """
    query = db.query(Hardware).filter(Hardware.is_active == True)
    
    if type_filter:
        query = query.filter(Hardware.type == type_filter)
    
    hardware = query.all()
    return hardware

@router.get("/{hardware_id}", response_model=HardwareResponse)
def get_hardware(hardware_id: int, db: Session = Depends(get_db)):
    """
    Get specific hardware by ID
    """
    hardware = db.query(Hardware).filter(Hardware.id == hardware_id).first()
    if not hardware:
        raise HTTPException(status_code=404, detail="Hardware not found")
    return hardware

@router.delete("/{hardware_id}")
def delete_hardware(hardware_id: int, db: Session = Depends(get_db)):
    """
    Delete hardware (soft delete)
    """
    db_hardware = db.query(Hardware).filter(Hardware.id == hardware_id).first()
    if not db_hardware:
        raise HTTPException(status_code=404, detail="Hardware not found")
    
    db_hardware.is_active = False
    db.commit()
    return {"message": "Hardware deleted"}
