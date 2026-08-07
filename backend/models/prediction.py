from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PredictionRequest(BaseModel):
    user_id: Optional[str] = "guest"
    crop: str = Field(..., example="Wheat")
    region: str = Field(..., example="North Region")
    season: str = Field(..., example="Rabi")
    soil_type: str = Field(..., example="Loamy")
    irrigation_type: str = Field(..., example="Canal")
    area_hectares: float = Field(..., gt=0, example=10.0)
    rainfall_mm: float = Field(..., ge=0, example=950.0)
    temperature_celsius: float = Field(..., example=22.5)
    humidity_percent: float = Field(..., ge=0, le=100, example=65.0)
    soil_ph: float = Field(..., ge=0, le=14, example=6.8)
    nitrogen_n: float = Field(..., ge=0, example=140.0)
    phosphorus_p: float = Field(..., ge=0, example=45.0)
    potassium_k: float = Field(..., ge=0, example=80.0)
    organic_matter_percent: float = Field(default=2.5, ge=0, example=2.5)

class SoilHealth(BaseModel):
    score: Optional[float] = 90.0
    status: Optional[str] = "Optimal"
    ph: Optional[float] = 6.8
    npk_ratio: Optional[str] = "140:45:80"

class WeatherImpact(BaseModel):
    score: Optional[float] = 95.0
    status: Optional[str] = "Favorable"
    temperature_celsius: Optional[float] = 22.5
    rainfall_mm: Optional[float] = 950.0

class PredictionResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = "guest"
    crop: Optional[str] = "Wheat"
    region: Optional[str] = "North Region"
    season: Optional[str] = "Rabi"
    soil_type: Optional[str] = "Loamy"
    irrigation_type: Optional[str] = "Canal"
    area_hectares: Optional[float] = 10.0
    rainfall_mm: Optional[float] = 800.0
    temperature_celsius: Optional[float] = 22.0
    soil_ph: Optional[float] = 6.8
    nitrogen_n: Optional[float] = 140.0
    phosphorus_p: Optional[float] = 45.0
    potassium_k: Optional[float] = 80.0
    predicted_yield_kg_ha: float
    total_production_tonnes: float
    productivity_score: float
    soil_health: Optional[SoilHealth] = None
    weather_impact: Optional[WeatherImpact] = None
    risk_assessment: List[str] = []
    recommendations: List[str] = []
    created_at: Optional[datetime] = None
