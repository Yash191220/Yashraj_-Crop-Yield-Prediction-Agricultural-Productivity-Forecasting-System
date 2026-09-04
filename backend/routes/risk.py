from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import math

router = APIRouter(prefix="/api/risk", tags=["Agricultural Risk Assessment & Disaster Mitigation"])

class RiskEvaluationRequest(BaseModel):
    crop: str = "Wheat"
    region: str = "North Region"
    season: str = "Rabi"
    soil_type: str = "Loamy"
    soil_ph: float = 6.8
    nitrogen_n: float = 120.0
    phosphorus_p: float = 40.0
    potassium_k: float = 60.0
    organic_matter_percent: Optional[float] = 2.2
    rainfall_mm: float = 650.0
    temperature_celsius: float = 24.0
    humidity_percent: Optional[float] = 60.0
    irrigation_type: str = "Canal"
    area_hectares: float = 10.0
    has_crop_insurance: Optional[bool] = True
    insurance_coverage_percent: Optional[float] = 75.0

class StressTestRequest(BaseModel):
    base_request: RiskEvaluationRequest
    rainfall_deviation_percent: float = -25.0  # e.g., -25% drought or +30% excess
    temperature_increase_celsius: float = 2.5  # e.g., +2.5°C heatwave shock

# Baseline thresholds per crop
CROP_RISK_THRESHOLDS = {
    "Wheat": {
        "opt_rain": (600, 950),
        "opt_temp": (15.0, 24.0),
        "crit_temp_max": 32.0,
        "drought_sensitivity": 0.85,
        "heat_sensitivity": 0.90,
        "flood_sensitivity": 0.70,
        "pest_sensitivity": 0.65,
        "avg_yield_t_ha": 3.2,
        "market_price_per_tonne": 280.0
    },
    "Rice": {
        "opt_rain": (1100, 1800),
        "opt_temp": (22.0, 32.0),
        "crit_temp_max": 38.0,
        "drought_sensitivity": 0.95,
        "heat_sensitivity": 0.75,
        "flood_sensitivity": 0.40,
        "pest_sensitivity": 0.85,
        "avg_yield_t_ha": 3.6,
        "market_price_per_tonne": 310.0
    },
    "Maize": {
        "opt_rain": (550, 850),
        "opt_temp": (18.0, 30.0),
        "crit_temp_max": 36.0,
        "drought_sensitivity": 0.80,
        "heat_sensitivity": 0.70,
        "flood_sensitivity": 0.75,
        "pest_sensitivity": 0.80,
        "avg_yield_t_ha": 3.1,
        "market_price_per_tonne": 250.0
    },
    "Soybean": {
        "opt_rain": (650, 950),
        "opt_temp": (20.0, 29.0),
        "crit_temp_max": 35.0,
        "drought_sensitivity": 0.75,
        "heat_sensitivity": 0.65,
        "flood_sensitivity": 0.85,
        "pest_sensitivity": 0.75,
        "avg_yield_t_ha": 2.4,
        "market_price_per_tonne": 520.0
    },
    "Cotton": {
        "opt_rain": (550, 800),
        "opt_temp": (22.0, 34.0),
        "crit_temp_max": 40.0,
        "drought_sensitivity": 0.60,
        "heat_sensitivity": 0.50,
        "flood_sensitivity": 0.80,
        "pest_sensitivity": 0.95,
        "avg_yield_t_ha": 2.5,
        "market_price_per_tonne": 750.0
    },
    "Potato": {
        "opt_rain": (450, 700),
        "opt_temp": (15.0, 22.0),
        "crit_temp_max": 28.0,
        "drought_sensitivity": 0.80,
        "heat_sensitivity": 0.95,
        "flood_sensitivity": 0.90,
        "pest_sensitivity": 0.90,
        "avg_yield_t_ha": 22.0,
        "market_price_per_tonne": 180.0
    },
    "Sugarcane": {
        "opt_rain": (1300, 2200),
        "opt_temp": (22.0, 36.0),
        "crit_temp_max": 42.0,
        "drought_sensitivity": 0.70,
        "heat_sensitivity": 0.40,
        "flood_sensitivity": 0.50,
        "pest_sensitivity": 0.70,
        "avg_yield_t_ha": 70.0,
        "market_price_per_tonne": 55.0
    },
    "Barley": {
        "opt_rain": (400, 700),
        "opt_temp": (12.0, 22.0),
        "crit_temp_max": 30.0,
        "drought_sensitivity": 0.55,
        "heat_sensitivity": 0.85,
        "flood_sensitivity": 0.70,
        "pest_sensitivity": 0.60,
        "avg_yield_t_ha": 2.8,
        "market_price_per_tonne": 270.0
    }
}

DEFAULT_CROP = "Wheat"

def compute_risk_profile(req: RiskEvaluationRequest) -> Dict[str, Any]:
    crop_name = req.crop.strip().capitalize()
    thresh = CROP_RISK_THRESHOLDS.get(crop_name, CROP_RISK_THRESHOLDS[DEFAULT_CROP])
    
    # 1. DROUGHT & MOISTURE DEFICIT RISK (0 - 100)
    min_rf, max_rf = thresh["opt_rain"]
    rain_val = req.rainfall_mm
    drought_score = 0.0
    if rain_val < min_rf:
        deficit_ratio = (min_rf - rain_val) / min_rf
        irrigation_buffer = 0.4 if req.irrigation_type in ["Drip", "Sprinkler"] else (0.6 if req.irrigation_type in ["Canal", "Tube-well"] else 1.0)
        drought_score = min(100.0, deficit_ratio * 100.0 * thresh["drought_sensitivity"] * irrigation_buffer)
    elif rain_val < min_rf * 1.1:
        drought_score = 15.0
    else:
        drought_score = 5.0

    # 2. THERMAL & HEATWAVE STRESS RISK (0 - 100)
    opt_t_min, opt_t_max = thresh["opt_temp"]
    temp_val = req.temperature_celsius
    crit_temp = thresh["crit_temp_max"]
    heat_score = 0.0
    if temp_val > opt_t_max:
        excess_temp = temp_val - opt_t_max
        temp_span = max(1.0, crit_temp - opt_t_max)
        heat_ratio = min(1.5, excess_temp / temp_span)
        heat_score = min(100.0, heat_ratio * 75.0 * thresh["heat_sensitivity"])
    elif temp_val < opt_t_min:
        heat_score = min(40.0, (opt_t_min - temp_val) * 8.0) # Cold stress
    else:
        heat_score = 8.0

    # 3. FLOOD & WATERLOGGING HAZARD (0 - 100)
    flood_score = 0.0
    if rain_val > max_rf:
        excess_rf = (rain_val - max_rf) / max_rf
        soil_retention_penalty = 1.3 if req.soil_type in ["Clay", "Black"] else (1.0 if req.soil_type == "Loamy" else 0.7)
        flood_score = min(100.0, excess_rf * 80.0 * thresh["flood_sensitivity"] * soil_retention_penalty)
    else:
        flood_score = 4.0

    # 4. PEST & PATHOGEN EPIDEMIC RISK (0 - 100)
    humidity = req.humidity_percent or 60.0
    pest_score = 20.0 # baseline
    if humidity >= 70.0 and 20.0 <= temp_val <= 30.0:
        pest_score += 45.0 * thresh["pest_sensitivity"]
    if rain_val > min_rf and humidity >= 75.0:
        pest_score += 25.0
    pest_score = min(100.0, pest_score)

    # 5. SOIL DEGRADATION & SALINITY / ACIDITY RISK (0 - 100)
    soil_risk = 10.0
    if req.soil_ph < 5.8:
        soil_risk += (5.8 - req.soil_ph) * 35.0
    elif req.soil_ph > 7.8:
        soil_risk += (req.soil_ph - 7.8) * 30.0

    if req.nitrogen_n < 100.0:
        soil_risk += ((100.0 - req.nitrogen_n) / 100.0) * 20.0
    if req.phosphorus_p < 30.0:
        soil_risk += 15.0
    if (req.organic_matter_percent or 2.0) < 1.5:
        soil_risk += 15.0
    soil_risk = min(100.0, soil_risk)

    # COMPOSITE WEIGHTED RISK INDEX (0 - 100)
    weights = [0.28, 0.24, 0.18, 0.16, 0.14]
    composite_risk = (
        drought_score * weights[0] +
        heat_score * weights[1] +
        flood_score * weights[2] +
        pest_score * weights[3] +
        soil_risk * weights[4]
    )
    composite_risk = round(max(5.0, min(96.0, composite_risk)), 1)

    # Risk Classification
    if composite_risk >= 70.0:
        risk_level = "Severe / Critical"
        risk_badge = "rose"
        risk_color = "#e11d48"
    elif composite_risk >= 48.0:
        risk_level = "High Hazard"
        risk_badge = "amber"
        risk_color = "#f59e0b"
    elif composite_risk >= 25.0:
        risk_level = "Moderate Risk"
        risk_badge = "yellow"
        risk_color = "#eab308"
    else:
        risk_level = "Low / Stable"
        risk_badge = "emerald"
        risk_color = "#10b981"

    # Estimated yield loss percentage and tonnage
    est_loss_pct = round(composite_risk * 0.48, 1) # e.g. 50 risk -> ~24% loss
    base_yield = thresh["avg_yield_t_ha"]
    total_potential_tonnes = round(base_yield * req.area_hectares, 1)
    projected_loss_tonnes = round(total_potential_tonnes * (est_loss_pct / 100.0), 1)
    price_per_t = thresh["market_price_per_tonne"]
    total_potential_revenue = round(total_potential_tonnes * price_per_t, 2)
    unmitigated_financial_var = round(projected_loss_tonnes * price_per_t, 2)

    # Insurance Net Exposure
    insured_coverage_val = 0.0
    if req.has_crop_insurance:
        coverage_rate = (req.insurance_coverage_percent or 75.0) / 100.0
        insured_coverage_val = round(unmitigated_financial_var * coverage_rate, 2)
    net_farmer_financial_exposure = round(max(0.0, unmitigated_financial_var - insured_coverage_val), 2)

    # Tailored Mitigation Action Items
    action_items = []
    if drought_score >= 40.0:
        action_items.append({
            "category": "Drought & Hydration",
            "priority": "Urgent",
            "action": f"Switch to deficit irrigation targeting only critical crown/flowering stages; apply {req.area_hectares * 3} tonnes straw mulch to cut soil evaporation."
        })
    if heat_score >= 40.0:
        action_items.append({
            "category": "Thermal Heat Defense",
            "priority": "High",
            "action": "Foliar spray of Potassium Nitrate (KNO3 @ 1.0%) or Salicylic Acid (50 ppm) to stabilize cell membrane against canopy scorching."
        })
    if flood_score >= 40.0:
        action_items.append({
            "category": "Drainage & Waterlogging",
            "priority": "Immediate",
            "action": "Excavate 30cm peripheral drainage trenches at field boundaries to prevent root hypoxia and phytophthora root rot."
        })
    if pest_score >= 40.0:
        action_items.append({
            "category": "Pest & Disease Outbreak",
            "priority": "High",
            "action": "Deploy 5 pheromone traps/ha and prophylactic Azadirachtin (10,000 ppm) foliar spray before fungal spore multiplication."
        })
    if soil_risk >= 40.0:
        action_items.append({
            "category": "Soil Chemical Remediation",
            "priority": "Medium",
            "action": f"Incorporate corrective Agricultural Lime or Gypsum based on measured pH ({req.soil_ph}) and replenish organic compost."
        })

    if not action_items:
        action_items.append({
            "category": "Standard Best Practices",
            "priority": "Routine",
            "action": "Maintain scheduled NPK split top-dressing and regular scouting for early pest alerts."
        })

    return {
        "crop": crop_name,
        "region": req.region,
        "season": req.season,
        "area_hectares": req.area_hectares,
        "composite_risk_score": composite_risk,
        "risk_level": risk_level,
        "risk_badge": risk_badge,
        "risk_color": risk_color,
        "hazard_breakdown": {
            "drought_moisture_risk": round(drought_score, 1),
            "heatwave_thermal_risk": round(heat_score, 1),
            "flood_waterlogging_hazard": round(flood_score, 1),
            "pest_disease_epidemic_risk": round(pest_score, 1),
            "soil_degradation_risk": round(soil_risk, 1)
        },
        "financial_impact": {
            "projected_yield_loss_percent": est_loss_pct,
            "potential_production_tonnes": total_potential_tonnes,
            "projected_loss_tonnes": projected_loss_tonnes,
            "potential_revenue_usd": total_potential_revenue,
            "unmitigated_financial_var_usd": unmitigated_financial_var,
            "insurance_payout_buffer_usd": insured_coverage_val,
            "net_farmer_exposure_usd": net_farmer_financial_exposure,
            "insurance_status": f"{'Covered (' + str(req.insurance_coverage_percent) + '%)' if req.has_crop_insurance else 'Uninsured'}"
        },
        "mitigation_action_plan": action_items
    }

# ─── 1. EVALUATE FARM RISK ───────────────────────────────────────────────────
@router.post("/evaluate")
def evaluate_farm_risk(req: RiskEvaluationRequest):
    """
    Evaluates multi-hazard risk (Drought, Heatwave, Flood, Pest, Soil)
    and computes Value-at-Risk (VaR) with mitigation recommendations.
    """
    profile = compute_risk_profile(req)
    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "data": profile
    }

# ─── 2. STRESS-TEST SCENARIO SIMULATOR ───────────────────────────────────────
@router.post("/stress-test")
def simulate_climate_stress_test(req: StressTestRequest):
    """
    Simulates climate shock scenarios (e.g., rainfall -30%, temp +3°C)
    to compare baseline risk against extreme climate vulnerability.
    """
    base_res = compute_risk_profile(req.base_request)

    # Apply shock
    shocked_request = req.base_request.model_copy()
    rf_factor = 1.0 + (req.rainfall_deviation_percent / 100.0)
    shocked_request.rainfall_mm = max(50.0, req.base_request.rainfall_mm * rf_factor)
    shocked_request.temperature_celsius = req.base_request.temperature_celsius + req.temperature_increase_celsius

    shocked_res = compute_risk_profile(shocked_request)

    risk_delta = round(shocked_res["composite_risk_score"] - base_res["composite_risk_score"], 1)
    loss_delta_tonnes = round(shocked_res["financial_impact"]["projected_loss_tonnes"] - base_res["financial_impact"]["projected_loss_tonnes"], 1)
    var_delta_usd = round(shocked_res["financial_impact"]["unmitigated_financial_var_usd"] - base_res["financial_impact"]["unmitigated_financial_var_usd"], 2)

    return {
        "status": "success",
        "scenario": {
            "rainfall_deviation_percent": req.rainfall_deviation_percent,
            "temperature_increase_celsius": req.temperature_increase_celsius,
            "simulated_rainfall_mm": round(shocked_request.rainfall_mm, 1),
            "simulated_temp_celsius": round(shocked_request.temperature_celsius, 1)
        },
        "baseline_profile": base_res,
        "stressed_profile": shocked_res,
        "impact_deltas": {
            "risk_score_increase": risk_delta,
            "additional_tonnes_lost": max(0.0, loss_delta_tonnes),
            "additional_financial_var_usd": max(0.0, var_delta_usd)
        }
    }

# ─── 3. REGIONAL RISK MATRIX ──────────────────────────────────────────────────
@router.get("/regional-matrix")
def get_regional_risk_matrix():
    """
    Returns regional vulnerability and disaster probability matrix across zones.
    """
    matrix = [
        {
            "region": "North Region",
            "primary_hazard": "Terminal Heatwave & Canal Deficit",
            "drought_vulnerability": "Moderate (38%)",
            "flood_vulnerability": "Low (18%)",
            "heatwave_vulnerability": "High (74%)",
            "pest_vulnerability": "Moderate (42%)",
            "overall_climate_index": "Moderate Risk (43/100)",
            "dominant_crops": ["Wheat", "Rice", "Sugarcane"]
        },
        {
            "region": "South Region",
            "primary_hazard": "Monsoon Irregularity & High Pest Pressure",
            "drought_vulnerability": "Moderate-High (58%)",
            "flood_vulnerability": "Moderate (45%)",
            "heatwave_vulnerability": "Moderate (48%)",
            "pest_vulnerability": "High (78%)",
            "overall_climate_index": "High Hazard (57/100)",
            "dominant_crops": ["Rice", "Cotton", "Maize"]
        },
        {
            "region": "East Region",
            "primary_hazard": "Flash Flooding & Acidic Soil Fixation",
            "drought_vulnerability": "Low (22%)",
            "flood_vulnerability": "Critical (86%)",
            "heatwave_vulnerability": "Moderate (40%)",
            "pest_vulnerability": "High (72%)",
            "overall_climate_index": "High Hazard (55/100)",
            "dominant_crops": ["Rice", "Potato", "Maize"]
        },
        {
            "region": "West Region",
            "primary_hazard": "Severe Aridity & Soil Salinity",
            "drought_vulnerability": "Critical (88%)",
            "flood_vulnerability": "Very Low (12%)",
            "heatwave_vulnerability": "High (80%)",
            "pest_vulnerability": "Moderate (45%)",
            "overall_climate_index": "Severe / Critical (66/100)",
            "dominant_crops": ["Cotton", "Soybean", "Barley"]
        },
        {
            "region": "Central Region",
            "primary_hazard": "Waterlogging in Vertisols & Late Season Drought",
            "drought_vulnerability": "High (62%)",
            "flood_vulnerability": "Moderate-High (52%)",
            "heatwave_vulnerability": "Moderate-High (60%)",
            "pest_vulnerability": "Moderate-High (58%)",
            "overall_climate_index": "High Hazard (58/100)",
            "dominant_crops": ["Soybean", "Wheat", "Maize"]
        }
    ]
    return {
        "status": "success",
        "matrix": matrix
    }
