from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import Alert
from app.repositories.base import BaseRepository


class AlertRepository(BaseRepository[Alert]):
    def __init__(self, db: AsyncSession):
        super().__init__(Alert, db)

    async def get_active_alerts(self, limit: int = 50) -> List[Alert]:
        query = (
            select(Alert)
            .where(Alert.status.in_(["active", "acknowledged"]), Alert.is_deleted == False)
            .order_by(Alert.timestamp.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_alert_id(self, alert_id: str) -> Optional[Alert]:
        query = select(Alert).where(Alert.alert_id == alert_id, Alert.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalars().first()
