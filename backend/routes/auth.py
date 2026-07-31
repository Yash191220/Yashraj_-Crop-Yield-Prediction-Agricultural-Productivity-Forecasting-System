from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import UserRegister, UserLogin, GoogleAuthRequest, TokenResponse, UserResponse
from database.db import get_database
import jwt
import bcrypt
from datetime import datetime, timedelta
import os
import httpx
import urllib.parse

router = APIRouter(prefix="/api/auth", tags=["Authentication & Role-Based Access"])
security = HTTPBearer(auto_error=False)

SECRET_KEY = os.getenv("JWT_SECRET", "yieldsense_secret_key_2026_super_secure")
ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

def hash_pwd(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_pwd(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

USER_DB = {
    "farmer@yieldsense.ai": {
        "id": "usr_farmer_1",
        "name": "Rajesh Kumar (Farmer)",
        "email": "farmer@yieldsense.ai",
        "role": "farmer",
        "region": "North Region",
        "password_hash": hash_pwd("farmer123"),
        "created_at": datetime.utcnow()
    },
    "agronomist@yieldsense.ai": {
        "id": "usr_agro_1",
        "name": "Dr. Sarah Jenkins (Agronomist)",
        "email": "agronomist@yieldsense.ai",
        "role": "agronomist",
        "region": "Central Region",
        "password_hash": hash_pwd("agro123"),
        "created_at": datetime.utcnow()
    },
    "admin@yieldsense.ai": {
        "id": "usr_admin_1",
        "name": "System Administrator",
        "email": "admin@yieldsense.ai",
        "role": "admin",
        "region": "All Regions",
        "password_hash": hash_pwd("admin123"),
        "created_at": datetime.utcnow()
    }
}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in."
        )
        
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        # Check MongoDB first
        db = get_database()
        if db is not None:
            db_user = db.users.find_one({"email": email})
            if db_user:
                return db_user
                
        if email in USER_DB:
            return USER_DB[email]
            
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired or invalid")

def require_roles(allowed_roles: list[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles and user["role"] != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user['role']}' is not authorized to access this resource. Required: {allowed_roles}"
            )
        return user
    return role_checker

@router.post("/register", response_model=TokenResponse)
def register_user(user: UserRegister):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="MongoDB Atlas Database connection unavailable")

    existing = db.users.find_one({"email": user.email})
    if existing or user.email in USER_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_record = {
        "id": f"usr_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "name": user.name,
        "email": user.email,
        "role": user.role if user.role in ["farmer", "agronomist", "researcher", "admin"] else "farmer",
        "region": user.region or "North Region",
        "password_hash": hash_pwd(user.password),
        "created_at": datetime.utcnow()
    }
    
    # Strictly Save to MongoDB Atlas
    try:
        res = db.users.insert_one(user_record.copy())
        print(f"✅ User {user.email} saved to MongoDB Atlas yieldsense_ai.users collection. Inserted ID: {res.inserted_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save user to MongoDB Atlas: {str(e)}")
            
    USER_DB[user.email] = user_record
    
    token = create_access_token({"sub": user.email, "role": user_record["role"]})
    user_resp = UserResponse(
        id=user_record["id"],
        name=user_record["name"],
        email=user_record["email"],
        role=user_record["role"],
        region=user_record["region"],
        created_at=user_record["created_at"]
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin):
    db = get_database()
    user = None
    
    # Search MongoDB Atlas first
    if db is not None:
        user = db.users.find_one({"email": credentials.email})
        
    if not user and credentials.email in USER_DB:
        user = USER_DB[credentials.email]
        
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_pwd(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["email"], "role": user["role"]})
    user_resp = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        region=user["region"],
        created_at=user["created_at"]
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        region=current_user["region"],
        created_at=current_user["created_at"]
    )

@router.post("/google", response_model=TokenResponse)
def google_auth(request: GoogleAuthRequest):
    db = get_database()
    if db is None:
        raise HTTPException(status_code=500, detail="MongoDB Atlas Database connection unavailable")

    user_role = request.role if request.role in ["farmer", "admin"] else "farmer"
    user_record = db.users.find_one({"email": request.email})

    if not user_record:
        user_record = {
            "id": f"usr_g_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "name": request.name,
            "email": request.email,
            "role": user_role,
            "region": "North Region",
            "auth_provider": "google",
            "google_id": request.google_id or f"google_{request.email}",
            "picture": request.picture or "",
            "password_hash": None,
            "created_at": datetime.utcnow()
        }
        try:
            db.users.insert_one(user_record.copy())
            print(f"✅ Google User {request.email} saved to MongoDB Atlas yieldsense_ai.users collection.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save Google user to MongoDB Atlas: {str(e)}")
        USER_DB[request.email] = user_record

    token = create_access_token({"sub": user_record["email"], "role": user_record["role"]})
    user_resp = UserResponse(
        id=user_record["id"],
        name=user_record["name"],
        email=user_record["email"],
        role=user_record["role"],
        region=user_record.get("region", "North Region"),
        created_at=user_record.get("created_at", datetime.utcnow())
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

# ───────────────────────────────────────────────────────────────
# REAL GOOGLE OAUTH 2.0 FLOW (Backend Redirect)
# ───────────────────────────────────────────────────────────────

@router.get("/google/url")
def get_google_auth_url(role: str = "farmer"):
    """Returns the real Google OAuth 2.0 authorization URL."""
    if not GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID == "YOUR_GOOGLE_CLIENT_ID_HERE":
        raise HTTPException(
            status_code=503,
            detail="Google OAuth not configured. Add GOOGLE_CLIENT_ID to backend/.env"
        )
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent select_account",
        "state": role  # pass role through state param
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return {"url": url}


@router.get("/google/callback")
async def google_callback(code: str = None, state: str = "farmer", error: str = None):
    """Google sends the user back here after they choose their account and allow access."""
    if error:
        return RedirectResponse(f"http://localhost:5173?google_error={error}")
    if not code:
        return RedirectResponse("http://localhost:5173?google_error=no_code")

    # Exchange auth code for tokens
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
        )

    if token_resp.status_code != 200:
        return RedirectResponse("http://localhost:5173?google_error=token_exchange_failed")

    token_data = token_resp.json()
    id_token = token_data.get("id_token", "")

    # Decode Google JWT id_token to get user info (no verification needed here, Google validated it)
    import base64, json as _json
    try:
        parts = id_token.split('.')
        padded = parts[1] + '=' * (4 - len(parts[1]) % 4)
        payload = _json.loads(base64.urlsafe_b64decode(padded))
        google_email = payload.get("email", "")
        google_name = payload.get("name", google_email.split("@")[0])
        google_sub = payload.get("sub", "")
        google_picture = payload.get("picture", "")
    except Exception:
        return RedirectResponse("http://localhost:5173?google_error=invalid_id_token")

    # Save or find user in MongoDB Atlas
    db = get_database()
    if db is None:
        return RedirectResponse("http://localhost:5173?google_error=db_unavailable")

    user_role = state if state in ["farmer", "admin"] else "farmer"
    user_record = db.users.find_one({"email": google_email})

    if not user_record:
        user_record = {
            "id": f"usr_g_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            "name": google_name,
            "email": google_email,
            "role": user_role,
            "region": "North Region",
            "auth_provider": "google",
            "google_id": google_sub,
            "picture": google_picture,
            "password_hash": None,
            "created_at": datetime.utcnow()
        }
        db.users.insert_one(user_record.copy())
        USER_DB[google_email] = user_record
        print(f"✅ Google OAuth User {google_email} saved to MongoDB Atlas.")

    # Create JWT and redirect frontend with token
    token = create_access_token({"sub": user_record["email"], "role": user_record["role"]})
    redirect_url = f"http://localhost:5173?google_token={token}&google_email={urllib.parse.quote(google_email)}&google_name={urllib.parse.quote(google_name)}&google_role={user_record['role']}"
    return RedirectResponse(redirect_url)
