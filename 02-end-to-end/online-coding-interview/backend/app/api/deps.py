from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.session import SessionService

# Type alias for database dependency
DBSession = Annotated[AsyncSession, Depends(get_db)]


def get_session_service(db: DBSession) -> SessionService:
    """Get session service instance."""
    return SessionService(db)


SessionServiceDep = Annotated[SessionService, Depends(get_session_service)]
