from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class FarmCreate(BaseModel):
    user_id: Optional[str] = None
    farm_name: str = Field(..., example="Green Valley Farm")
    region: str = Field(..., example="North Region")
    area_hectares: float = Field(..., gt=0, example=12.5)
    soil_type: str = Field(..., example="Loamy")
    irrigation_type: str = Field(..., example="Canal")
    primary_crops: list[str] = Field(default=["Wheat", "Rice"])
    crop_allocations: Optional[list[dict[str, Any]]] = None

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    region: Optional[str] = None
    area_hectares: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    primary_crops: Optional[list[str]] = None
    crop_allocations: Optional[list[dict[str, Any]]] = None

class FarmResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    farm_name: str
    region: str
    area_hectares: float
    soil_type: str
    irrigation_type: str
    primary_crops: list[str]
    crop_allocations: Optional[list[dict[str, Any]]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


