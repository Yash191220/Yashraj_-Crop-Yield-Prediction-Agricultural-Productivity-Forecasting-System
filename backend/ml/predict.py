import os
import joblib
import pandas as pd
import numpy as np

from preprocessing import clean_dataset

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

_model_bundle = None


def load_model():
    global _model_bundle

    if _model_bundle is None:

        if not os.path.exists(MODEL_PATH):
            from train_model import train
            train()

        _model_bundle = joblib.load(MODEL_PATH)

    return _model_bundle


def predict_yield(input_data):

    bundle = load_model()

    preprocessor = bundle["preprocessor"]

    rf_model = bundle["rf_model"]
    et_model = bundle["et_model"]
    boost_model = bundle["boost_model"]

    use_log_target = bundle.get("log_target", False)

    # -----------------------------
    # Convert input to DataFrame
    # -----------------------------

    df = pd.DataFrame([input_data])

    df = clean_dataset(df)

    X = preprocessor.transform(df)

    # -----------------------------
    # Individual predictions
    # -----------------------------

    rf_pred = rf_model.predict(X)[0]

    et_pred = et_model.predict(X)[0]

    boost_pred = boost_model.predict(X)[0]

    # -----------------------------
    # Weighted Ensemble
    # -----------------------------

    prediction = (
        0.45 * rf_pred +
        0.35 * et_pred +
        0.20 * boost_pred
    )

    # -----------------------------
    # Reverse Log Transform
    # -----------------------------

    if use_log_target:
        prediction = np.expm1(prediction)

    prediction = float(max(100.0, prediction))

    # -----------------------------
    # Total Production
    # -----------------------------

    area = float(input_data.get("area_hectares", 1))

    total_production = (
        prediction * area
    ) / 1000

    # -----------------------------
    # Soil Evaluation
    # -----------------------------

    ph = float(input_data.get("soil_ph", 6.5))

    n = float(input_data.get("nitrogen_n", 100))

    p = float(input_data.get("phosphorus_p", 40))

    k = float(input_data.get("potassium_k", 60))

    soil_score = (
        100
        - abs(ph - 6.8) * 15
        - max(0, 80 - n) * 0.3
        - max(0, 30 - p) * 0.5
    )

    soil_score = max(30, min(98, round(soil_score, 1)))

    # -----------------------------
    # Weather Evaluation
    # -----------------------------

    temp = float(input_data.get("temperature_celsius", 25))

    rainfall = float(input_data.get("rainfall_mm", 800))

    weather_score = (
        100
        - abs(temp - 24) * 2.5
        - max(0, 500 - rainfall) * 0.05
    )

    weather_score = max(35, min(99, round(weather_score, 1)))

    productivity = round(
        (soil_score + weather_score) / 2,
        1
    )

    # -----------------------------
    # Risk Analysis
    # -----------------------------

    risks = []

    recommendations = []

    if ph < 6.0:

        risks.append(
            "Acidic soil may reduce nutrient availability."
        )

        recommendations.append(
            "Apply agricultural lime."
        )

    elif ph > 7.8:

        risks.append(
            "Alkaline soil may reduce micronutrient uptake."
        )

        recommendations.append(
            "Apply sulfur or organic compost."
        )

    if n < 70:

        recommendations.append(
            "Increase Nitrogen fertilizer."
        )

    if (
        rainfall < 500 and
        input_data.get("irrigation_type") == "Rainfed"
    ):

        risks.append(
            "Low rainfall without irrigation."
        )

        recommendations.append(
            "Use drip or sprinkler irrigation."
        )

    if len(risks) == 0:

        risks.append(
            "No major agricultural risks detected."
        )

    if len(recommendations) == 0:

        recommendations.append(
            "Maintain current farming practices."
        )

    return {

        "predicted_yield_kg_ha":
            round(prediction, 2),

        "total_production_tonnes":
            round(total_production, 2),

        "productivity_score":
            productivity,

        "soil_health": {

            "score": soil_score,

            "status":
                "Optimal"
                if soil_score >= 75
                else (
                    "Fair"
                    if soil_score >= 55
                    else "Poor"
                ),

            "ph": ph,

            "npk_ratio":
                f"{n}:{p}:{k}"

        },

        "weather_impact": {

            "score": weather_score,

            "status":
                "Favorable"
                if weather_score >= 75
                else "Moderate",

            "temperature_celsius": temp,

            "rainfall_mm": rainfall

        },

        "risk_assessment":
            risks,

        "recommendations":
            recommendations,

        "model_metrics":
            bundle.get("metrics", {})

    }