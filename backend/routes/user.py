from fastapi import APIRouter, Depends
from models.user import UserResponse
from routes.auth import get_current_user, require_roles

router = APIRouter(prefix="/api/user", tags=["User & Roles"])

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        region=current_user["region"],
        created_at=current_user["created_at"]
    )

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
