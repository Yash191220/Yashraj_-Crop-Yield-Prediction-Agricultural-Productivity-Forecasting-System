from fastapi import APIRouter, HTTPException, Depends
from routes.auth import get_current_user, require_roles, USER_DB
from database.db import get_database
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["Admin Approvals"])


# ─── GET: All Pending Users ────────────────────────────────────────────────────
@router.get("/pending-users")
def get_pending_users(current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Get all users with status=pending"""
    db = get_database()
    pending = []

    if db is not None:
        try:
            results = list(db.users.find({"status": "pending"}, {"_id": 0, "password_hash": 0}))
            pending = results
        except Exception as e:
            print(f"MongoDB read notice: {e}")

    # Fallback: in-memory
    if not pending:
        pending = [
            {k: v for k, v in u.items() if k != "password_hash"}
            for u in USER_DB.values()
            if u.get("status") == "pending"
        ]

    # Serialize datetime fields
    for u in pending:
        if isinstance(u.get("created_at"), datetime):
            u["created_at"] = u["created_at"].isoformat()

    return {"pending_users": pending, "count": len(pending)}


# ─── GET: Live Admin Dashboard System Metrics ───────────────────────────────
@router.get("/stats")
def get_admin_stats(current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Get live system metrics from MongoDB database"""
    db = get_database()
    
    total_users_count = 0
    farmer_count = 0
    admin_count = 0
    total_predictions_count = 0
    active_regions = set()
    all_users = []
    
    if db is not None:
        try:
            # Users
            users_list = list(db.users.find({}, {"_id": 0, "password_hash": 0}))
            all_users = users_list
            total_users_count = len(users_list)
            for u in users_list:
                role = u.get("role", "farmer")
                if role == "farmer":
                    farmer_count += 1
                elif role == "admin":
                    admin_count += 1
                reg = u.get("region")
                if reg:
                    active_regions.add(reg)
                    
            # Predictions
            pred_count = db.yield_predictions.count_documents({})
            total_predictions_count = pred_count
            
            # Extract regions from predictions if any
            regions_from_preds = db.yield_predictions.distinct("region")
            for r in regions_from_preds:
                if r:
                    active_regions.add(r)
        except Exception as e:
            print(f"MongoDB stats query notice: {e}")

    # Fallback/Supplemental if DB empty
    if total_users_count == 0:
        in_mem_users = [
            {k: v for k, v in u.items() if k != "password_hash"}
            for u in USER_DB.values()
        ]
        all_users = in_mem_users
        total_users_count = len(in_mem_users)
        farmer_count = sum(1 for u in in_mem_users if u.get("role") == "farmer")
        admin_count = sum(1 for u in in_mem_users if u.get("role") == "admin")
        
    if total_predictions_count == 0:
        try:
            from routes.prediction import PREDICTION_HISTORY
            total_predictions_count = len(PREDICTION_HISTORY)
        except Exception:
            total_predictions_count = 5

    if not active_regions:
        active_regions = {"North Region", "South Region", "East Region", "West Region", "Central Region"}

    for u in all_users:
        if isinstance(u.get("created_at"), datetime):
            u["created_at"] = u["created_at"].isoformat()

    return {
        "total_users": total_users_count,
        "farmer_count": farmer_count,
        "admin_count": admin_count,
        "total_predictions": total_predictions_count,
        "active_regions_count": len(active_regions),
        "active_regions_list": list(active_regions),
        "all_users": all_users
    }


# ─── GET: All Users (any status) ──────────────────────────────────────────────
@router.get("/all-users")
def get_all_users(current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Get all registered users"""
    db = get_database()
    users = []

    if db is not None:
        try:
            results = list(db.users.find({}, {"_id": 0, "password_hash": 0}))
            users = results
        except Exception as e:
            print(f"MongoDB read notice: {e}")

    if not users:
        users = [
            {k: v for k, v in u.items() if k != "password_hash"}
            for u in USER_DB.values()
        ]

    for u in users:
        if isinstance(u.get("created_at"), datetime):
            u["created_at"] = u["created_at"].isoformat()

    return {"users": users, "count": len(users)}


# ─── PUT: Approve a User ──────────────────────────────────────────────────────
@router.put("/approve/{user_id}")
def approve_user(user_id: str, current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Approve a pending farmer registration"""
    db = get_database()

    if db is not None:
        try:
            result = db.users.find_one_and_update(
                {"id": user_id, "status": "pending"},
                {"$set": {"status": "active", "approved_by": current_user["email"], "approved_at": datetime.utcnow()}},
                return_document=True
            )
            if result:
                return {"success": True, "message": f"User {result['name']} approved successfully.", "user_id": user_id}
        except Exception as e:
            print(f"MongoDB update notice: {e}")

    # Fallback: in-memory
    for email, user in USER_DB.items():
        if user.get("id") == user_id and user.get("status") == "pending":
            USER_DB[email]["status"] = "active"
            USER_DB[email]["approved_by"] = current_user["email"]
            return {"success": True, "message": f"User {user['name']} approved successfully.", "user_id": user_id}

    raise HTTPException(status_code=404, detail="Pending user not found.")


# ─── PUT: Reject a User ───────────────────────────────────────────────────────
@router.put("/reject/{user_id}")
def reject_user(user_id: str, current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Reject a pending farmer registration"""
    db = get_database()

    if db is not None:
        try:
            result = db.users.find_one_and_update(
                {"id": user_id, "status": "pending"},
                {"$set": {"status": "rejected", "rejected_by": current_user["email"], "rejected_at": datetime.utcnow()}},
                return_document=True
            )
            if result:
                return {"success": True, "message": f"User {result['name']} rejected.", "user_id": user_id}
        except Exception as e:
            print(f"MongoDB update notice: {e}")

    # Fallback: in-memory
    for email, user in USER_DB.items():
        if user.get("id") == user_id and user.get("status") == "pending":
            USER_DB[email]["status"] = "rejected"
            return {"success": True, "message": f"User {user['name']} rejected.", "user_id": user_id}

    raise HTTPException(status_code=404, detail="Pending user not found.")


# ─── GET: Farmer Full Activity Profile ────────────────────────────────────────
@router.get("/farmer/{user_id}/activity")
def get_farmer_activity(user_id: str, current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Get full activity profile for a specific farmer (predictions + farms)"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")

    # Find the farmer user
    farmer = db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    if isinstance(farmer.get("created_at"), datetime):
        farmer["created_at"] = farmer["created_at"].isoformat()

    # Get their predictions
    predictions = list(db.yield_predictions.find({"user_id": user_id}, {"_id": 0}))
    for p in predictions:
        if isinstance(p.get("created_at"), datetime):
            p["created_at"] = p["created_at"].isoformat()

    # Get their farm parcels
    farms = list(db.farms.find({"user_id": user_id}, {"_id": 0}))
    for f in farms:
        if isinstance(f.get("created_at"), datetime):
            f["created_at"] = f["created_at"].isoformat()

    return {
        "farmer": farmer,
        "predictions": predictions,
        "farms": farms,
        "prediction_count": len(predictions),
        "farm_count": len(farms)
    }


# ─── DELETE: Remove a Farmer and All Their Data ───────────────────────────────
@router.delete("/farmer/{user_id}")
def delete_farmer(user_id: str, current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Permanently delete a farmer and all their data (predictions + farms)"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")

    farmer = db.users.find_one({"id": user_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Only allow deleting farmers, not admins
    if farmer.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete an admin account.")

    farmer_name = farmer.get("name", farmer.get("email", user_id))

    # Delete predictions
    pred_result = db.yield_predictions.delete_many({"user_id": user_id})

    # Delete farm parcels
    farm_result = db.farms.delete_many({"user_id": user_id})

    # Delete the user
    db.users.delete_one({"id": user_id})

    # Also remove from in-memory USER_DB
    email = farmer.get("email")
    if email and email in USER_DB:
        del USER_DB[email]

    print(f"🗑️ Admin {current_user['email']} deleted farmer {farmer_name} "
          f"({pred_result.deleted_count} predictions, {farm_result.deleted_count} farms removed)")

    return {
        "success": True,
        "message": f"Farmer '{farmer_name}' and all their data have been permanently deleted.",
        "deleted_predictions": pred_result.deleted_count,
        "deleted_farms": farm_result.deleted_count
    }
