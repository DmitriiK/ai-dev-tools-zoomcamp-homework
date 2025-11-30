import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Session(Base):
    """Database model for coding interview sessions."""
    
    __tablename__ = "sessions"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    language: Mapped[str] = mapped_column(String(50), default="javascript")
    code: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    @property
    def is_protected(self) -> bool:
        """Check if session requires a password."""
        return self.password_hash is not None
    
    @property
    def is_expired(self) -> bool:
        """Check if session has expired."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at
