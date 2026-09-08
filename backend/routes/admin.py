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

    # Exclude any automated test or demo emails
    pending = [
        u for u in pending
        if not any(x in u.get("email", "").lower() for x in ["postman", "test@", "demo@"])
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
    advisor_count = 0
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
                elif role in ["advisor", "agronomist"]:
                    advisor_count += 1
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
        advisor_count = sum(1 for u in in_mem_users if u.get("role") in ["advisor", "agronomist"])
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
        "advisor_count": advisor_count,
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

    # Exclude any automated test or demo emails
    users = [
        u for u in users
        if not any(x in u.get("email", "").lower() for x in ["postman", "test@", "demo@"])
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


# ─── GET: User (Farmer or Advisor) Full Activity Profile ──────────────────────
@router.get("/user/{user_id}/activity")
@router.get("/farmer/{user_id}/activity")
def get_user_activity(user_id: str, current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Get full activity profile for a specific user (Farmer or Advisor)"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")

    # Find by id, email, or _id
    target_user = db.users.find_one({"$or": [{"id": user_id}, {"email": user_id}]}, {"_id": 0, "password_hash": 0})
    if not target_user:
        from bson.objectid import ObjectId
        if ObjectId.is_valid(user_id):
            target_user = db.users.find_one({"_id": ObjectId(user_id)}, {"_id": 0, "password_hash": 0})

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(target_user.get("created_at"), datetime):
        target_user["created_at"] = target_user["created_at"].isoformat()

    role = target_user.get("role", "farmer")
    is_advisor = role in ["advisor", "agronomist"]

    # If Advisor: get their consultation statistics and handled inquiries
    if is_advisor:
        from routes.advisor import INQUIRIES_DB
        advisor_name = target_user.get("name", "")
        advisor_email = target_user.get("email", "")
        
        # Gather inquiries where advisor replied or participated
        advisor_inquiries = []
        for inq in INQUIRIES_DB.values():
            replied = any(m.get("sender_name") == advisor_name or m.get("sender_role") == "advisor" for m in inq.get("messages", []))
            if replied or inq.get("advisor_email") == advisor_email:
                advisor_inquiries.append(inq)

        return {
            "user": target_user,
            "farmer": target_user, # for backwards compatibility
            "role": role,
            "is_advisor": True,
            "inquiries": advisor_inquiries,
            "inquiry_count": len(advisor_inquiries),
            "predictions": [],
            "farms": [],
            "prediction_count": 0,
            "farm_count": 0
        }

    # If Farmer: Get their predictions and farm parcels
    predictions = list(db.yield_predictions.find({"$or": [{"user_id": user_id}, {"user_id": target_user.get("email")}]}, {"_id": 0}))
    for p in predictions:
        if isinstance(p.get("created_at"), datetime):
            p["created_at"] = p["created_at"].isoformat()

    farms = list(db.farms.find({"$or": [{"user_id": user_id}, {"user_id": target_user.get("email")}]}, {"_id": 0}))
    for f in farms:
        if isinstance(f.get("created_at"), datetime):
            f["created_at"] = f["created_at"].isoformat()

    return {
        "user": target_user,
        "farmer": target_user,
        "role": role,
        "is_advisor": False,
        "predictions": predictions,
        "farms": farms,
        "prediction_count": len(predictions),
        "farm_count": len(farms)
    }


# ─── DELETE: Remove a User (Farmer or Advisor) and All Their Data in MongoDB Atlas ───
@router.delete("/user/{user_id}")
@router.delete("/farmer/{user_id}")
def delete_user(user_id: str, current_user: dict = Depends(require_roles(["admin"]))):
    """Admin only: Permanently delete a farmer or advisor and all their data in MongoDB Atlas"""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")

    # Find by id, email, or _id
    target_user = db.users.find_one({"$or": [{"id": user_id}, {"email": user_id}]})
    if not target_user:
        from bson.objectid import ObjectId
        if ObjectId.is_valid(user_id):
            target_user = db.users.find_one({"_id": ObjectId(user_id)})

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only allow deleting farmers and advisors, not admins
    if target_user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete an administrator account.")

    user_name = target_user.get("name", target_user.get("email", user_id))
    user_str_id = target_user.get("id", user_id)
    email = target_user.get("email")
    role = target_user.get("role", "farmer")

    # Delete predictions from MongoDB Atlas
    pred_result = db.yield_predictions.delete_many({"$or": [{"user_id": user_str_id}, {"user_id": email}]})

    # Delete farm parcels from MongoDB Atlas
    farm_result = db.farms.delete_many({"$or": [{"user_id": user_str_id}, {"user_id": email}]})

    # Delete user document permanently from MongoDB Atlas
    db.users.delete_one({"_id": target_user["_id"]})

    # Also remove from in-memory USER_DB
    if email and email in USER_DB:
        del USER_DB[email]

    print(f"🗑️ Admin {current_user['email']} permanently deleted {role} '{user_name}' from MongoDB Atlas "
          f"({pred_result.deleted_count} predictions, {farm_result.deleted_count} farms removed)")

    return {
        "success": True,
        "message": f"{role.capitalize()} '{user_name}' and all associated data permanently deleted from MongoDB Atlas.",
        "deleted_predictions": pred_result.deleted_count,
        "deleted_farms": farm_result.deleted_count
    }

