import sqlite3
from contextlib import closing
from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError

from app import schemas
from app.common import database
from app.core import auth

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def user_payload(user: sqlite3.Row) -> dict:
    return {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = auth.decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token")
    with closing(database.connect()) as db:
        user = db.execute("SELECT * FROM users WHERE id = ?", (payload.get("sub"),)).fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user


@router.post("/login")
async def login(request: Request):
    content_type = request.headers.get("content-type", "").split(";", 1)[0]
    try:
        if content_type == "application/json":
            payload = schemas.LoginRequest.model_validate(await request.json())
        elif content_type == "application/x-www-form-urlencoded":
            form = parse_qs((await request.body()).decode(), keep_blank_values=True)
            payload = schemas.LoginRequest(email=form.get("username", [""])[0], password=form.get("password", [""])[0])
        else:
            raise HTTPException(status_code=415, detail="Use JSON or application/x-www-form-urlencoded")
    except (UnicodeDecodeError, ValueError, ValidationError) as error:
        raise HTTPException(status_code=422, detail="Invalid login payload") from error

    with closing(database.connect()) as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
        if not user or not auth.verify_password(payload.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = auth.create_access_token({"sub": user["id"], "email": user["email"]})
        return {"access_token": token, "token_type": "bearer", "user": user_payload(user)}


@router.post("/register")
def register(payload: schemas.UserCreate):
    with closing(database.connect()) as db:
        if db.execute("SELECT 1 FROM users WHERE email = ?", (payload.email,)).fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        cursor = db.execute(
            "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
            (payload.email, auth.get_password_hash(payload.password), payload.name, payload.role),
        )
        db.commit()
        user = db.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        token = auth.create_access_token({"sub": user["id"], "email": user["email"]})
        return {"access_token": token, "token_type": "bearer", "user": user_payload(user)}
