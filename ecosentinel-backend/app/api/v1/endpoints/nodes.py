from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.node import NodeCreate, NodeUpdate, NodeResponse
from app.schemas.common import ResponseEnvelope
from app.services.node_service import NodeService

router = APIRouter()


@router.post("", response_model=ResponseEnvelope[NodeResponse])
async def register_node(node_in: NodeCreate, db: AsyncSession = Depends(get_db)):
    """Register a new ESP32/LoRa sensor node."""
    service = NodeService(db)
    node = await service.register_node(node_in)
    return ResponseEnvelope(data=NodeResponse.model_validate(node))


@router.get("", response_model=ResponseEnvelope[List[NodeResponse]])
async def get_all_nodes(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """Retrieve all registered sensor nodes."""
    service = NodeService(db)
    nodes = await service.get_all_nodes(skip=skip, limit=limit)
    return ResponseEnvelope(data=[NodeResponse.model_validate(n) for n in nodes])


@router.get("/{node_id}", response_model=ResponseEnvelope[NodeResponse])
async def get_node(node_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details for a single sensor node by node_id."""
    service = NodeService(db)
    node = await service.get_node_by_id(node_id)
    return ResponseEnvelope(data=NodeResponse.model_validate(node))


@router.put("/{node_id}", response_model=ResponseEnvelope[NodeResponse])
async def update_node(node_id: str, node_in: NodeUpdate, db: AsyncSession = Depends(get_db)):
    """Update node metadata or operational status."""
    service = NodeService(db)
    updated = await service.update_node(node_id, node_in)
    return ResponseEnvelope(data=NodeResponse.model_validate(updated))
