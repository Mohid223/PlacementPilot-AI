from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime

from database import Base


# -----------------------------
# User Table
# -----------------------------

# -----------------------------
# User Table
# -----------------------------

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(20),
        default="student"
    )

    target_role = Column(
        String(100),
        default="Software Engineer"
    )

# -----------------------------
# Student Profile Table
# -----------------------------

# -----------------------------
# Student Profile Table
# -----------------------------

class StudentProfile(Base):

    __tablename__ = "student_profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        unique=True
    )

    phone = Column(
        String(20),
        nullable=True
    )

    location = Column(
        String(150),
        nullable=True
    )

    university = Column(
        String(200),
        nullable=True
    )

    degree = Column(
        String(200),
        nullable=True
    )

    graduation_year = Column(
        String(10),
        nullable=True
    )

    cgpa = Column(
        Float,
        nullable=True
    )

    linkedin = Column(
        String(255),
        nullable=True
    )

    github = Column(
        String(255),
        nullable=True
    )

    portfolio = Column(
        String(255),
        nullable=True
    )

    about = Column(
        Text,
        nullable=True
    )

    skills = Column(
        Text,
        nullable=True
    )

    resume_path = Column(
        String(500),
        nullable=True
    )

    profile_score = Column(
        Float,
        default=0.0
    )

# -----------------------------
# Test Result Table
# -----------------------------

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    test_type = Column(String(50), nullable=False)

    score = Column(Float, default=0.0)

    total_questions = Column(Integer, default=0)

    completed_at = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Interview Result Table
# -----------------------------

class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    interview_type = Column(String(50), nullable=False)

    score = Column(Float, default=0.0)

    feedback = Column(Text, nullable=True)

    completed_at = Column(DateTime, default=datetime.utcnow)