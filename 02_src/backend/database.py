"""
database.py  —  AgroMind PostgreSQL models
==========================================

Tables:
  users            — registered accounts
  diagnoses        — every scan (full result saved as JSON columns)
  products         — 114 products from Excel  (seeded by seed_db.py)
  diseases         — 20 disease names         (seeded by seed_db.py)
  disease_products — 201 disease→product rows (seeded by seed_db.py)
                     THIS is the join table that replaces the
                     DISEASE_PRODUCTS dict that was hard-coded in query.py
"""

import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import (
    Float, create_engine, Column, String, Text,
    DateTime, ForeignKey, Boolean, JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/agromind"
)

engine       = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base         = declarative_base()


# ─────────────────────────────────────────────────────────────────────────────
#  MODELS
# ─────────────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id               = Column(String,  primary_key=True)
    email            = Column(String,  unique=True, nullable=False, index=True)
    hashed_password  = Column(String,  nullable=False)
    full_name        = Column(String,  nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
    is_active        = Column(Boolean, default=True)

    diagnoses        = relationship("Diagnosis", back_populates="user",
                                    cascade="all, delete-orphan")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id           = Column(String,  primary_key=True)
    user_id      = Column(String,  ForeignKey("users.id"), nullable=True, index=True)
    created_at   = Column(DateTime, default=datetime.utcnow, index=True)

    # GPT vision output
    crop         = Column(String, nullable=True)
    disease_name = Column(String, nullable=True)
    growth_stage = Column(String, nullable=True)
    confidence   = Column(String, nullable=True)
    disease_type = Column(String, nullable=True)
    spread_rate  = Column(String, nullable=True)
    severity     = Column(String, nullable=True)
    symptoms     = Column(JSON,   nullable=True)
    explanation  = Column(Text,   nullable=True)

    # RAG + GPT treatment output
    status       = Column(String, nullable=True)
    pathogen     = Column(String, nullable=True)
    summary      = Column(Text,   nullable=True)
    treatment    = Column(JSON,   nullable=True)
    prevention   = Column(JSON,   nullable=True)
    recommended_products = Column(JSON, nullable=True)

    user         = relationship("User", back_populates="diagnoses")


class Product(Base):
    """114 products from the Excel catalog."""
    __tablename__ = "products"

    product_id   = Column(String, primary_key=True)   # e.g. PN0002
    name         = Column(String, nullable=False)
    product_type = Column(String, nullable=True)
    crops        = Column(Text,   nullable=True)
    ingredients  = Column(Text,   nullable=True)
    usage        = Column(Text,   nullable=True)
    dilution     = Column(String, nullable=True)
    spec         = Column(String, nullable=True)
    price        = Column(Float, nullable=True) 

    disease_links = relationship("DiseaseProduct", back_populates="product")


class Disease(Base):
    """
    20 unique disease / pest names from the mapping CSV.
    One row per disease — normalised so you can add metadata later
    (e.g. pathogen, severity_default, description).
    """
    __tablename__ = "diseases"

    id           = Column(String, primary_key=True)   # slug, e.g. "downy-mildew"
    name         = Column(String, unique=True, nullable=False)  # "downy mildew"
    pathogen     = Column(String, nullable=True)
    description  = Column(Text,   nullable=True)

    product_links = relationship("DiseaseProduct", back_populates="disease")


class DiseaseProduct(Base):
    """
    Join table — 201 rows from disease_product_map.csv.
    Answers: "which products treat this disease?"

    This replaces the hard-coded DISEASE_PRODUCTS dictionary
    that was in query.py.
    """
    __tablename__ = "disease_products"

    disease_id   = Column(String, ForeignKey("diseases.id"),     primary_key=True)
    product_id   = Column(String, ForeignKey("products.product_id"), primary_key=True)

    # Composite PK prevents duplicate rows on re-seed
    __table_args__ = (
        UniqueConstraint("disease_id", "product_id", name="uq_disease_product"),
    )

    disease  = relationship("Disease", back_populates="product_links")
    product  = relationship("Product", back_populates="disease_links")


# ─────────────────────────────────────────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def get_db():
    """FastAPI dependency — yields a session, closes after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables (safe — skips existing)."""
    Base.metadata.create_all(bind=engine)
