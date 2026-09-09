from typing import Dict, Any
from fastapi import APIRouter
from app.schemas.common import ResponseEnvelope
from app.ai.pipeline import pipeline_manager

router = APIRouter()


@router.post("/evaluate", response_model=ResponseEnvelope[dict])
async def evaluate_custom_telemetry(payload: Dict[str, Any]):
    """Execute raw AI risk prediction pipeline on ad-hoc telemetry vector."""
    hazard_type = payload.get("hazard_type", "flood")
    res = pipeline_manager.process_telemetry(hazard_type, payload)
    return ResponseEnvelope(data=res)
