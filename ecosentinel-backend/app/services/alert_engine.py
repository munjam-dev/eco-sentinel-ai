import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import Alert
from app.repositories.alert_repo import AlertRepository
from app.websocket.manager import ws_manager


class AlertEngine:
    """Classifies risk telemetry into severity levels and manages alert lifecycle."""

    def __init__(self, db: AsyncSession):
        self.alert_repo = AlertRepository(db)

    async def process_risk_assessment(
        self,
        node_id: str,
        hazard_type: str,
        risk_score: float,
        explanation: str
    ) -> Optional[Alert]:
        """Automatically classify risk scores and trigger alerts when threshold is breached."""
        severity = None
        if risk_score >= 80.0:
            severity = "CRITICAL"
        elif risk_score >= 60.0:
            severity = "HIGH"
        elif risk_score >= 40.0:
            severity = "WARNING"
        else:
            return None # Low risk, no alert required

        alert_title = f"{severity} {hazard_type.upper()} Hazard Detected"
        alert_msg = f"{explanation} Risk Score: {risk_score:.1f}/100."

        # Keep one open alert per node and hazard to prevent a new alert each
        # telemetry interval. Escalation updates the existing alert record.
        existing = await self.alert_repo.get_open_for_node_type(node_id, hazard_type)
        if existing:
            rank = {"INFO": 0, "WARNING": 1, "HIGH": 2, "CRITICAL": 3}
            old_severity = existing.severity
            update_fields: Dict[str, Any] = {"message": alert_msg, "title": alert_title}
            if rank.get(severity, 0) > rank.get(old_severity, 0):
                update_fields["severity"] = severity
                update_fields["status"] = "active"
            updated = await self.alert_repo.update(existing, update_fields)
            if old_severity != updated.severity:
                await ws_manager.broadcast("alert_broadcast", {
                    "id": updated.id,
                    "alert_id": updated.alert_id,
                    "node_id": updated.node_id,
                    "title": updated.title,
                    "message": updated.message,
                    "severity": updated.severity,
                    "type": updated.type,
                    "status": updated.status,
                    "timestamp": updated.timestamp.isoformat(),
                    "escalated": True,
                })
            return updated

        alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
        alert_obj = Alert(
            alert_id=alert_id,
            node_id=node_id,
            title=alert_title,
            message=alert_msg,
            severity=severity,
            type=hazard_type,
            status="active",
            timestamp=datetime.now(timezone.utc)
        )

        saved = await self.alert_repo.create(alert_obj)

        # Real-time WebSocket Broadcast to Dashboard
        await ws_manager.broadcast("alert_broadcast", {
            "id": saved.id,
            "alert_id": saved.alert_id,
            "node_id": saved.node_id,
            "title": saved.title,
            "message": saved.message,
            "severity": saved.severity,
            "type": saved.type,
            "status": saved.status,
            "timestamp": saved.timestamp.isoformat(),
        })

        return saved

    async def acknowledge_alert(self, alert_id: str, operator_name: str = "Operator") -> Optional[Alert]:
        alert = await self.alert_repo.get_by_alert_id(alert_id)
        if not alert:
            return None

        update_dict = {
            "status": "acknowledged",
            "acknowledged_at": datetime.now(timezone.utc),
            "acknowledged_by": operator_name,
        }
        updated = await self.alert_repo.update(alert, update_dict)
        
        # Broadcast update
        await ws_manager.broadcast("alert_status_change", {
            "alert_id": alert_id,
            "status": "acknowledged",
            "acknowledged_by": operator_name,
        })
        return updated

    async def get_active_alerts(self) -> List[Alert]:
        return await self.alert_repo.get_active_alerts()
