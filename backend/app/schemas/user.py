from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    """User registration request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=255)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePassword123!",
                "name": "John Doe"
            }
        }


class UserLogin(BaseModel):
    """User login request schema."""
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePassword123!"
            }
        }


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """User profile response schema."""
    id: int
    email: str
    name: str
    created_at: datetime
    fortunes_count: int = 0

    class Config:
        from_attributes = True
