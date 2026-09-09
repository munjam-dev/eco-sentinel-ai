from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.alert import AlertResponse, AlertAcknowledge
from app.schemas.common import ResponseEnvelope
from app.services.alert_engine import AlertEngine

router = APIRouter()


@router.get("", response_model=ResponseEnvelope[List[AlertResponse]])
async def get_active_alerts(db: AsyncSession = Depends(get_db)):
    """Retrieve all active and acknowledged alerts."""
    engine = AlertEngine(db)
    alerts = await engine.get_active_alerts()
    return ResponseEnvelope(data=[AlertResponse.model_validate(a) for a in alerts])


@router.post("/{alert_id}/acknowledge", response_model=ResponseEnvelope[AlertResponse])
async def acknowledge_alert(
    alert_id: str,
    payload: AlertAcknowledge,
    db: AsyncSession = Depends(get_db)
):
    """Acknowledge an active emergency alert."""
    engine = AlertEngine(db)
    updated = await engine.acknowledge_alert(alert_id, payload.acknowledged_by)
    if not updated:
        raise HTTPException(status_code=404, detail="Alert not found")
    return ResponseEnvelope(message="Alert acknowledged", data=AlertResponse.model_validate(updated))
