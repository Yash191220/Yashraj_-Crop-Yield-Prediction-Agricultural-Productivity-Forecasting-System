from fastapi import APIRouter, HTTPException, Depends, status
from models.crop import FarmCreate, FarmUpdate, FarmResponse
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
    user_id = str(current_user.get("id") or current_user.get("_id") or current_user.get("email") or "unknown_farmer")
    user_email = current_user.get("email", "")

    record = {
        "id": f"farm_{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "user_email": user_email,
        "farm_name": farm_data.farm_name,
        "region": farm_data.region,
        "area_hectares": float(farm_data.area_hectares),
        "soil_type": farm_data.soil_type,
        "irrigation_type": farm_data.irrigation_type,
        "primary_crops": farm_data.primary_crops,
        "crop_allocations": farm_data.crop_allocations or [],
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
    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_email = current_user.get("email", "")

    if db is not None:
        try:
            query_conds = []
            if user_id:
                query_conds.append({"user_id": user_id})
            if user_email:
                query_conds.append({"user_id": user_email})
                query_conds.append({"user_email": user_email})

            query = {"$or": query_conds} if query_conds else {"user_id": user_id}
            farms = list(db.farms.find(query, {"_id": 0}))
            return farms
        except Exception as e:
            print(f"MongoDB read notice: {e}")
            
    # Fallback to in-memory filter
    user_farms = [
        f for f in FARM_DB 
        if (user_id and f.get("user_id") == user_id) or 
           (user_email and (f.get("user_id") == user_email or f.get("user_email") == user_email))
    ]
    return user_farms


@router.delete("/{farm_id}")
def delete_farm(farm_id: str, current_user: dict = Depends(get_current_user)):
    global FARM_DB
    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_email = current_user.get("email", "")
    db = get_database()

    query_conds = []
    if user_id:
        query_conds.append({"user_id": user_id})
    if user_email:
        query_conds.append({"user_id": user_email})
        query_conds.append({"user_email": user_email})
    owner_query = {"$or": query_conds} if query_conds else {"user_id": user_id}

    if db is not None:
        try:
            db.farms.delete_one({"id": farm_id, **owner_query})
        except Exception as e:
            print(f"MongoDB delete notice: {e}")
            
    FARM_DB = [
        f for f in FARM_DB 
        if not (f.get("id") == farm_id and (
            (user_id and f.get("user_id") == user_id) or 
            (user_email and (f.get("user_id") == user_email or f.get("user_email") == user_email))
        ))
    ]
    return {"status": "success", "message": f"Farm {farm_id} deleted successfully"}


# ─── UPDATE ──────────────────────────────────────────────────────────────────
@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: str, farm_data: FarmUpdate, current_user: dict = Depends(get_current_user)):
    """UPDATE - Edit an existing farm's details"""
    db = get_database()
    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    user_email = current_user.get("email", "")

    updated_fields = {k: v for k, v in farm_data.model_dump(exclude_unset=True).items() if v is not None}
    updated_fields["updated_at"] = datetime.utcnow()

    query_conds = []
    if user_id:
        query_conds.append({"user_id": user_id})
    if user_email:
        query_conds.append({"user_id": user_email})
        query_conds.append({"user_email": user_email})
    owner_query = {"$or": query_conds} if query_conds else {"user_id": user_id}

    if db is not None:
        try:
            result = db.farms.find_one_and_update(
                {"id": farm_id, **owner_query},
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
        is_owner = (user_id and farm.get("user_id") == user_id) or \
                   (user_email and (farm.get("user_id") == user_email or farm.get("user_email") == user_email))
        if farm.get("id") == farm_id and is_owner:
            farm.update(updated_fields)
            return farm

    raise HTTPException(status_code=404, detail="Farm not found")
