from pydantic import BaseModel, EmailStr
from typing import Optional, List


# -----------------------------
# User Schemas
# -----------------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# -----------------------------
# Student Profile Schemas
# -----------------------------

class ProfileCreate(BaseModel):
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    resume_path: Optional[str] = None
    profile_score: float

    class Config:
        from_attributes = True


# -----------------------------
# Assistant Schemas
# -----------------------------

class AssistantRequest(BaseModel):
    message: str


class AssistantResponse(BaseModel):
    message: str
    response: str
    agent: str


# -----------------------------
# Test Result Schemas
# -----------------------------

class TestResultCreate(BaseModel):
    test_type: str
    score: float
    total_questions: int


class TestResultResponse(BaseModel):
    id: int
    user_id: int
    test_type: str
    score: float
    total_questions: int

    class Config:
        from_attributes = True


# -----------------------------
# Interview Schemas
# -----------------------------

class InterviewRequest(BaseModel):
    interview_type: str


class InterviewResponse(BaseModel):
    interview_type: str
    score: float
    feedback: Optional[str] = None

# =========================================================
# AUTHENTICATION SCHEMAS
# =========================================================

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    target_role: Optional[str] = "Software Engineer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


# =========================================================
# PROFILE UPDATE SCHEMA
# =========================================================

class ProfileUpdateRequest(BaseModel):

    phone: Optional[str] = ""

    location: Optional[str] = ""

    university: Optional[str] = ""

    degree: Optional[str] = ""

    graduation_year: Optional[str] = ""

    cgpa: Optional[float] = None

    github: Optional[str] = ""

    linkedin: Optional[str] = ""

    portfolio: Optional[str] = ""

    target_role: Optional[str] = ""

    about: Optional[str] = ""

    skills: List[str] = []