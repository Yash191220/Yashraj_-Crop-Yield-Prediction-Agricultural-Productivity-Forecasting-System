from fastapi import APIRouter
from models.soil import SoilSample, SoilReport

router = APIRouter(prefix="/api/soil", tags=["Soil Assessment"])

@router.post("/assess", response_model=SoilReport)
def assess_soil(sample: SoilSample):
    ph = sample.soil_ph
    n, p, k = sample.nitrogen_n, sample.phosphorus_p, sample.potassium_k
    
    # Soil Health Score Calculation
    score = 100 - abs(ph - 6.8) * 12 - max(0, 80 - n) * 0.3 - max(0, 30 - p) * 0.4
    score = max(30.0, min(99.0, round(score, 1)))
    
    fertility = "Optimal" if score > 75 else ("Fair" if score > 55 else "Suboptimal")
    
    ph_desc = "Optimal soil pH (Neutral)" if 6.2 <= ph <= 7.2 else ("Acidic soil (pH < 6.2)" if ph < 6.2 else "Alkaline soil (pH > 7.2)")
    
    fertilizers = []
    if n < 80:
        fertilizers.append("Urea (46% N) at 100 kg/ha")
    if p < 30:
        fertilizers.append("Single Super Phosphate (SSP) at 75 kg/ha")
    if k < 50:
        fertilizers.append("Muriate of Potash (MOP) at 50 kg/ha")
    if ph < 6.0:
        fertilizers.append("Agricultural Lime (Calcium Carbonate) at 200 kg/ha")
    if not fertilizers:
        fertilizers.append("Balanced NPK 15-15-15 maintenance dose")
        
    return {
        "soil_health_score": score,
        "fertility_status": fertility,
        "ph_assessment": ph_desc,
        "npk_status": f"N: {n} kg/ha | P: {p} kg/ha | K: {k} kg/ha",
        "recommended_fertilizers": fertilizers
    }
