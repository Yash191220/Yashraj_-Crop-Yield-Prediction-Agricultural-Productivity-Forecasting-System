from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SoilSample(BaseModel):
    region: str
    soil_type: str
    soil_ph: float
    nitrogen_n: float
    phosphorus_p: float
    potassium_k: float
    organic_matter_percent: float

class SoilReport(BaseModel):
    soil_health_score: float
    fertility_status: str
    ph_assessment: str
    npk_status: str
    recommended_fertilizers: List[str]
    created_at: Optional[datetime] = None
