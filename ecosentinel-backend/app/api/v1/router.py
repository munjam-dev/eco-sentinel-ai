from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, nodes, sensor_data, alerts,
    predictions, analytics, history, reports,
    settings, ai, communication, map, system
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health & Status"])
api_router.include_router(nodes.router, prefix="/nodes", tags=["Sensor Nodes"])
api_router.include_router(sensor_data.router, prefix="/sensor-data", tags=["Telemetry Ingestion"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alert Engine"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["AI Predictions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(history.router, prefix="/history", tags=["Historical Data"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Export"])
api_router.include_router(settings.router, prefix="/settings", tags=["System Settings"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI & SHAP Engine"])
api_router.include_router(communication.router, prefix="/communication", tags=["LoRa & Mesh Protocol"])
api_router.include_router(map.router, prefix="/map", tags=["GIS Map Engine"])
api_router.include_router(system.router, prefix="/system", tags=["System Diagnostics"])
