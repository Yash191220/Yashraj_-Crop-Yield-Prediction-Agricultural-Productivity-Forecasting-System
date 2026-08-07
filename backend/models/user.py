from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str = Field(..., example="John Farmer")
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., min_length=6)
    role: str = Field(default="farmer", example="farmer") # farmer, agronomist, admin
    region: Optional[str] = Field(default="North Region")
    admin_secret_key: Optional[str] = Field(default=None)  # Required only if role=admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None  # Optional: used for role-lock enforcement

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = "farmer"
    google_id: Optional[str] = None
    picture: Optional[str] = None

class UserUpdate(BaseModel):
    """UPDATE - fields a user can change on their profile"""
    name: Optional[str] = None
    region: Optional[str] = None

class UserResponse(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    role: str
    region: Optional[str] = None
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
