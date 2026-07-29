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
                
        PREDICTION_HISTORY.append(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction engine error: {str(e)}")

@router.get("/history", response_model=list[PredictionResponse])
def get_prediction_history(user_id: str = "guest"):
    db = get_database()
    if db is not None:
        try:
            # Query for user's predictions as well as default/guest predictions
            query = {"$or": [{"user_id": user_id}, {"user_id": "usr_farmer_1"}, {"user_id": "guest"}]} if user_id else {}
            records = list(db.yield_predictions.find(query, {"_id": 0}).sort("created_at", -1).limit(30))
            
            valid_records = []
            for r in records:
                # Ensure default values if missing
                r["soil_health"] = r.get("soil_health", {"status": "Optimal", "score": 90})
                r["weather_impact"] = r.get("weather_impact", {"risk_level": "Low Risk"})
                r["risk_assessment"] = r.get("risk_assessment", ["Standard weather variability"])
                r["recommendations"] = r.get("recommendations", ["Maintain recommended irrigation and soil nutrients"])
                valid_records.append(r)
                
            if valid_records:
                return valid_records
        except Exception as e:
            print(f"MongoDB prediction history read notice: {e}")
            
    # Return in-memory fallback
    return list(reversed(PREDICTION_HISTORY[-30:]))
