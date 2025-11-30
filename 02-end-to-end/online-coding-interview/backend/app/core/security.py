from passlib.context import CryptContext
from typing import Optional
import hashlib

# Use argon2 instead of bcrypt for Python 3.13+ compatibility
# Falls back to pbkdf2_sha256 if argon2 is not available
pwd_context = CryptContext(schemes=["argon2", "pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using argon2 or pbkdf2_sha256."""
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
