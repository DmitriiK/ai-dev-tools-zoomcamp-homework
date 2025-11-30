from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class Language(str, Enum):
    """Supported programming languages."""
    JAVASCRIPT = "javascript"
    PYTHON = "python"
    CSHARP = "csharp"
    GO = "go"
    JAVA = "java"


class SessionCreate(BaseModel):
    """Schema for creating a new session."""
    title: str = Field(..., min_length=1, max_length=255)
    language: Language = Language.JAVASCRIPT
    initial_code: str = Field(default="", max_length=100000)
    expires_in_hours: Optional[int] = Field(default=None, ge=1, le=168)
    password: Optional[str] = Field(default=None, min_length=4, max_length=128)


class SessionUpdate(BaseModel):
    """Schema for updating an existing session."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    language: Optional[Language] = None
    code: Optional[str] = Field(default=None, max_length=100000)


class SessionResponse(BaseModel):
    """Schema for session response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    language: str
    code: str
    created_at: datetime
    expires_at: Optional[datetime]
    is_protected: bool
    is_active: bool
    share_url: str


class SessionInDB(BaseModel):
    """Schema for session stored in database."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    language: str
    code: str
    created_at: datetime
    expires_at: Optional[datetime]
    password_hash: Optional[str]
    is_active: bool


class Participant(BaseModel):
    """Schema for session participant."""
    id: str
    name: str
    color: str = Field(..., pattern=r"^#[0-9A-Fa-f]{6}$")
    cursor_position: Optional[dict] = None
    joined_at: datetime


class ParticipantsResponse(BaseModel):
    """Schema for participants list response."""
    participants: list[Participant]
    count: int


class LanguageInfo(BaseModel):
    """Schema for language information."""
    id: str
    name: str
    version: str
    execution_mode: str = "browser"
    runtime: str
    file_extension: str
    monaco_language: str


class LanguagesResponse(BaseModel):
    """Schema for languages list response."""
    languages: list[LanguageInfo]


class HealthCheck(BaseModel):
    """Schema for health check response."""
    status: str
    version: str
    timestamp: datetime
    services: dict[str, str]


class ErrorResponse(BaseModel):
    """Schema for error response."""
    detail: str
