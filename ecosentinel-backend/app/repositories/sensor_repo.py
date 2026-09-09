from typing import List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sensor_data import SensorData
from app.repositories.base import BaseRepository


class SensorDataRepository(BaseRepository[SensorData]):
    def __init__(self, db: AsyncSession):
        super().__init__(SensorData, db)

    async def get_latest_by_node(self, node_id: str) -> Optional[SensorData]:
        query = (
            select(SensorData)
            .where(SensorData.node_id == node_id, SensorData.is_deleted == False)
            .order_by(SensorData.timestamp.desc())
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_history_by_node(
        self, node_id: str, start_time: Optional[datetime] = None, limit: int = 100
    ) -> List[SensorData]:
        query = select(SensorData).where(SensorData.node_id == node_id, SensorData.is_deleted == False)
        if start_time:
            query = query.where(SensorData.timestamp >= start_time)
        query = query.order_by(SensorData.timestamp.desc()).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
