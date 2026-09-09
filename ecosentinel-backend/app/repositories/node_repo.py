from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.node import SensorNode
from app.repositories.base import BaseRepository


class NodeRepository(BaseRepository[SensorNode]):
    def __init__(self, db: AsyncSession):
        super().__init__(SensorNode, db)

    async def get_by_node_id(self, node_id: str) -> Optional[SensorNode]:
        query = select(SensorNode).where(SensorNode.node_id == node_id, SensorNode.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_active_nodes((self)) -> List[SensorNode]:
        query = select(SensorNode).where(SensorNode.status != "offline", SensorNode.is_deleted == False)
        result = await self.db.execute(query)
        return list(result.scalars().all())
