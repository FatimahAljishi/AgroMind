"""
auth.py  —  User registration, login, JWT tokens.

Endpoints added to main.py:
  POST /auth/register
  POST /auth/login
  GET  /auth/me        (protected)
"""

import os
import uuid
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db, User

load_dotenv()

SECRET_KEY      = os.getenv("SECRET_KEY", "change-this-in-production")
ALGORITHM       = "HS256"
TOKEN_EXPIRE_MIN = 60 * 24   # 24 hours

pwd_context    = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme  = OAuth2PasswordBearer(tokenUrl="/auth/login")
router         = APIRouter(prefix="/auth", tags=["auth"])


# ── schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email:     EmailStr
    password:  str
    full_name: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"


class UserOut(BaseModel):
    id:         str
    email:      str
    full_name:  str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ── helpers ───────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire  = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MIN)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> User:
    """FastAPI dependency — decode JWT and return the User row."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_error
    except JWTError:
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_error
    return user


# ── endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        id              = str(uuid.uuid4()),
        email           = req.email,
        hashed_password = hash_password(req.password),
        full_name       = req.full_name,
    )
    db.add(user)
    db.commit()
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db:   Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
