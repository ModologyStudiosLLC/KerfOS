"""Password hashing and JWT signing shared by both auth modules.

The JWT secret is mandatory. There is deliberately no fallback value: a
default secret in a public repository lets anyone mint valid tokens for any
account.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

JWT_ALGORITHM = "HS256"  # pinned; never read the algorithm from config
MIN_SECRET_LENGTH = 32


def _load_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET", "")
    if len(secret) < MIN_SECRET_LENGTH:
        raise RuntimeError(
            "JWT_SECRET must be set to a random string of at least "
            f"{MIN_SECRET_LENGTH} characters. Generate one with: "
            'python -c "import secrets; print(secrets.token_urlsafe(48))"'
        )
    return secret


JWT_SECRET = _load_jwt_secret()


def hash_password(password: str) -> str:
    # bcrypt only uses the first 72 bytes; bcrypt>=5 raises instead of
    # silently truncating, so truncate explicitly to keep behaviour stable.
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
    except ValueError:
        # malformed stored hash
        return False


def encode_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
