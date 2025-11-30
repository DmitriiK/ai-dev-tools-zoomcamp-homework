from passlib.context import CryptContext
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def check_session_password(password: Optional[str], password_hash: Optional[str]) -> bool:
    """Check if the provided password matches the session's password hash."""
    if password_hash is None:
        return True  # No password required
    if password is None:
        return False  # Password required but not provided
    return verify_password(password, password_hash)
