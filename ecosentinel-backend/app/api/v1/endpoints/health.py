from fastapi import APIRouter
from app.schemas.common import ResponseEnvelope

router = APIRouter()


@router.get("", response_model=ResponseEnvelope[dict])
async def health_check():
    """System health check endpoint."""
    return ResponseEnvelope(
        success=True,
        message="EcoSentinel AI Backend operational",
        data={
            "status": "healthy",
            "service": "EcoSentinel AI Platform",
            "version": "1.0.0",
            "database": "connected",
            "websocket": "active",
        }
    )
