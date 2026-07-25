from fastapi import APIRouter
from models.weather import WeatherQuery, WeatherReport

router = APIRouter(prefix="/api/weather", tags=["Weather Analysis"])

@router.post("/analyze", response_model=WeatherReport)
def analyze_weather(query: WeatherQuery):
    # Regional baseline weather heuristics
    region_data = {
        "North Region": {"rainfall": 950.0, "temp": 22.5, "humidity": 65.0},
        "South Region": {"rainfall": 1250.0, "temp": 29.0, "humidity": 78.0},
        "East Region": {"rainfall": 1400.0, "temp": 27.5, "humidity": 82.0},
        "West Region": {"rainfall": 600.0, "temp": 32.0, "humidity": 50.0},
        "Central Region": {"rainfall": 850.0, "temp": 26.0, "humidity": 60.0}
    }
    
    data = region_data.get(query.region, {"rainfall": 800.0, "temp": 25.0, "humidity": 65.0})
    rainfall = data["rainfall"]
    
    drought_risk = "Low" if rainfall > 800 else ("Moderate" if rainfall > 500 else "Severe")
    climate_status = "Optimal rainfall and temperature conditions for active crop growth." if drought_risk == "Low" else "Moisture conservation recommended."
    
    return {
        "region": query.region,
        "rainfall_mm": rainfall,
        "temperature_celsius": data["temp"],
        "humidity_percent": data["humidity"],
        "climate_status": climate_status,
        "drought_risk": drought_risk
    }
