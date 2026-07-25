from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WeatherQuery(BaseModel):
    region: str = Field(..., example="North Region")
    season: str = Field(default="Rabi")

class WeatherReport(BaseModel):
    region: str
    rainfall_mm: float
    temperature_celsius: float
    humidity_percent: float
    climate_status: str
    drought_risk: str
    created_at: Optional[datetime] = None
