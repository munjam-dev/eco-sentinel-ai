from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.node import SensorNode
from app.schemas.node import NodeCreate, NodeUpdate
from app.repositories.node_repo import NodeRepository
from app.core.exceptions import NodeNotFoundException


class NodeService:
    def __init__(self, db: AsyncSession):
        self.node_repo = NodeRepository(db)

    async def register_node(self, node_in: NodeCreate) -> SensorNode:
        existing = await self.node_repo.get_by_node_id(node_in.node_id)
        if existing:
            return existing

        node_obj = SensorNode(
            node_id=node_in.node_id,
            name=node_in.name,
            disaster_type=node_in.disaster_type,
            latitude=node_in.latitude,
            longitude=node_in.longitude,
            location_address=node_in.location_address,
            zone=node_in.zone,
            transport_protocol=node_in.transport_protocol,
            firmware_version=node_in.firmware_version or "v1.2.0"
        )
        return await self.node_repo.create(node_obj)

    async def get_node_by_id(self, node_id: str) -> SensorNode:
        node = await self.node_repo.get_by_node_id(node_id)
        if not node:
            raise NodeNotFoundException(node_id)
        return node

    async def get_all_nodes(self, skip: int = 0, limit: int = 100) -> List[SensorNode]:
        return await self.node_repo.get_all(skip=skip, limit=limit)

    async def update_node(self, node_id: str, node_in: NodeUpdate) -> SensorNode:
        node = await self.get_node_by_id(node_id)
        return await self.node_repo.update(node, node_in.model_dump(exclude_unset=True))
