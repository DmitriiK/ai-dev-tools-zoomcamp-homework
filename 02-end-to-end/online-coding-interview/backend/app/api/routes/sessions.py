from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, status
from app.api.deps import SessionServiceDep
from app.schemas.session import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    ErrorResponse,
)
from app.services.session import get_share_url
from app.core.security import check_session_password

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse},
        422: {"description": "Validation Error"},
    },
)
async def create_session(
    request: Request,
    data: SessionCreate,
    service: SessionServiceDep,
):
    """Create a new coding interview session."""
    base_url = str(request.base_url).rstrip("/")
    session = await service.create(data, base_url)
    
    return SessionResponse(
        id=session.id,
        title=session.title,
        language=session.language,
        code=session.code,
        created_at=session.created_at,
        expires_at=session.expires_at,
        is_protected=session.is_protected,
        is_active=session.is_active,
        share_url=get_share_url(session.id, base_url),
    )


@router.get(
    "/{session_id}",
    response_model=SessionResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        410: {"model": ErrorResponse},
    },
)
async def get_session(
    request: Request,
    session_id: UUID,
    service: SessionServiceDep,
    password: Optional[str] = None,
):
    """Get session details by ID."""
    session = await service.get_by_id(session_id)
    
    if session is None or not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    
    if session.is_expired:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Session has expired",
        )
    
    if not check_session_password(password, session.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password required for this session" if password is None else "Incorrect password",
        )
    
    base_url = str(request.base_url).rstrip("/")
    
    return SessionResponse(
        id=session.id,
        title=session.title,
        language=session.language,
        code=session.code,
        created_at=session.created_at,
        expires_at=session.expires_at,
        is_protected=session.is_protected,
        is_active=session.is_active,
        share_url=get_share_url(session.id, base_url),
    )


@router.patch(
    "/{session_id}",
    response_model=SessionResponse,
    responses={
        404: {"model": ErrorResponse},
        422: {"description": "Validation Error"},
    },
)
async def update_session(
    request: Request,
    session_id: UUID,
    data: SessionUpdate,
    service: SessionServiceDep,
):
    """Update session details."""
    session = await service.get_by_id(session_id)
    
    if session is None or not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    
    session = await service.update(session, data)
    base_url = str(request.base_url).rstrip("/")
    
    return SessionResponse(
        id=session.id,
        title=session.title,
        language=session.language,
        code=session.code,
        created_at=session.created_at,
        expires_at=session.expires_at,
        is_protected=session.is_protected,
        is_active=session.is_active,
        share_url=get_share_url(session.id, base_url),
    )


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        404: {"model": ErrorResponse},
    },
)
async def delete_session(
    session_id: UUID,
    service: SessionServiceDep,
):
    """Delete a session."""
    session = await service.get_by_id(session_id)
    
    if session is None or not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    
    await service.delete(session)
