from uuid import UUID
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.session import Session
from app.schemas.session import SessionCreate, SessionUpdate


class SessionService:
    """Service for managing coding sessions."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, data: SessionCreate, base_url: str) -> Session:
        """Create a new session."""
        expires_at = None
        if data.expires_in_hours:
            expires_at = datetime.utcnow() + timedelta(hours=data.expires_in_hours)
        
        session = Session(
            title=data.title,
            language=data.language.value,
            code=data.initial_code,
            expires_at=expires_at,
        )
        
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session)
        
        return session
    
    async def get_by_id(self, session_id: UUID) -> Optional[Session]:
        """Get session by ID."""
        result = await self.db.execute(
            select(Session).where(Session.id == session_id)
        )
        return result.scalar_one_or_none()
    
    async def update(self, session: Session, data: SessionUpdate) -> Session:
        """Update an existing session."""
        update_data = data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if value is not None:
                if field == "language":
                    setattr(session, field, value.value)
                else:
                    setattr(session, field, value)
        
        await self.db.flush()
        await self.db.refresh(session)
        
        return session
    
    async def delete(self, session: Session) -> None:
        """Delete a session (soft delete)."""
        session.is_active = False
        await self.db.flush()
    
    async def hard_delete(self, session: Session) -> None:
        """Permanently delete a session."""
        await self.db.delete(session)
        await self.db.flush()


def get_share_url(session_id: UUID, base_url: str) -> str:
    """Generate share URL for a session."""
    return f"{base_url}/session/{session_id}"
