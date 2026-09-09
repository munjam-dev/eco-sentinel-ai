from fastapi import APIRouter
from app.schemas.common import ResponseEnvelope

router = APIRouter()


@router.get("", response_model=ResponseEnvelope[dict])
async def get_system_settings():
    """Retrieve platform configuration thresholds and notification parameters."""
    return ResponseEnvelope(data={
        "thresholds": {
            "temperature_critical": 45.0,
            "water_critical": 5.0,
            "pm25_critical": 150.0,
        },
        "notifications": {
            "slack_webhook": "configured",
            "sms_emergency": "active",
        },
        "ai_model": {
            "active_version": "v2.4-ensemble",
            "explainability": "SHAP TreeExplainer Enabled",
        }
    })
