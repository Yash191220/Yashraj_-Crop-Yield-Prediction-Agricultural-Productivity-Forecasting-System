from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/recommendation", tags=["Recommendations"])

class RecommendationQuery(BaseModel):
    crop: str
    region: str
    soil_ph: float
    rainfall_mm: float

@router.post("/query")
def get_recommendations(query: RecommendationQuery):
    recommendations = [
        f"Selected crop ({query.crop}) is well suited for {query.region}.",
        "Rotate crops with legumes (Soybean / Chickpea) to restore natural soil Nitrogen levels.",
        "Use drip irrigation to reduce water loss during peak heat months."
    ]
    return {"crop": query.crop, "region": query.region, "recommendations": recommendations}
