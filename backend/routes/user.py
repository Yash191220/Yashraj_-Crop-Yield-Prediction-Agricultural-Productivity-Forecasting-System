from fastapi import APIRouter, Depends, HTTPException
from models.user import UserResponse, UserUpdate
from routes.auth import get_current_user, require_roles
from database.db import get_database

router = APIRouter(prefix="/api/user", tags=["User & Roles"])

# ─── READ ─────────────────────────────────────────────────────────────────────
@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: dict = Depends(get_current_user)):
    """READ - Get current user's profile"""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        region=current_user["region"],
        created_at=current_user["created_at"]
    )

# ─── UPDATE ───────────────────────────────────────────────────────────────────
@router.put("/profile", response_model=UserResponse)
def update_user_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """UPDATE - Update user's name and/or region"""
    db = get_database()
    updated_fields = {k: v for k, v in update_data.dict().items() if v is not None}

    if not updated_fields:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    if db is not None:
        try:
            result = db.users.find_one_and_update(
                {"id": current_user["id"]},
                {"$set": updated_fields},
                return_document=True
            )
            if result:
                result.pop("_id", None)
                return UserResponse(
                    id=result["id"],
                    name=result["name"],
                    email=result["email"],
                    role=result["role"],
                    region=result.get("region"),
                    created_at=result.get("created_at")
                )
        except Exception as e:
            print(f"MongoDB update notice: {e}")

    # Fallback: update in-memory current_user dict
    current_user.update(updated_fields)
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        region=current_user.get("region"),
        created_at=current_user.get("created_at")
    )

# ─── ROLE RESTRICTED VIEWS ────────────────────────────────────────────────────
@router.get("/farmer-dashboard")
def farmer_only_data(current_user: dict = Depends(require_roles(["farmer"]))):
    return {
        "message": "Welcome to the Farmer Portal",
        "user": current_user["name"],
        "assigned_region": current_user["region"]
    }

@router.get("/agronomist-reports")
def agronomist_only_data(current_user: dict = Depends(require_roles(["agronomist"]))):
    return {
        "message": "Welcome to Agronomist Advisory Center",
        "user": current_user["name"],
        "permissions": ["Soil Analysis", "Climate Risk Audit", "Recommendation Approval"]
    }

@router.get("/admin-panel")
def admin_only_data(current_user: dict = Depends(require_roles(["admin"]))):
    return {
        "message": "System Admin Control Center",
        "active_users": 154,
        "system_status": "Optimal"
    }
