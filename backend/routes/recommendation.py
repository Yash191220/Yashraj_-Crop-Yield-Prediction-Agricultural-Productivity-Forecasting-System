from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import math

router = APIRouter(prefix="/api/recommendation", tags=["Recommendations & Agronomic Workflows"])

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

class CropSelectionWorkflowRequest(BaseModel):
    region: str = "North Region"
    season: str = "Rabi"
    soil_type: str = "Loamy"
    soil_ph: float = 6.8
    water_availability: str = "Medium (Canal / Borewell)" # "Low (Rainfed)", "Medium (Canal / Borewell)", "High (Assured Drip / Canal)"
    area_hectares: float = 10.0
    primary_goal: Optional[str] = "Maximum Yield & Profit" # "Maximum Yield & Profit", "Low Water Usage", "Soil Regeneration", "Low Pest Risk"

class NutrientPrescriptionRequest(BaseModel):
    crop: str = "Wheat"
    area_hectares: float = 10.0
    soil_ph: float = 6.8
    nitrogen_n: float = 120.0
    phosphorus_p: float = 40.0
    potassium_k: float = 60.0
    organic_matter_percent: float = 2.0
    soil_texture: Optional[str] = "Loamy"

class PestManagementRequest(BaseModel):
    crop: str = "Wheat"
    season: str = "Rabi"
    temperature_celsius: float = 22.0
    humidity_percent: float = 65.0
    rainfall_mm: float = 600.0
    symptoms_observed: Optional[List[str]] = []

class IrrigationScheduleRequest(BaseModel):
    crop: str = "Wheat"
    season: str = "Rabi"
    soil_type: str = "Loamy"
    irrigation_type: str = "Canal"
    area_hectares: float = 10.0
    seasonal_rainfall_mm: float = 650.0

class CropRotationRequest(BaseModel):
    current_crop: str = "Wheat"
    region: str = "North Region"
    soil_health_rating: Optional[str] = "Moderate"

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
        "typical_yield_t_ha": 3.2,
        "water_demand_category": "Medium",
        "market_value_rating": "High Stable",
        "pests": ["Wheat Aphids", "Yellow Rust (Puccinia striiformis)", "Loose Smut"],
        "critical_irrigation": "Crown root initiation (21 days), Tillering, Flowering, & Jointing stages",
        "rotation": ["Legumes (Soybean/Chickpea)", "Green Manure (Dhaincha)", "Mustard"],
        "fertilizer_split": "50% Basal N + 100% P&K at sowing; 25% N at tillering; 25% N at boot stage",
        "irrigation_intervals_days": [0, 21, 45, 65, 85, 105],
        "stages": ["Crown Root Initiation (21 DAS)", "Tillering (40-45 DAS)", "Jointing (60-65 DAS)", "Flowering (80-85 DAS)", "Dough / Milk Stage (100-105 DAS)"]
    },
    "Rice": {
        "ph_range": (5.5, 6.8),
        "ideal_ph": 6.2,
        "n_req": 150.0,
        "p_req": 60.0,
        "k_req": 80.0,
        "rainfall_range": (1000, 2000),
        "temp_range": (20.0, 35.0),
        "typical_yield_t_ha": 3.6,
        "water_demand_category": "Very High",
        "market_value_rating": "High Essential",
        "pests": ["Stem Borer", "Rice Blast (Magnaporthe oryzae)", "Brown Planthopper (BPH)"],
        "critical_irrigation": "Maintain 3-5 cm standing water from tillering to panicle initiation; drain 10 days before harvest",
        "rotation": ["Pulses (Lentil/Gram)", "Wheat (Rice-Wheat cropping system)", "Mustard"],
        "fertilizer_split": "25% N + 100% P + 50% K at basal; 50% N top-dress at active tillering; 25% N + 50% K at panicle initiation",
        "irrigation_intervals_days": [0, 7, 14, 21, 28, 35, 42, 55, 70, 85],
        "stages": ["Transplanting (0 DAS)", "Active Tillering (20-25 DAS)", "Panicle Initiation (45-50 DAS)", "Flowering (70-75 DAS)", "Grain Filling (90-95 DAS)"]
    },
    "Maize": {
        "ph_range": (5.8, 7.5),
        "ideal_ph": 6.5,
        "n_req": 160.0,
        "p_req": 60.0,
        "k_req": 70.0,
        "rainfall_range": (500, 900),
        "temp_range": (18.0, 32.0),
        "typical_yield_t_ha": 3.1,
        "water_demand_category": "Medium",
        "market_value_rating": "High Industrial / Feed",
        "pests": ["Fall Armyworm (Spodoptera frugiperda)", "Stem Borer", "Maydis Leaf Blight"],
        "critical_irrigation": "Tasseling and silking stages are extremely critical for grain filling",
        "rotation": ["Cowpea / Groundnut", "Mustard", "Wheat"],
        "fertilizer_split": "30% N + 100% P&K at sowing; 40% N at knee-high stage (30-35 DAS); 30% N at tasseling stage",
        "irrigation_intervals_days": [0, 20, 35, 55, 75],
        "stages": ["Germination & Emergence (0-10 DAS)", "Knee-High Stage (30-35 DAS)", "Tasseling & Silking (50-60 DAS)", "Grain Filling (75-80 DAS)"]
    },
    "Soybean": {
        "ph_range": (6.0, 7.0),
        "ideal_ph": 6.5,
        "n_req": 30.0,
        "p_req": 60.0,
        "k_req": 40.0,
        "rainfall_range": (650, 1000),
        "temp_range": (20.0, 30.0),
        "typical_yield_t_ha": 2.4,
        "water_demand_category": "Medium-Low",
        "market_value_rating": "High Commercial Oilseed",
        "pests": ["Girdle Beetle", "Tobacco Caterpillar", "Yellow Mosaic Virus"],
        "critical_irrigation": "Flowering and pod development stages require uniform moisture",
        "rotation": ["Wheat", "Mustard", "Sorghum"],
        "fertilizer_split": "100% N, P, K + Rhizobium seed inoculation at sowing time",
        "irrigation_intervals_days": [0, 30, 50, 70],
        "stages": ["Emergence (0-7 DAS)", "Vegetative Branching (25-30 DAS)", "Flowering (45-50 DAS)", "Pod Filling (65-75 DAS)"]
    },
    "Cotton": {
        "ph_range": (6.0, 8.0),
        "ideal_ph": 7.0,
        "n_req": 120.0,
        "p_req": 60.0,
        "k_req": 60.0,
        "rainfall_range": (500, 850),
        "temp_range": (22.0, 35.0),
        "typical_yield_t_ha": 2.5,
        "water_demand_category": "Medium-High",
        "market_value_rating": "High Cash Crop",
        "pests": ["Pink Bollworm", "Whitefly", "Jassids"],
        "critical_irrigation": "Squaring, flowering, and boll development stages",
        "rotation": ["Wheat", "Gram / Chickpea", "Sorghum"],
        "fertilizer_split": "Basal P&K at sowing; N in 3 equal splits (Sowing, Square formation, Boll development)",
        "irrigation_intervals_days": [0, 30, 60, 85, 110],
        "stages": ["Seedling (0-20 DAS)", "Squaring / Flower Budding (45-50 DAS)", "Peak Flowering (75-80 DAS)", "Boll Maturation (100-120 DAS)"]
    },
    "Potato": {
        "ph_range": (5.0, 6.2),
        "ideal_ph": 5.5,
        "n_req": 180.0,
        "p_req": 80.0,
        "k_req": 100.0,
        "rainfall_range": (400, 700),
        "temp_range": (15.0, 22.0),
        "typical_yield_t_ha": 22.0,
        "water_demand_category": "Medium-High (Frequent Light)",
        "market_value_rating": "High Horticulture",
        "pests": ["Late Blight (Phytophthora infestans)", "Potato Aphids", "Cutworms"],
        "critical_irrigation": "Tuber initiation (25-30 days) and tuber bulking stage",
        "rotation": ["Maize", "Legumes", "Wheat"],
        "fertilizer_split": "50% N + 100% P&K basal application; earthing-up top dressing at 30 DAS with balance N",
        "irrigation_intervals_days": [0, 10, 20, 30, 42, 55, 70],
        "stages": ["Sprouting & Emergence (0-15 DAS)", "Stolon & Tuber Initiation (25-30 DAS)", "Tuber Bulking (45-65 DAS)", "Maturity / Skin Hardening (75-90 DAS)"]
    },
    "Sugarcane": {
        "ph_range": (6.0, 7.5),
        "ideal_ph": 6.8,
        "n_req": 250.0,
        "p_req": 85.0,
        "k_req": 120.0,
        "rainfall_range": (1200, 2500),
        "temp_range": (20.0, 38.0),
        "typical_yield_t_ha": 70.0,
        "water_demand_category": "Extremely High",
        "market_value_rating": "High Agro-Industrial",
        "pests": ["Early Shoot Borer", "Top Borer", "Red Rot disease"],
        "critical_irrigation": "Formative phase (tillering stage) requires frequent 8-10 day irrigation cycles",
        "rotation": ["Green manure (Sunhemp)", "Wheat", "Gram"],
        "fertilizer_split": "15% N + 100% P at planting; 30% N at tillering; 35% N + 50% K at grand growth; balance at final earthing-up",
        "irrigation_intervals_days": [0, 10, 20, 35, 50, 70, 90, 120, 150, 180],
        "stages": ["Germination Phase (0-35 DAS)", "Tillering / Formative (35-100 DAS)", "Grand Growth (100-250 DAS)", "Maturity & Ripening (250-360 DAS)"]
    },
    "Barley": {
        "ph_range": (6.0, 7.8),
        "ideal_ph": 7.0,
        "n_req": 90.0,
        "p_req": 40.0,
        "k_req": 40.0,
        "rainfall_range": (400, 750),
        "temp_range": (12.0, 22.0),
        "typical_yield_t_ha": 2.8,
        "water_demand_category": "Low-Medium",
        "market_value_rating": "Moderate Brewery / Feed",
        "pests": ["Barley Aphids", "Covered Smut", "Helminthosporium Leaf Blight"],
        "critical_irrigation": "Active tillering and grain filling stages",
        "rotation": ["Chickpea", "Lentil", "Cotton"],
        "fertilizer_split": "50% N + 100% P&K basal at sowing; 50% N top dress at first irrigation (25-30 DAS)",
        "irrigation_intervals_days": [0, 25, 55, 80],
        "stages": ["Crown Rooting (20-25 DAS)", "Tillering (35-40 DAS)", "Flowering (60-65 DAS)", "Grain Filling (80-85 DAS)"]
    }
}

DEFAULT_PROFILE = CROP_PROFILES["Wheat"]

# ─── 1. STANDARD RECOMMENDATION QUERY (COMPATIBILITY) ─────────────────────────
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

    # 1. Calculate Scientific Suitability Score
    score = 100.0
    ph_min, ph_max = profile["ph_range"]
    if soil_ph < ph_min:
        score -= min(30, (ph_min - soil_ph) * 20)
    elif soil_ph > ph_max:
        score -= min(30, (soil_ph - ph_max) * 20)

    n_req, p_req, k_req = profile["n_req"], profile["p_req"], profile["k_req"]
    score -= min(25, (abs(n_val - n_req)/n_req + abs(p_val - p_req)/p_req + abs(k_val - k_req)/k_req) * 10)

    rf_min, rf_max = profile["rainfall_range"]
    if rain_val < rf_min:
        score -= min(20, ((rf_min - rain_val) / rf_min) * 25)
    elif rain_val > rf_max:
        score -= min(15, ((rain_val - rf_max) / rf_max) * 15)

    t_min, t_max = profile["temp_range"]
    if temp_val < t_min or temp_val > t_max:
        score -= 15.0

    suitability_score = round(max(40.0, min(98.5, score)), 1)
    suitability_rating = "Highly Optimal" if suitability_score >= 80 else ("Moderate" if suitability_score >= 60 else "Suboptimal")
    suitability_badge = "emerald" if suitability_score >= 80 else ("amber" if suitability_score >= 60 else "rose")

    # Nutrient Advice
    nutrient_advices = []
    if soil_ph < ph_min:
        lime_kg = int((ph_min - soil_ph) * 1200)
        nutrient_advices.append(f"Soil pH ({soil_ph}) is acidic. Apply {lime_kg} kg/ha Agricultural Lime (CaCO3) prior to seedbed preparation.")
    elif soil_ph > ph_max:
        gypsum_kg = int((soil_ph - ph_max) * 800)
        nutrient_advices.append(f"Soil pH ({soil_ph}) is alkaline. Apply {gypsum_kg} kg/ha Agricultural Gypsum or Elemental Sulfur.")
    else:
        nutrient_advices.append(f"Soil pH ({soil_ph}) is in the optimal range ({ph_min} - {ph_max}) for {query.crop}.")

    n_gap = max(0.0, n_req - n_val)
    p_gap = max(0.0, p_req - p_val)
    k_gap = max(0.0, k_req - k_val)
    dap_needed = round(p_gap / 0.46, 1) if p_gap > 0 else 0.0
    n_from_dap = dap_needed * 0.18
    rem_n = max(0.0, n_gap - n_from_dap)
    urea_needed = round(rem_n / 0.46, 1) if rem_n > 0 else 0.0
    mop_needed = round(k_gap / 0.60, 1) if k_gap > 0 else 0.0

    fertilizer_msg = f"Prescribed Fertilizer: Apply {urea_needed} kg/ha Urea, {dap_needed} kg/ha DAP, and {mop_needed} kg/ha MOP."
    nutrient_advices.append(fertilizer_msg)
    nutrient_advices.append(f"Split Application: {profile['fertilizer_split']}.")

    # Water Management
    water_advices = []
    if rain_val < rf_min:
        water_advices.append(f"Precipitation ({rain_val}mm) is below target ({rf_min}-{rf_max}mm). Supplemental irrigation via {irrigation} is essential.")
    elif rain_val > rf_max:
        water_advices.append(f"High seasonal rainfall ({rain_val}mm) requires active surface drainage to avoid root rot.")
    else:
        water_advices.append(f"Precipitation ({rain_val}mm) aligns well with moisture demands.")

    water_advices.append(f"Critical Irrigation Stages: {profile['critical_irrigation']}.")

    # Pest Protocol
    pest_advices = [
        f"Primary Pests for {query.crop}: {', '.join(profile['pests'])}.",
        "Seed Treatment: Treat seeds with Trichoderma viride (10g/kg) or Carbendazim (2g/kg) before sowing.",
        "Monitoring: Install pheromone traps (5 traps/ha) 20 days after germination."
    ]

    # Crop Rotation
    rotation_advices = [
        f"Recommended Next-Season Crop: {', '.join(profile['rotation'])}.",
        "Legume rotation naturally fixes 40–60 kg/ha atmospheric nitrogen."
    ]

    return {
        "crop": query.crop,
        "region": region,
        "season": season,
        "suitability_score": suitability_score,
        "suitability_rating": suitability_rating,
        "suitability_badge": suitability_badge,
        "recommendations": [
            f"Suitability Index: {suitability_score}% ({suitability_rating}) for {query.crop} in {region} during {season}.",
            fertilizer_msg,
            f"Moisture Focus: {profile['critical_irrigation']}.",
            f"Pest Management: Monitor for {profile['pests'][0]}; execute prophylactic seed coating.",
            f"Crop Rotation: Plan next season with {profile['rotation'][0]}."
        ],
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


# ─── 2. WORKFLOW 1: MULTI-CRITERIA CROP SELECTION WIZARD ──────────────────────
@router.post("/workflows/crop-selection")
def workflow_crop_selection(req: CropSelectionWorkflowRequest):
    """
    Evaluates all crops against specific farm conditions and primary objective.
    Ranks them with suitability score, projected yield, ROI index, and justification.
    """
    candidates = []

    for crop_name, profile in CROP_PROFILES.items():
        score = 100.0
        
        # pH compatibility
        ph_min, ph_max = profile["ph_range"]
        if req.soil_ph < ph_min or req.soil_ph > ph_max:
            score -= 20.0
            
        # Water availability compatibility
        water_cat = profile.get("water_demand_category", "Medium")
        if req.water_availability.startswith("Low") and "High" in water_cat:
            score -= 35.0
        elif req.water_availability.startswith("High") and "Low" in water_cat:
            score -= 5.0
            
        # Season alignment
        if req.season == "Kharif" and crop_name in ["Wheat", "Barley", "Potato"]:
            score -= 40.0
        elif req.season == "Rabi" and crop_name in ["Cotton", "Rice"]:
            score -= 35.0
        elif req.season == "Zaid" and crop_name in ["Wheat", "Cotton", "Barley"]:
            score -= 45.0

        # Objective weighting
        if req.primary_goal == "Low Water Usage" and "Low" in water_cat:
            score += 10.0
        elif req.primary_goal == "Soil Regeneration" and crop_name == "Soybean":
            score += 15.0
        elif req.primary_goal == "Maximum Yield & Profit" and crop_name in ["Sugarcane", "Potato", "Wheat", "Rice"]:
            score += 8.0

        final_score = round(max(30.0, min(99.0, score)), 1)
        exp_yield = profile.get("typical_yield_t_ha", 2.5)
        total_prod = round(exp_yield * req.area_hectares, 1)

        pros = [
            f"Aligned with {req.soil_type} soil texture",
            f"Ideal harvest window for {req.season} season"
        ]
        if final_score >= 85:
            pros.append("High return on investment (ROI) with stable market demand")
        else:
            pros.append("Requires careful water / nutrient management")

        candidates.append({
            "crop": crop_name,
            "suitability_score": final_score,
            "rating": "Top Recommendation" if final_score >= 85 else ("Feasible" if final_score >= 70 else "Not Recommended"),
            "expected_yield_t_ha": exp_yield,
            "total_production_tonnes": total_prod,
            "water_demand": water_cat,
            "market_value": profile.get("market_value_rating", "High"),
            "primary_rationale": f"High agronomic synergy with {req.region} soil pH ({req.soil_ph}) and {req.water_availability}.",
            "pros": pros
        })

    candidates.sort(key=lambda x: x["suitability_score"], reverse=True)

    return {
        "workflow": "Crop Selection & Season Matching",
        "status": "success",
        "inputs": req.model_dump(),
        "top_match": candidates[0]["crop"] if candidates else "Wheat",
        "recommendations": candidates
    }


# ─── 3. WORKFLOW 2: PRECISION NUTRIENT & FERTILIZER PRESCRIPTION ─────────────
@router.post("/workflows/nutrient-plan")
def workflow_nutrient_prescription(req: NutrientPrescriptionRequest):
    """
    Generates a field-specific 3-stage chemical and organic nutrient prescription.
    """
    crop_name = req.crop.strip().capitalize()
    profile = CROP_PROFILES.get(crop_name, DEFAULT_PROFILE)

    n_target = profile["n_req"]
    p_target = profile["p_req"]
    k_target = profile["k_req"]

    n_deficit_ha = max(0.0, n_target - req.nitrogen_n)
    p_deficit_ha = max(0.0, p_target - req.phosphorus_p)
    k_deficit_ha = max(0.0, k_target - req.potassium_k)

    # Convert to standard fertilizer bags & kg
    dap_kg_ha = round(p_deficit_ha / 0.46, 1) if p_deficit_ha > 0 else 0.0
    n_supplied_by_dap = dap_kg_ha * 0.18
    rem_n_ha = max(0.0, n_deficit_ha - n_supplied_by_dap)
    urea_kg_ha = round(rem_n_ha / 0.46, 1) if rem_n_ha > 0 else 0.0
    mop_kg_ha = round(k_deficit_ha / 0.60, 1) if k_deficit_ha > 0 else 0.0

    # Total farm dosage
    area = req.area_hectares
    total_urea = round(urea_kg_ha * area, 1)
    total_dap = round(dap_kg_ha * area, 1)
    total_mop = round(mop_kg_ha * area, 1)

    # Soil amendment
    amendment = None
    if req.soil_ph < profile["ph_range"][0]:
        lime_total = round((profile["ph_range"][0] - req.soil_ph) * 1500 * area, 1)
        amendment = {
            "type": "Agricultural Lime (CaCO3)",
            "purpose": "Neutralize soil acidity and unlock fixed soil Phosphorus",
            "dosage_per_ha": round((profile["ph_range"][0] - req.soil_ph) * 1500, 1),
            "total_dosage_kg": lime_total,
            "timing": "Broadcast 2–3 weeks before sowing during primary tillage"
        }
    elif req.soil_ph > profile["ph_range"][1]:
        gypsum_total = round((req.soil_ph - profile["ph_range"][1]) * 800 * area, 1)
        amendment = {
            "type": "Agricultural Gypsum (CaSO4) / Elemental Sulfur",
            "purpose": "Alleviate soil alkalinity and prevent iron/zinc chlorosis",
            "dosage_per_ha": round((req.soil_ph - profile["ph_range"][1]) * 800, 1),
            "total_dosage_kg": gypsum_total,
            "timing": "Incorporate in top 15cm soil before furrow formation"
        }

    # 3-Stage Phased Split Application Schedule
    schedule = [
        {
            "phase": "Stage 1: Basal Application (Sowing)",
            "timing": "Day 0 (At planting)",
            "description": "Place 100% of DAP, 100% of MOP, and 50% of Urea in bands 5cm below seed level.",
            "urea_kg": round(total_urea * 0.5, 1),
            "dap_kg": total_dap,
            "mop_kg": total_mop,
            "action_item": "Incorporate into seedbed; avoid direct contact with seed embryo."
        },
        {
            "phase": "Stage 2: Active Tillering / Vegetative",
            "timing": "21–25 Days After Sowing (DAS)",
            "description": "Top-dress 25% of Urea immediately before 1st crown root irrigation.",
            "urea_kg": round(total_urea * 0.25, 1),
            "dap_kg": 0,
            "mop_kg": 0,
            "action_item": "Broadcast when foliage is dry; follow with immediate light irrigation."
        },
        {
            "phase": "Stage 3: Panicle Initiation / Booting",
            "timing": "45–55 Days After Sowing (DAS)",
            "description": "Final 25% Urea top-dressing to maximize spikelet grain density.",
            "urea_kg": round(total_urea * 0.25, 1),
            "dap_kg": 0,
            "mop_kg": 0,
            "action_item": "Crucial for grain weight and protein content."
        }
    ]

    return {
        "workflow": "Precision Nutrient Prescription",
        "status": "success",
        "crop": crop_name,
        "area_hectares": area,
        "soil_metrics": {
            "ph": req.soil_ph,
            "measured_npk": f"{req.nitrogen_n}:{req.phosphorus_p}:{req.potassium_k}",
            "target_npk": f"{n_target}:{p_target}:{k_target}"
        },
        "fertilizer_totals": {
            "urea_kg": total_urea,
            "urea_bags_50kg": round(total_urea / 50.0, 1),
            "dap_kg": total_dap,
            "dap_bags_50kg": round(total_dap / 50.0, 1),
            "mop_kg": total_mop,
            "mop_bags_50kg": round(total_mop / 50.0, 1),
        },
        "soil_amendment": amendment,
        "application_schedule": schedule,
        "organic_enhancement": {
            "farmyard_manure_tonnes": round(5.0 * area, 1),
            "biofertilizer": "Rhizobium (for pulses) or Azotobacter (for cereals) @ 250g per 10kg seed"
        }
    }


# ─── 4. WORKFLOW 3: INTEGRATED PEST & DISEASE MANAGEMENT (IPM) ───────────────
@router.post("/workflows/pest-management")
def workflow_pest_management(req: PestManagementRequest):
    """
    Generates a 4-tier Integrated Pest & Disease Defense Protocol.
    """
    crop_name = req.crop.strip().capitalize()
    profile = CROP_PROFILES.get(crop_name, DEFAULT_PROFILE)

    # Weather risk calculation
    high_humidity = req.humidity_percent >= 75.0
    warm_wet = req.temperature_celsius >= 25.0 and req.rainfall_mm >= 700.0

    threat_level = "High" if (high_humidity and warm_wet) else ("Moderate" if high_humidity else "Low")

    # 4-Tier Defense Protocol
    protocol = {
        "tier_1_cultural_preventive": [
            f"Seed Treatment: Treat certified seeds with Trichoderma viride (10g/kg) or Thiram (2.5g/kg) before sowing.",
            "Field Sanitation: Deep summer plowing to expose resting pupae and pathogen sclerotia to solar heat.",
            "Crop Spacing: Maintain recommended row-to-row spacing (20-22.5cm) to ensure optimal canopy aeration."
        ],
        "tier_2_mechanical_physical": [
            "Pheromone Trapping: Install 5–8 pheromone traps per hectare at 20 DAS for pest flight monitoring.",
            "Yellow & Blue Sticky Cards: Install 15 sticky traps/ha at crop canopy height to capture whiteflies and thrips."
        ],
        "tier_3_biological_organic": [
            "Neem Formulation: Spray Azadirachtin (10,000 ppm) @ 2ml/L water at early vegetative stage as deterrent.",
            "Bio-Agents: Release Trichogramma chilonis egg parasitoids @ 50,000/ha for lepidopteran borer control."
        ],
        "tier_4_chemical_intervention": [
            f"Target Chemical: Apply Chlorantraniliprole 18.5% SC @ 0.3ml/L if borer threshold exceeds 5% damaged tillers.",
            "Fungicide Buffer: Spray Hexaconazole 5% EC @ 2ml/L if rust or leaf spots exceed 2% leaf area.",
            "Safety Guideline: Maintain a 14-day Pre-Harvest Interval (PHI); spray during calm morning or late evening hours."
        ]
    }

    return {
        "workflow": "Integrated Pest & Disease Protocol (IPM)",
        "status": "success",
        "crop": crop_name,
        "season": req.season,
        "climate_threat_level": threat_level,
        "primary_susceptible_pests": profile["pests"],
        "weather_threat_summary": f"Relative Humidity ({req.humidity_percent}%) and Temp ({req.temperature_celsius}°C) create {threat_level.lower()} pathogen pressure.",
        "defense_protocol": protocol
    }


# ─── 5. WORKFLOW 4: CLIMATE RESILIENCE & IRRIGATION SCHEDULING ───────────────
@router.post("/workflows/irrigation-schedule")
def workflow_irrigation_scheduling(req: IrrigationScheduleRequest):
    """
    Computes critical moisture stages and creates a structured watering schedule.
    """
    crop_name = req.crop.strip().capitalize()
    profile = CROP_PROFILES.get(crop_name, DEFAULT_PROFILE)

    intervals = profile.get("irrigation_intervals_days", [0, 21, 45, 65, 85])
    stages = profile.get("stages", ["Sowing", "Vegetative", "Flowering", "Maturity"])

    schedule_items = []
    for i, (day, stage_name) in enumerate(zip(intervals, stages)):
        water_depth_mm = 50 if i == 0 else (65 if "Flowering" in stage_name or "Crown" in stage_name else 55)
        volume_litres = round(water_depth_mm * 10000 * req.area_hectares, 0)

        schedule_items.append({
            "stage_index": i + 1,
            "phenological_stage": stage_name,
            "target_day": f"Day {day} (DAS)",
            "water_depth_mm": water_depth_mm,
            "total_volume_litres": volume_litres,
            "priority": "Critical" if i == 1 or "Flowering" in stage_name else "Standard",
            "method_directive": f"Execute via {req.irrigation_type}; ensure uniform distribution without ponding."
        })

    return {
        "workflow": "Precision Irrigation Scheduling",
        "status": "success",
        "crop": crop_name,
        "season": req.season,
        "soil_type": req.soil_type,
        "irrigation_system": req.irrigation_type,
        "area_hectares": req.area_hectares,
        "critical_window_summary": profile["critical_irrigation"],
        "schedule": schedule_items,
        "water_saving_tips": [
            "Mulching: Apply 3–5 tonnes/ha straw mulch to cut surface soil evapotranspiration by up to 30%.",
            "Drip Micro-fertigation: Delivers water & soluble nutrients directly to active root zone with 90% efficiency.",
            "Night-time Watering: Irrigate during low-wind evening hours to minimize atmospheric evaporation."
        ]
    }


# ─── 6. WORKFLOW 5: 3-SEASON CROP ROTATION & SOIL REGENERATION ───────────────
@router.post("/workflows/crop-rotation")
def workflow_crop_rotation(req: CropRotationRequest):
    """
    Synthesizes a 3-cycle sustainable crop rotation plan for soil preservation.
    """
    crop_name = req.current_crop.strip().capitalize()
    profile = CROP_PROFILES.get(crop_name, DEFAULT_PROFILE)

    rotations = profile.get("rotation", ["Legumes", "Mustard", "Wheat"])

    cycle_plan = [
        {
            "cycle": "Cycle 1 (Current Primary)",
            "crop": crop_name,
            "role": "Main Commercial Cereal / Cash Crop",
            "soil_impact": "Consumes available macro-nutrients (N & P)",
            "nitrogen_balance": "-120 kg/ha"
        },
        {
            "cycle": "Cycle 2 (Immediate Follow-Up)",
            "crop": rotations[0] if len(rotations) > 0 else "Soybean / Chickpea",
            "role": "Biological Nitrogen Fixer & Break Crop",
            "soil_impact": "Replenishes organic nitrogen and aerates subsoil through deep taproot system",
            "nitrogen_balance": "+45 to +60 kg/ha Fixed"
        },
        {
            "cycle": "Cycle 3 (Restorative / Green Manure)",
            "crop": rotations[1] if len(rotations) > 1 else "Mustard / Dhaincha",
            "role": "Bio-Fumigant & Organic Carbon Builder",
            "soil_impact": "Disrupts pest nematode cycles and enriches humus layer",
            "nitrogen_balance": "+15 kg/ha & Organic Matter +0.3%"
        }
    ]

    return {
        "workflow": "Crop Rotation & Soil Regeneration Plan",
        "status": "success",
        "current_crop": crop_name,
        "region": req.region,
        "rotation_plan": cycle_plan,
        "agronomic_benefits": [
            "Biological N Fixation: Reduces chemical Urea purchase dependency by 25–30%.",
            "Pest Interruption: Starves mono-culture root borers and stem blights.",
            "Soil Texture: Legume taproots penetrate hardpans and improve soil porosity."
        ]
    }


# ─── 7. METADATA CATALOG ──────────────────────────────────────────────────────
@router.get("/catalog")
def get_recommendation_catalog():
    """Returns all supported crops, regional baselines, and parameter thresholds."""
    return {
        "supported_crops": list(CROP_PROFILES.keys()),
        "crop_profiles_summary": {
            k: {
                "ideal_ph": v["ideal_ph"],
                "n_req": v["n_req"],
                "p_req": v["p_req"],
                "k_req": v["k_req"],
                "typical_yield_t_ha": v["typical_yield_t_ha"],
                "water_demand": v["water_demand_category"]
            }
            for k, v in CROP_PROFILES.items()
        }
    }
