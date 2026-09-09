from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.prediction import Prediction
from app.repositories.base import BaseRepository


class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self, db: AsyncSession):
        super().__init__(Prediction, db)

    async def get_latest_by_node(self, node_id: str, hazard_type: Optional[str] = None) -> Optional[Prediction]:
        query = select(Prediction).where(Prediction.node_id == node_id, Prediction.is_deleted == False)
        if hazard_type:
            query = query.where(Prediction.hazard_type == hazard_type)
        query = query.order_by(Prediction.timestamp.desc()).limit(1)
        result = await self.db.execute(query)
        return result.scalars().first()
