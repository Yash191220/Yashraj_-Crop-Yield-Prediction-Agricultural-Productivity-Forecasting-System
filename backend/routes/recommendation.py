from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import math

router = APIRouter(prefix="/api/recommendation", tags=["Recommendations"])

class RecommendationQuery(BaseModel):
    crop: str = "Wheat"
    region: str = "North Region"
    season: Optional[str] = "Rabi"
    soil_ph: float = 6.5
    nitrogen_n: Optional[float] = 120.0
    phosphorus_p: Optional[float] = 45.0
    potassium_k: Optional[float] = 60.0
    organic_matter_percent: Optional[float] = 2.0
    rainfall_mm: float = 800.0
    temperature_celsius: Optional[float] = 22.0
    irrigation_type: Optional[str] = "Canal"

# Scientific Agronomic Profiles for Crops
CROP_PROFILES: Dict[str, Dict[str, Any]] = {
    "Wheat": {
        "ph_range": (6.0, 7.5),
        "ideal_ph": 6.8,
        "n_req": 140.0,
        "p_req": 50.0,
        "k_req": 60.0,
        "rainfall_range": (600, 1000),
        "temp_range": (15.0, 25.0),
        "pests": ["Wheat Aphids", "Yellow Rust (Puccinia striiformis)", "Loose Smut"],
        "critical_irrigation": "Crown root initiation (21 days), Tillering, Flowering, & Jointing stages",
        "rotation": ["Legumes (Soybean/Chickpea)", "Green Manure (Dhaincha)", "Mustard"],
        "fertilizer_split": "50% Basal N + 100% P&K at sowing; 25% N at tillering; 25% N at boot stage"
    },
    "Rice": {
        "ph_range": (5.5, 6.8),
        "ideal_ph": 6.2,
        "n_req": 150.0,
        "p_req": 60.0,
        "k_req": 80.0,
        "rainfall_range": (1000, 2000),
        "temp_range": (20.0, 35.0),
        "pests": ["Stem Borer", "Rice Blast (Magnaporthe oryzae)", "Brown Planthopper (BPH)"],
        "critical_irrigation": "Maintain 3-5 cm standing water from tillering to panicle initiation; drain 10 days before harvest",
        "rotation": ["Pulses (Lentil/Gram)", "Wheat (Rice-Wheat cropping system)", "Mustard"],
        "fertilizer_split": "25% N + 100% P + 50% K at basal; 50% N top-dress at active tillering; 25% N + 50% K at panicle initiation"
    },
    "Maize": {
        "ph_range": (5.8, 7.5),
        "ideal_ph": 6.5,
        "n_req": 160.0,
        "p_req": 60.0,
        "k_req": 70.0,
        "rainfall_range": (500, 900),
        "temp_range": (18.0, 32.0),
        "pests": ["Fall Armyworm (Spodoptera frugiperda)", "Stem Borer", "Maydis Leaf Blight"],
        "critical_irrigation": "Tasseling and silking stages are extremely critical for grain filling",
        "rotation": ["Cowpea / Groundnut", "Mustard", "Wheat"],
        "fertilizer_split": "30% N + 100% P&K at sowing; 40% N at knee-high stage (30-35 DAS); 30% N at tasseling stage"
    },
    "Soybean": {
        "ph_range": (6.0, 7.0),
        "ideal_ph": 6.5,
        "n_req": 30.0, # Legume fixes N naturally
        "p_req": 60.0,
        "k_req": 40.0,
        "rainfall_range": (650, 1000),
        "temp_range": (20.0, 30.0),
        "pests": ["Girdle Beetle", "Tobacco Caterpillar", "Yellow Mosaic Virus"],
        "critical_irrigation": "Flowering and pod development stages require uniform moisture",
        "rotation": ["Wheat", "Mustard", "Sorghum"],
        "fertilizer_split": "100% N, P, K + Rhizobium seed inoculation at sowing time"
    },
    "Cotton": {
        "ph_range": (6.0, 8.0),
        "ideal_ph": 7.0,
        "n_req": 120.0,
        "p_req": 60.0,
        "k_req": 60.0,
        "rainfall_range": (500, 850),
        "temp_range": (22.0, 35.0),
        "pests": ["Pink Bollworm", "Whitefly", "Jassids"],
        "critical_irrigation": "Squaring, flowering, and boll development stages",
        "rotation": ["Wheat", "Gram / Chickpea", "Sorghum"],
        "fertilizer_split": "Basal P&K at sowing; N in 3 equal splits (Sowing, Square formation, Boll development)"
    },
    "Potato": {
        "ph_range": (5.0, 6.2), # Prefers slightly acidic
        "ideal_ph": 5.5,
        "n_req": 180.0,
        "p_req": 80.0,
        "k_req": 100.0,
        "rainfall_range": (400, 700),
        "temp_range": (15.0, 22.0),
        "pests": ["Late Blight (Phytophthora infestans)", "Potato Aphids", "Cutworms"],
        "critical_irrigation": "Tuber initiation (25-30 days) and tuber bulking stage",
        "rotation": ["Maize", "Legumes", "Wheat"],
        "fertilizer_split": "50% N + 100% P&K basal application; earthing-up top dressing at 30 DAS with balance N"
    },
    "Sugarcane": {
        "ph_range": (6.0, 7.5),
        "ideal_ph": 6.8,
        "n_req": 250.0,
        "p_req": 85.0,
        "k_req": 120.0,
        "rainfall_range": (1200, 2500),
        "temp_range": (20.0, 38.0),
        "pests": ["Early Shoot Borer", "Top Borer", "Red Rot disease"],
        "critical_irrigation": "Formative phase (tillering stage) requires frequent 8-10 day irrigation cycles",
        "rotation": ["Green manure (Sunhemp)", "Wheat", "Gram"],
        "fertilizer_split": "15% N + 100% P at planting; 30% N at tillering; 35% N + 50% K at grand growth; balance at final earthing-up"
    },
    "Barley": {
        "ph_range": (6.0, 7.8),
        "ideal_ph": 7.0,
        "n_req": 90.0,
        "p_req": 40.0,
        "k_req": 40.0,
        "rainfall_range": (400, 750),
        "temp_range": (12.0, 22.0),
        "pests": ["Barley Aphids", "Covered Smut", "Helminthosporium Leaf Blight"],
        "critical_irrigation": "Active tillering and grain filling stages",
        "rotation": ["Chickpea", "Lentil", "Cotton"],
        "fertilizer_split": "50% N + 100% P&K basal at sowing; 50% N top dress at first irrigation (25-30 DAS)"
    }
}

DEFAULT_PROFILE = CROP_PROFILES["Wheat"]

@router.post("/query")
def get_recommendations(query: RecommendationQuery):
    crop_key = query.crop.strip().capitalize()
    profile = CROP_PROFILES.get(crop_key, DEFAULT_PROFILE)

    soil_ph = query.soil_ph
    n_val = query.nitrogen_n if query.nitrogen_n is not None else 120.0
    p_val = query.phosphorus_p if query.phosphorus_p is not None else 45.0
    k_val = query.potassium_k if query.potassium_k is not None else 60.0
    om_val = query.organic_matter_percent if query.organic_matter_percent is not None else 2.0
    rain_val = query.rainfall_mm
    temp_val = query.temperature_celsius if query.temperature_celsius is not None else 22.0
    irrigation = query.irrigation_type or "Canal"
    region = query.region or "North Region"
    season = query.season or "Rabi"

    # 1. CALCULATE SCIENTIFIC SUITABILITY SCORE (0-100)
    score = 100.0

    # pH penalty
    ph_min, ph_max = profile["ph_range"]
    if soil_ph < ph_min:
        score -= min(30, (ph_min - soil_ph) * 20)
    elif soil_ph > ph_max:
        score -= min(30, (soil_ph - ph_max) * 20)

    # NPK deficit penalty
    n_req, p_req, k_req = profile["n_req"], profile["p_req"], profile["k_req"]
    n_diff = abs(n_val - n_req) / n_req
    p_diff = abs(p_val - p_req) / p_req
    k_diff = abs(k_val - k_req) / k_req
    score -= min(25, (n_diff + p_diff + k_diff) * 10)

    # Rainfall penalty
    rf_min, rf_max = profile["rainfall_range"]
    if rain_val < rf_min:
        score -= min(20, ((rf_min - rain_val) / rf_min) * 25)
    elif rain_val > rf_max:
        score -= min(15, ((rain_val - rf_max) / rf_max) * 15)

    # Temp penalty
    t_min, t_max = profile["temp_range"]
    if temp_val < t_min or temp_val > t_max:
        score -= 15.0

    suitability_score = round(max(40.0, min(98.5, score)), 1)

    if suitability_score >= 80:
        suitability_rating = "Highly Optimal"
        suitability_badge = "emerald"
    elif suitability_score >= 65:
        suitability_rating = "Moderately Suitable"
        suitability_badge = "sky"
    else:
        suitability_rating = "Suboptimal / Requires Soil & Water Management"
        suitability_badge = "amber"

    # 2. SOIL AMENDMENT & FERTILIZER ADVISORY
    nutrient_advices = []

    # pH Amendment
    if soil_ph < ph_min:
        lime_kg = round((ph_min - soil_ph) * 350, 0)
        nutrient_advices.append(
            f"Soil pH ({soil_ph}) is below optimal range ({ph_min}-{ph_max}). Apply approx {lime_kg} kg/ha Agricultural Lime (CaCO3) 3 weeks prior to sowing to raise pH."
        )
    elif soil_ph > ph_max:
        gypsum_kg = round((soil_ph - ph_max) * 400, 0)
        nutrient_advices.append(
            f"Soil pH ({soil_ph}) exceeds target threshold ({ph_min}-{ph_max}). Apply {gypsum_kg} kg/ha Agricultural Gypsum (CaSO4) or Elemental Sulfur to reduce alkalinity."
        )
    else:
        nutrient_advices.append(f"Soil pH ({soil_ph}) is within the optimal zone ({ph_min} - {ph_max}) for {query.crop}.")

    # Fertilizer Recommendations (Urea, DAP, MOP)
    n_gap = max(0.0, n_req - n_val)
    p_gap = max(0.0, p_req - p_val)
    k_gap = max(0.0, k_req - k_val)

    dap_needed = round(p_gap / 0.46, 1) if p_gap > 0 else 0.0 # DAP provides 46% P2O5 and 18% N
    n_supplied_by_dap = dap_needed * 0.18
    rem_n_gap = max(0.0, n_gap - n_supplied_by_dap)
    urea_needed = round(rem_n_gap / 0.46, 1) if rem_n_gap > 0 else 0.0 # Urea provides 46% N
    mop_needed = round(k_gap / 0.60, 1) if k_gap > 0 else 0.0 # MOP provides 60% K2O

    if dap_needed > 0 or urea_needed > 0 or mop_needed > 0:
        fertilizer_msg = f"Nutrient Dosage: Apply {urea_needed} kg/ha Urea, {dap_needed} kg/ha DAP, and {mop_needed} kg/ha MOP."
    else:
        fertilizer_msg = "Existing N-P-K reserves are adequate for full target crop development."
    nutrient_advices.append(fertilizer_msg)

    # Split Schedule
    nutrient_advices.append(f"Application Schedule: {profile['fertilizer_split']}.")

    # Organic Matter
    if om_val < 1.5:
        nutrient_advices.append(f"Organic Matter is low ({om_val}%). Incorporate 5-8 tonnes/ha of Farmyard Manure (FYM) or Vermicompost to enhance microbial activity.")

    # 3. WATER & IRRIGATION MANAGEMENT
    water_advices = []
    if rain_val < rf_min:
        deficit = int(rf_min - rain_val)
        water_advices.append(
            f"Precipitation ({rain_val} mm) is below required crop water demand ({rf_min}-{rf_max} mm) by {deficit} mm. Supplemental irrigation via {irrigation} is essential."
        )
    elif rain_val > rf_max:
        excess = int(rain_val - rf_max)
        water_advices.append(
            f"High seasonal rainfall ({rain_val} mm) exceeds requirement by {excess} mm. Ensure proper surface drainage channels to prevent waterlogging & root rot."
        )
    else:
        water_advices.append(f"Natural rainfall ({rain_val} mm) aligns well with the growing season moisture requirements.")

    water_advices.append(f"Critical Irrigation Stages: Focus moisture supply at {profile['critical_irrigation']}.")
    if irrigation == "Drip":
        water_advices.append("Drip irrigation detected: Fertigation efficiency is increased by 30%. Execute 4-stage nutrient fertigation.")
    elif irrigation == "Sprinkler":
        water_advices.append("Sprinkler irrigation detected: Avoid spraying during late evening to reduce foliar fungal pathogen development.")

    # 4. PEST & DISEASE CONTROL PROTOCOL
    pest_advices = []
    pest_advices.append(f"Vulnerable Pests & Diseases: Primary threats for {query.crop} in {region} include: {', '.join(profile['pests'])}.")
    pest_advices.append("Seed Treatment Protocol: Treat seeds with Trichoderma viride (10g/kg) or Carboxin (2g/kg) prior to sowing to prevent soil-borne seedling blights.")
    if temp_val > 28.0 and rain_val > 800:
        pest_advices.append("High Humidity Alert (>75%): Increased risk of fungal leaf blights. Inspect fields bi-weekly; apply prophylactic copper oxychloride spray if lesions appear.")

    # 5. CROP ROTATION & SOIL REGENERATION PLAN
    rotation_advices = []
    rotation_advices.append(f"Recommended Rotation Crops: Following {query.crop}, rotate with {', '.join(profile['rotation'])}.")
    rotation_advices.append("Leguminous crop rotation fixes up to 40-60 kg/ha of biological atmospheric Nitrogen and disrupts monoculture pest cycles.")

    # High-level recommendations list (backward compatibility + summarized view)
    primary_recommendations = [
        f"Suitability Index: {suitability_score}% ({suitability_rating}) for {query.crop} in {region} during {season} season.",
        fertilizer_msg,
        f"Critical Moisture Stage: {profile['critical_irrigation']}.",
        f"Primary Pest Safeguard: Monitor for {profile['pests'][0]} using pheromone traps; execute seed treatment prior to planting.",
        f"Soil Health & Rotation: Rotate next season with {profile['rotation'][0]} to preserve topsoil fertility."
    ]

    return {
        "crop": query.crop,
        "region": region,
        "season": season,
        "suitability_score": suitability_score,
        "suitability_rating": suitability_rating,
        "suitability_badge": suitability_badge,
        "recommendations": primary_recommendations,
        "detailed_advisory": {
            "soil_and_nutrients": nutrient_advices,
            "water_management": water_advices,
            "pest_and_disease": pest_advices,
            "crop_rotation": rotation_advices,
            "crop_profile_metrics": {
                "ideal_ph_range": f"{ph_min} - {ph_max}",
                "n_req_kg_ha": n_req,
                "p_req_kg_ha": p_req,
                "k_req_kg_ha": k_req,
                "ideal_rainfall_mm": f"{rf_min} - {rf_max} mm",
                "ideal_temp_celsius": f"{t_min} - {t_max} °C"
            }
        }
    }
