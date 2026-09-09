from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.common import ResponseEnvelope
from app.services.node_service import NodeService

router = APIRouter()


@router.get("/markers", response_model=ResponseEnvelope[List[dict]])
async def get_map_markers(db: AsyncSession = Depends(get_db)):
    """Retrieve spatial marker locations, risk categories, and popup data for GIS Map."""
    service = NodeService(db)
    nodes = await service.get_all_nodes()
    
    markers = []
    for n in nodes:
        markers.append({
            "node_id": n.node_id,
            "name": n.name,
            "type": n.disaster_type,
            "latitude": n.latitude,
            "longitude": n.longitude,
            "status": n.status,
            "health_score": n.health_score,
            "marker_color": "#2563EB" if n.disaster_type == "flood" else ("#EF4444" if n.disaster_type == "fire" else "#F59E0B"),
            "popup": {
                "address": n.location_address,
                "battery": n.battery_level,
                "last_ping": n.last_ping.isoformat() if n.last_ping else None,
            }
        })

    return ResponseEnvelope(data=markers)
