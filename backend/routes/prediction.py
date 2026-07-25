from fastapi import APIRouter, HTTPException
import sys
import os

# Add ml directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '../ml'))
from predict import predict_yield
from models.prediction import PredictionRequest, PredictionResponse

router = APIRouter(prefix="/api/prediction", tags=["Yield Prediction"])

@router.post("/predict", response_model=PredictionResponse)
def predict_crop_yield(request: PredictionRequest):
    try:
        input_data = request.model_dump()
        result = predict_yield(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction engine error: {str(e)}")
