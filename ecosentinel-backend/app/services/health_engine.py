from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.node_health import NodeHealth
from app.repositories.node_repo import NodeRepository


class NodeHealthEngine:
    """Monitors battery levels, packet RSSI, signal degradation, and calibration status."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.node_repo = NodeRepository(db)

    async def evaluate_node_health(self, node_id: str, battery_level: float, rssi: int) -> float:
        node = await self.node_repo.get_by_node_id(node_id)
        if not node:
            return 100.0

        # Calculate Health Score
        battery_score = max(0.0, min(100.0, battery_level))
        signal_score = 100.0 if rssi > -70 else (80.0 if rssi > -85 else 40.0)
        
        overall_health = (battery_score * 0.6) + (signal_score * 0.4)

        status = "online"
        if overall_health < 30.0:
            status = "offline"
        elif overall_health < 60.0:
            status = "warning"

        # Update Node
        await self.node_repo.update(node, {
            "battery_level": battery_level,
            "signal_strength": rssi,
            "health_score": round(overall_health, 1),
            "status": status,
            "last_ping": datetime.now(timezone.utc),
        })

        # Save Health Log Record
        health_log = NodeHealth(
            node_id=node_id,
            battery_health=battery_score,
            health_score=overall_health,
            calibration_needed=bool(battery_level < 15.0),
            timestamp=datetime.now(timezone.utc)
        )
        self.db.add(health_log)
        await self.db.commit()

        return overall_health
