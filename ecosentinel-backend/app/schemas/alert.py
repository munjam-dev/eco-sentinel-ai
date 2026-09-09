from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AlertBase(BaseModel):
    node_id: str
    title: str
    message: str
    severity: str # INFO, WARNING, HIGH, CRITICAL
    type: str     # flood, fire, pollution


class AlertCreate(AlertBase):
    alert_id: Optional[str] = None


class AlertAcknowledge(BaseModel):
    acknowledged_by: str = "Operator"


class AlertResponse(AlertBase):
    id: str
    alert_id: str
    status: str # active, acknowledged, resolved
    timestamp: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
