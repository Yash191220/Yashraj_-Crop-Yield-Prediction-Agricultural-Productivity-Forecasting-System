from fastapi import APIRouter, HTTPException, Depends, status
from models.crop import FarmCreate, FarmResponse
from routes.auth import get_current_user
from database.db import get_database
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/farm", tags=["Farm Management"])

# In-memory store fallback
FARM_DB = []

@router.post("/create", response_model=FarmResponse)
def create_farm(farm_data: FarmCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    record = {
        "id": f"farm_{uuid.uuid4().hex[:8]}",
        "user_id": current_user["id"],
        "farm_name": farm_data.farm_name,
        "region": farm_data.region,
        "area_hectares": farm_data.area_hectares,
        "soil_type": farm_data.soil_type,
        "irrigation_type": farm_data.irrigation_type,
        "primary_crops": farm_data.primary_crops,
        "created_at": datetime.utcnow()
    }
    
    if db is not None:
        try:
            db.farms.insert_one(record.copy())
        except Exception as e:
            print(f"MongoDB persistence notice: {e}")
            
    FARM_DB.append(record)
    return record

@router.get("/list", response_model=list[FarmResponse])
def list_user_farms(current_user: dict = Depends(get_current_user)):
    db = get_database()
    if db is not None:
        try:
            farms = list(db.farms.find({"user_id": current_user["id"]}, {"_id": 0}))
            if farms:
                return farms
        except Exception as e:
            print(f"MongoDB read notice: {e}")
            
    # Fallback to in-memory filter
    user_farms = [f for f in FARM_DB if f["user_id"] == current_user["id"]]
    if not user_farms:
        # Seed default sample farm for user
        default_farm = {
            "id": f"farm_default_{current_user['id']}",
            "user_id": current_user["id"],
            "farm_name": "Green Valley Primary Field",
            "region": current_user.get("region", "North Region"),
            "area_hectares": 12.5,
            "soil_type": "Loamy",
            "irrigation_type": "Canal",
            "primary_crops": ["Wheat", "Rice", "Maize"],
            "created_at": datetime.utcnow()
        }
        user_farms.append(default_farm)
    return user_farms

@router.delete("/{farm_id}")
def delete_farm(farm_id: str, current_user: dict = Depends(get_current_user)):
    global FARM_DB
    db = get_database()
    if db is not None:
        try:
            db.farms.delete_one({"id": farm_id, "user_id": current_user["id"]})
        except Exception as e:
            print(f"MongoDB delete notice: {e}")
            
    FARM_DB = [f for f in FARM_DB if not (f["id"] == farm_id and f["user_id"] == current_user["id"])]
    return {"status": "success", "message": f"Farm {farm_id} deleted successfully"}


# ─── UPDATE ──────────────────────────────────────────────────────────────────
@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: str, farm_data: FarmCreate, current_user: dict = Depends(get_current_user)):
    """UPDATE - Edit an existing farm's details"""
    db = get_database()
    updated_fields = {
        "farm_name": farm_data.farm_name,
        "region": farm_data.region,
        "area_hectares": farm_data.area_hectares,
        "soil_type": farm_data.soil_type,
        "irrigation_type": farm_data.irrigation_type,
        "primary_crops": farm_data.primary_crops,
        "updated_at": datetime.utcnow()
    }

    if db is not None:
        try:
            result = db.farms.find_one_and_update(
                {"id": farm_id, "user_id": current_user["id"]},
                {"$set": updated_fields},
                return_document=True
            )
            if result:
                result.pop("_id", None)
                return result
        except Exception as e:
            print(f"MongoDB update notice: {e}")

    # Fallback: update in-memory
    for farm in FARM_DB:
        if farm["id"] == farm_id and farm["user_id"] == current_user["id"]:
            farm.update(updated_fields)
            return farm

    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Farm not found")
