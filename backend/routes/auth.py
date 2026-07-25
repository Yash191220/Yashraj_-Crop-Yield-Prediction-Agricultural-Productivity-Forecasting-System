from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import UserRegister, UserLogin, TokenResponse, UserResponse
import jwt
import bcrypt
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/api/auth", tags=["Authentication & Role-Based Access"])
security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET", "yieldsense_secret_key_2026_super_secure")
ALGORITHM = "HS256"

# In-memory user database with seed accounts
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
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None or email not in USER_DB:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token identity")
        return USER_DB[email]
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate token")

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
    if user.email in USER_DB:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_record = {
        "id": f"usr_{len(USER_DB) + 1}",
        "name": user.name,
        "email": user.email,
        "role": user.role if user.role in ["farmer", "agronomist", "researcher", "admin"] else "farmer",
        "region": user.region or "North Region",
        "password_hash": hash_pwd(user.password),
        "created_at": datetime.utcnow()
    }
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
    return {"access_token": token, "token_type": "bearer", "user": user_resp}

@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin):
    user_record = USER_DB.get(credentials.email)
    if not user_record or not verify_pwd(credentials.password, user_record["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = create_access_token({"sub": user_record["email"], "role": user_record["role"]})
    user_resp = UserResponse(
        id=user_record["id"],
        name=user_record["name"],
        email=user_record["email"],
        role=user_record["role"],
        region=user_record["region"],
        created_at=user_record["created_at"]
    )
    return {"access_token": token, "token_type": "bearer", "user": user_resp}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        region=current_user["region"],
        created_at=current_user["created_at"]
    )
