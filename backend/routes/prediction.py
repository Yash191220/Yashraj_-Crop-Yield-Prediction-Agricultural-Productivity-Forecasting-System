from fastapi import APIRouter, HTTPException, Depends
import sys
import os
from datetime import datetime
import uuid

sys.path.append(os.path.join(os.path.dirname(__file__), '../ml'))
from predict import predict_yield
from models.prediction import PredictionRequest, PredictionResponse
from database.db import get_database

router = APIRouter(prefix="/api/prediction", tags=["Yield Prediction"])

# In-memory history store fallback
PREDICTION_HISTORY = []

CROPS = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Barley', 'Sugarcane', 'Potato']

@router.post("/predict", response_model=PredictionResponse)
def predict_crop_yield(request: PredictionRequest):
    try:
        input_data = request.model_dump()
        result = predict_yield(input_data)
        
        record_id = f"pred_{uuid.uuid4().hex[:8]}"
        created_at = datetime.utcnow()
        result["id"] = record_id
        result["created_at"] = created_at
        
        # Complete prediction record matching PredictionResponse schema
        save_record = {
            "id": record_id,
            "user_id": input_data.get("user_id", "guest"),
            "crop": input_data.get("crop"),
            "region": input_data.get("region"),
            "season": input_data.get("season"),
            "area_hectares": input_data.get("area_hectares"),
            "rainfall_mm": input_data.get("rainfall_mm"),
            "temperature_celsius": input_data.get("temperature_celsius"),
            "soil_ph": input_data.get("soil_ph"),
            "nitrogen_n": input_data.get("nitrogen_n"),
            "phosphorus_p": input_data.get("phosphorus_p"),
            "potassium_k": input_data.get("potassium_k"),
            "predicted_yield_kg_ha": result.get("predicted_yield_kg_ha"),
            "total_production_tonnes": result.get("total_production_tonnes"),
            "productivity_score": result.get("productivity_score"),
            "soil_health": result.get("soil_health"),
            "weather_impact": result.get("weather_impact"),
            "risk_assessment": result.get("risk_assessment"),
            "recommendations": result.get("recommendations"),
            "created_at": created_at
        }
        
        db = get_database()
        if db is not None:
            try:
                db.yield_predictions.insert_one(save_record.copy())
            except Exception as e:
                print(f"MongoDB yield prediction save notice: {e}")
                
        PREDICTION_HISTORY.append(save_record)
        return save_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction engine error: {str(e)}")

@router.post("/crop-recommend")
def recommend_crop(request: PredictionRequest):
    """Run ML predictions for all crops with same field/climate inputs and rank them."""
    try:
        base_input = request.model_dump()
        results = []
        for crop in CROPS:
            try:
                crop_input = {**base_input, "crop": crop}
                pred = predict_yield(crop_input)
                results.append({
                    "crop": crop,
                    "predicted_yield_kg_ha": pred.get("predicted_yield_kg_ha", 0),
                })
            except Exception:
                results.append({"crop": crop, "predicted_yield_kg_ha": 0})

        # Sort by yield descending
        results.sort(key=lambda x: x["predicted_yield_kg_ha"], reverse=True)

        # Calculate percentage relative to top yield
        max_yield = results[0]["predicted_yield_kg_ha"] if results and results[0]["predicted_yield_kg_ha"] > 0 else 1
        total_yield = sum(r["predicted_yield_kg_ha"] for r in results)

        ranked = []
        for i, r in enumerate(results):
            ranked.append({
                "rank": i + 1,
                "crop": r["crop"],
                "predicted_yield_kg_ha": r["predicted_yield_kg_ha"],
                "suitability_pct": round((r["predicted_yield_kg_ha"] / max_yield) * 100, 1),
                "share_pct": round((r["predicted_yield_kg_ha"] / total_yield) * 100, 1) if total_yield > 0 else 0,
            })

        return {"recommendations": ranked, "based_on_region": base_input.get("region"), "based_on_season": base_input.get("season")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation error: {str(e)}")

@router.get("/history", response_model=list[PredictionResponse])
def get_prediction_history(user_id: str = "guest"):
    db = get_database()
    if db is not None:
        try:
            # Query strictly for the requesting user's predictions
            query = {"user_id": user_id} if user_id and user_id != "all" else {}
            records = list(db.yield_predictions.find(query, {"_id": 0}).sort("created_at", -1).limit(50))
            
            valid_records = []
            for r in records:
                # Ensure default values if missing
                r["soil_health"] = r.get("soil_health", {"status": "Optimal", "score": 90})
                r["weather_impact"] = r.get("weather_impact", {"risk_level": "Low Risk"})
                r["risk_assessment"] = r.get("risk_assessment", ["Standard weather variability"])
                r["recommendations"] = r.get("recommendations", ["Maintain recommended irrigation and soil nutrients"])
                valid_records.append(r)
                
            return valid_records
        except Exception as e:
            print(f"MongoDB prediction history read notice: {e}")
            
    # Return in-memory fallback filtered by user_id
    user_logs = [p for p in PREDICTION_HISTORY if p.get("user_id") == user_id] if user_id and user_id != "all" else PREDICTION_HISTORY
    return list(reversed(user_logs[-50:]))
