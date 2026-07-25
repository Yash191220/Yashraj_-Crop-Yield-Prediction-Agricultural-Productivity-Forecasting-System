from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FarmCreate(BaseModel):
    user_id: str
    farm_name: str = Field(..., example="Green Valley Farm")
    region: str = Field(..., example="North Region")
    area_hectares: float = Field(..., gt=0, example=12.5)
    soil_type: str = Field(..., example="Loamy")
    irrigation_type: str = Field(..., example="Canal")
    primary_crops: list[str] = Field(default=["Wheat", "Rice"])

class FarmResponse(FarmCreate):
    id: Optional[str] = None
    created_at: Optional[datetime] = None
