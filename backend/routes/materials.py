# Materials API for KerfOs

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from models import Material as MaterialModel
from auth import get_current_user

router = APIRouter(prefix="/api/materials", tags=["Materials"])


class MaterialResponse(BaseModel):
    id: str
    name: str
    type: str
    thickness: float
    price_per_sheet: float
    sheet_width: float
    sheet_height: float

    class Config:
        from_attributes = True


@router.get("", response_model=List[MaterialResponse])
async def get_materials(db: Session = Depends(get_db)):
    """Get available materials"""
    materials = db.query(MaterialModel).filter(
        MaterialModel.is_custom == False
    ).all()
    
    return [
        MaterialResponse(
            id=str(m.id),
            name=m.name,
            type=m.type,
            thickness=float(m.thickness),
            price_per_sheet=float(m.price_per_sheet),
            sheet_width=float(m.sheet_width),
            sheet_height=float(m.sheet_height)
        )
        for m in materials
    ]


@router.get("/custom")
async def get_custom_materials(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's custom materials"""
    materials = db.query(MaterialModel).filter(
        MaterialModel.user_id == current_user.id,
        MaterialModel.is_custom == True
    ).all()
    
    return [
        MaterialResponse(
            id=str(m.id),
            name=m.name,
            type=m.type,
            thickness=float(m.thickness),
            price_per_sheet=float(m.price_per_sheet),
            sheet_width=float(m.sheet_width),
            sheet_height=float(m.sheet_height)
        )
        for m in materials
    ]
