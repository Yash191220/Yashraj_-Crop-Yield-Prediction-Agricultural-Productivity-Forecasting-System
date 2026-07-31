from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str = Field(..., example="John Farmer")
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., min_length=6)
    role: str = Field(default="farmer", example="farmer") # farmer, agronomist, admin, cooperative
    region: Optional[str] = Field(default="North Region")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = "farmer"
    google_id: Optional[str] = None
    picture: Optional[str] = None

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
