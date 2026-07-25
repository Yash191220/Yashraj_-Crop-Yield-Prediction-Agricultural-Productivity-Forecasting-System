import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

_model_bundle = None

def load_model():
    global _model_bundle
    if _model_bundle is None:
        if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) == 0:
            from train_model import train
            train()
        _model_bundle = joblib.load(MODEL_PATH)
    return _model_bundle

def predict_yield(input_data: dict) -> dict:
    bundle = load_model()
    preprocessor = bundle['preprocessor']
    rf_model = bundle['rf_model']
    boost_model = bundle['boost_model']
    
    df_input = pd.DataFrame([input_data])
    X_processed = preprocessor.transform(df_input)

    rf_pred = rf_model.predict(X_processed)[0]
    boost_pred = boost_model.predict(X_processed)[0]
    
    # Ensemble prediction
    predicted_yield = max(100.0, float(0.5 * rf_pred + 0.5 * boost_pred))
    area = float(input_data.get('area_hectares', 1.0))
    total_production_tonnes = round((predicted_yield * area) / 1000.0, 2)
    
    # Soil & Weather evaluation metrics
    ph = float(input_data.get('soil_ph', 6.5))
    temp = float(input_data.get('temperature_celsius', 25.0))
    rainfall = float(input_data.get('rainfall_mm', 800.0))
    n = float(input_data.get('nitrogen_n', 100.0))
    p = float(input_data.get('phosphorus_p', 40.0))
    k = float(input_data.get('potassium_k', 60.0))
    
    # Calculate soil suitability rating
    soil_score = 100 - abs(ph - 6.8) * 15 - max(0, 80 - n) * 0.3 - max(0, 30 - p) * 0.5
    soil_score = max(30, min(98, round(soil_score, 1)))

    # Weather impact rating
    weather_score = 100 - abs(temp - 24) * 2.5 - max(0, 500 - rainfall) * 0.05
    weather_score = max(35, min(99, round(weather_score, 1)))
    
    # Productivity score
    productivity_score = round(0.5 * soil_score + 0.5 * weather_score, 1)

    # Risk Assessment & Advice
    risks = []
    recommendations = []
    
    if ph < 6.0:
        risks.append("Acidic soil detected which restricts nutrient absorption.")
        recommendations.append("Apply agricultural lime (calcium carbonate) to increase soil pH towards 6.5-7.0.")
    elif ph > 7.8:
        risks.append("Alkaline soil detected which can cause iron/zinc deficiency.")
        recommendations.append("Apply elemental sulfur or organic compost to lower soil pH.")

    if n < 70:
        recommendations.append("Top-dress with Nitrogen-rich fertilizer (Urea or Ammonium Nitrate).")
    if rainfall < 500 and input_data.get('irrigation_type') == 'Rainfed':
        risks.append("Below-average rainfall predicted without supplemental irrigation.")
        recommendations.append("Consider installing drip or sprinkler irrigation to safeguard moisture levels.")
    
    if not risks:
        risks.append("Optimal growing conditions detected with low climate/soil risk.")
    if not recommendations:
        recommendations.append("Maintain current nutrient application and monitor soil moisture weekly.")

    return {
        "predicted_yield_kg_ha": round(predicted_yield, 2),
        "total_production_tonnes": total_production_tonnes,
        "productivity_score": productivity_score,
        "soil_health": {
            "score": soil_score,
            "status": "Optimal" if soil_score > 75 else ("Fair" if soil_score > 55 else "Suboptimal"),
            "ph": ph,
            "npk_ratio": f"{n}:{p}:{k}"
        },
        "weather_impact": {
            "score": weather_score,
            "status": "Favorable" if weather_score > 75 else "Moderate",
            "temperature_celsius": temp,
            "rainfall_mm": rainfall
        },
        "risk_assessment": risks,
        "recommendations": recommendations,
        "model_metrics": bundle.get('metrics', {})
    }
