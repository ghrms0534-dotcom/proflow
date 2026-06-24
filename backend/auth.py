import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone

SECRET_KEY = b"proflow_secret_key_do_not_use_in_prod"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()
    return f"pbkdf2_sha256${salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    _, salt, digest = password_hash.split("$", 2)
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()
    return hmac.compare_digest(check, digest)


def create_access_token(data: dict) -> str:
    payload = {**data, "exp": (datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()}
    body = _b64(json.dumps(payload, separators=(",", ":")).encode())
    sig = _sign(body)
    return f"{body}.{sig}"


def decode_access_token(token: str) -> dict | None:
    try:
        body, sig = token.split(".", 1)
        if not hmac.compare_digest(_sign(body), sig):
            return None
        payload = json.loads(base64.urlsafe_b64decode(_pad(body)))
        if payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
            return None
        return payload
    except Exception:
        return None


def _sign(body: str) -> str:
    return _b64(hmac.new(SECRET_KEY, body.encode(), hashlib.sha256).digest())


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _pad(value: str) -> bytes:
    return (value + "=" * (-len(value) % 4)).encode()
