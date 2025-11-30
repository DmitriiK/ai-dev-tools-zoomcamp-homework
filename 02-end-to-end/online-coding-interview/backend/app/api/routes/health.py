from datetime import datetime
from fastapi import APIRouter
from app.schemas.session import HealthCheck
from app.core.config import settings
from app.core.redis import get_redis
from app.core.database import engine

router = APIRouter(tags=["System"])


@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Check health status of the API and its dependencies."""
    services = {}
    
    # Check database
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        services["database"] = "healthy"
    except Exception:
        services["database"] = "unhealthy"
    
    # Check Redis
    try:
        redis = await get_redis()
        await redis.ping()
        services["redis"] = "healthy"
    except Exception:
        services["redis"] = "unhealthy"
    
    # Determine overall status
    all_healthy = all(s == "healthy" for s in services.values())
    status = "healthy" if all_healthy else "degraded"
    
    return HealthCheck(
        status=status,
        version=settings.APP_VERSION,
        timestamp=datetime.utcnow(),
        services=services,
    )
