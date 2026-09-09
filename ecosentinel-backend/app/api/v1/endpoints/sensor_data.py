from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.sensor_data import SensorDataIngest, SensorDataResponse
from app.schemas.common import ResponseEnvelope
from app.services.sensor_service import SensorService

router = APIRouter()


@router.post("/ingest", response_model=ResponseEnvelope[SensorDataResponse])
async def ingest_sensor_data(payload: SensorDataIngest, db: AsyncSession = Depends(get_db)):
    """Ingest live ESP32 telemetry, run AI inference, update node health, and trigger WebSocket broadcasts."""
    service = SensorService(db)
    saved = await service.ingest_telemetry(payload)
    return ResponseEnvelope(
        message="Telemetry ingested and processed by AI engine",
        data=SensorDataResponse.model_validate(saved)
    )
