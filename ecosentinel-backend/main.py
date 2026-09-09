import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.database.session import engine, Base
from app.api.v1.router import api_router
from app.websocket.router import router as websocket_router
from app.middleware.rate_limit import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for DB creation & cleanup."""
    setup_logging()
    logger.info("Initializing EcoSentinel AI Backend Engine...")
    
    # Auto-create tables if running in SQLite / dev environment
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema verification complete.")
    except Exception as e:
        logger.warning(f"Database table initialization notice: {e}")

    yield

    logger.info("Shutting down EcoSentinel AI Backend Engine...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-powered Environmental Disaster Monitoring Platform API",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware, max_requests=200, window_seconds=60)

# Register REST API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Register Realtime WebSocket Router
app.include_router(websocket_router, prefix="")


@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": f"{settings.API_V1_STR}/docs",
        "websocket_endpoint": "/ws/live",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
