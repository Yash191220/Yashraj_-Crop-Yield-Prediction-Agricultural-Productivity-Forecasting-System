from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/advisor", tags=["Advisor Portal & Live Support"])

# ── In-Memory Inquiry Store ──────────────────────────────────────────────────
# Stores real-time farmer inquiries
INQUIRIES_DB: Dict[str, Dict[str, Any]] = {}


# ── Pydantic Request Models ──────────────────────────────────────────────────
class CreateInquiryRequest(BaseModel):
    farmer_name: Optional[str] = "Farmer"
    farmer_email: Optional[str] = ""
    farmer_id: Optional[str] = None
    crop: Optional[str] = "Wheat"
    region: Optional[str] = "North Region"
    season: Optional[str] = "Rabi"
    risk_level: Optional[str] = "ALERT"
    risk_score: Optional[float] = 50.0
    content: str = Field(..., min_length=2)

class SendReplyRequest(BaseModel):
    inquiry_id: str
    advisor_name: Optional[str] = "Agricultural Advisor"
    content: str = Field(..., min_length=2)
    mark_resolved: Optional[bool] = False

# ── API Endpoints ────────────────────────────────────────────────────────────

@router.get("/stats")
def get_advisor_stats():
    """Get high-level summary stats for the Advisor Dashboard."""
    total = len(INQUIRIES_DB)
    pending = sum(1 for inq in INQUIRIES_DB.values() if inq["status"] == "pending")
    resolved = sum(1 for inq in INQUIRIES_DB.values() if inq["status"] == "resolved")
    in_progress = total - pending - resolved
    return {
        "total_inquiries": total,
        "pending_queries": pending,
        "resolved_consultations": resolved,
        "active_cases": in_progress
    }

@router.get("/inquiries")
def list_inquiries(status: Optional[str] = None):
    """List all farmer inquiry threads for advisors."""
    items = list(INQUIRIES_DB.values())
    if status and status != "all":
        items = [i for i in items if i["status"] == status]
    # Sort newest updated first
    items.sort(key=lambda x: x["updated_at"], reverse=True)
    return {"inquiries": items, "count": len(items)}

@router.get("/thread/{inquiry_id}")
def get_inquiry_thread(inquiry_id: str):
    """Retrieve full message history of an inquiry thread."""
    if inquiry_id not in INQUIRIES_DB:
        raise HTTPException(status_code=404, detail="Inquiry thread not found")
    return INQUIRIES_DB[inquiry_id]

@router.get("/farmer-thread")
def get_farmer_active_thread(email: Optional[str] = None):
    """Get or find active/most recent thread for a specific farmer by email."""
    if not email:
        return None
    # Exact email match — find most recent thread for this farmer
    farmer_threads = [
        t for t in INQUIRIES_DB.values() 
        if t.get("farmer_email", "").lower() == email.lower()
    ]
    if farmer_threads:
        farmer_threads.sort(key=lambda x: x["updated_at"], reverse=True)
        return farmer_threads[0]
    return None

@router.post("/inquiry")
def submit_farmer_inquiry(payload: CreateInquiryRequest):
    """Farmer posts a query. Connects to existing active thread or opens a new ticket."""
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    # Check if there is an open thread for this farmer
    active_thread = None
    if payload.farmer_email:
        for inq in INQUIRIES_DB.values():
            if inq.get("farmer_email") == payload.farmer_email and inq["status"] in ["pending", "in_progress"]:
                active_thread = inq
                break
            
    if active_thread:
        new_msg = {
            "id": f"msg_{uuid.uuid4().hex[:8]}",
            "sender_role": "farmer",
            "sender_name": payload.farmer_name or "Farmer",
            "content": payload.content,
            "timestamp": now_iso
        }
        active_thread["messages"].append(new_msg)
        active_thread["updated_at"] = now_iso
        active_thread["status"] = "pending"
        if payload.crop: active_thread["crop"] = payload.crop
        if payload.region: active_thread["region"] = payload.region
        if payload.risk_score: active_thread["risk_score"] = payload.risk_score
        if payload.risk_level: active_thread["risk_level"] = payload.risk_level
        return {"status": "success", "inquiry": active_thread, "message_id": new_msg["id"]}
    else:
        new_id = f"inq_{uuid.uuid4().hex[:8]}"
        new_inquiry = {
            "id": new_id,
            "farmer_id": payload.farmer_id or f"usr_{uuid.uuid4().hex[:8]}",
            "farmer_name": payload.farmer_name or "Farmer",
            "farmer_email": payload.farmer_email or "",
            "crop": payload.crop or "Wheat",
            "region": payload.region or "North Region",
            "season": payload.season or "Rabi",
            "risk_level": payload.risk_level or "ALERT",
            "risk_score": payload.risk_score or 50.0,
            "status": "pending",
            "created_at": now_iso,
            "updated_at": now_iso,
            "messages": [
                {
                    "id": f"msg_{uuid.uuid4().hex[:8]}",
                    "sender_role": "farmer",
                    "sender_name": payload.farmer_name or "Farmer",
                    "content": payload.content,
                    "timestamp": now_iso
                }
            ]
        }
        INQUIRIES_DB[new_id] = new_inquiry
        return {"status": "success", "inquiry": new_inquiry, "inquiry_id": new_id}

@router.post("/reply")
def reply_to_inquiry(payload: SendReplyRequest):
    """Advisor posts a response to a farmer inquiry."""
    if payload.inquiry_id not in INQUIRIES_DB:
        raise HTTPException(status_code=404, detail="Inquiry thread not found")
        
    thread = INQUIRIES_DB[payload.inquiry_id]
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    new_msg = {
        "id": f"msg_{uuid.uuid4().hex[:8]}",
        "sender_role": "advisor",
        "sender_name": payload.advisor_name or "Agricultural Advisor",
        "content": payload.content,
        "timestamp": now_iso
    }
    
    thread["messages"].append(new_msg)
    thread["updated_at"] = now_iso
    thread["status"] = "resolved" if payload.mark_resolved else "in_progress"
    
    return {"status": "success", "inquiry": thread, "reply": new_msg}

class UpdateStatusRequest(BaseModel):
    inquiry_id: str
    status: str

@router.post("/status")
def update_inquiry_status(payload: UpdateStatusRequest):
    """Directly update the status of an inquiry thread (e.g. resolved or pending)."""
    if payload.inquiry_id not in INQUIRIES_DB:
        raise HTTPException(status_code=404, detail="Inquiry thread not found")
    thread = INQUIRIES_DB[payload.inquiry_id]
    thread["status"] = payload.status
    thread["updated_at"] = datetime.utcnow().isoformat() + "Z"
    return {"status": "success", "inquiry": thread}

