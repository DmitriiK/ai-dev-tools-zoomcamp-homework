from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.core.config import settings
from app.core.database import init_db
from app.core.redis import close_redis
from app.api.routes import sessions, languages, health
from app.sockets import sio


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_redis()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    REST API for the Online Coding Interview Platform.
    
    **Code Execution:**
    For security reasons, all code execution happens client-side in the browser using WebAssembly.
    The server NEVER executes user code.
    
    Supported languages: JavaScript, Python, C#, Go, Java
    """,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router, prefix="/api")
app.include_router(languages.router, prefix="/api")
app.include_router(health.router, prefix="/api")

# Create Socket.IO ASGI app
socket_app = socketio.ASGIApp(
    sio,
    other_asgi_app=app,
    socketio_path="/socket.io",
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }


# Export the socket_app for uvicorn
application = socket_app
