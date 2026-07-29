from pymongo import MongoClient
from datetime import datetime

def seed():
    try:
        client = MongoClient('mongodb://localhost:27017', serverSelectionTimeoutMS=2000)
        db = client['yieldsense_db']
        
        # Seed Predictions
        if db.yield_predictions.count_documents({}) == 0:
            db.yield_predictions.insert_many([
                {
                    "id": "pred_seed_001",
                    "user_id": "usr_farmer_1",
                    "crop": "Wheat",
                    "region": "North Region",
                    "season": "Rabi",
                    "area_hectares": 12.5,
                    "rainfall_mm": 950.0,
                    "temperature_celsius": 22.5,
                    "soil_ph": 6.8,
                    "nitrogen_n": 140.0,
                    "phosphorus_p": 45.0,
                    "potassium_k": 80.0,
                    "predicted_yield_kg_ha": 3450.5,
                    "total_production_tonnes": 43.13,
                    "productivity_score": 92,
                    "soil_health": {"status": "Optimal", "score": 94},
                    "weather_impact": {"risk_level": "Low Risk"},
                    "risk_assessment": ["Slight temperature variance during grain filling phase"],
                    "recommendations": ["Apply 25 kg/ha Nitrogen top-dressing at tillering stage"],
                    "created_at": datetime.utcnow()
                },
                {
                    "id": "pred_seed_002",
                    "user_id": "usr_farmer_1",
                    "crop": "Rice",
                    "region": "East Region",
                    "season": "Kharif",
                    "area_hectares": 18.0,
                    "rainfall_mm": 1250.0,
                    "temperature_celsius": 28.0,
                    "soil_ph": 6.2,
                    "nitrogen_n": 160.0,
                    "phosphorus_p": 50.0,
                    "potassium_k": 90.0,
                    "predicted_yield_kg_ha": 4280.0,
                    "total_production_tonnes": 77.04,
                    "productivity_score": 88,
                    "soil_health": {"status": "Optimal", "score": 90},
                    "weather_impact": {"risk_level": "Low Risk"},
                    "risk_assessment": ["High humidity may increase sheath blight probability"],
                    "recommendations": ["Maintain 5cm standing water level during panicle initiation"],
                    "created_at": datetime.utcnow()
                }
            ])
            print("Successfully seeded yield_predictions collection.")
            
        # Seed Farms
        if db.farms.count_documents({}) == 0:
            db.farms.insert_many([
                {
                    "id": "farm_seed_001",
                    "user_id": "usr_farmer_1",
                    "farm_name": "Sunrise Organic Wheat Valley",
                    "region": "North Region",
                    "area_hectares": 12.5,
                    "soil_type": "Loamy",
                    "irrigation_type": "Canal",
                    "primary_crops": ["Wheat", "Rice"],
                    "created_at": datetime.utcnow()
                }
            ])
            print("Successfully seeded farms collection.")
            
        print("MongoDB seed complete! Database name: yieldsense_db")
        print("Collections in yieldsense_db:", db.list_collection_names())
    except Exception as e:
        print("MongoDB seeding error:", e)

if __name__ == "__main__":
    seed()
