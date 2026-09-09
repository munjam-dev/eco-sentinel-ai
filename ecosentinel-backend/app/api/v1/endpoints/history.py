from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.sensor_data import SensorDataResponse
from app.schemas.common import ResponseEnvelope
from app.repositories.sensor_repo import SensorDataRepository

router = APIRouter()


@router.get("/{node_id}", response_model=ResponseEnvelope[List[SensorDataResponse]])
async def get_sensor_history(
    node_id: str,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve historical sensor readings for analysis."""
    repo = SensorDataRepository(db)
    records = await repo.get_history_by_node(node_id, limit=limit)
    return ResponseEnvelope(data=[SensorDataResponse.model_validate(r) for r in records])
