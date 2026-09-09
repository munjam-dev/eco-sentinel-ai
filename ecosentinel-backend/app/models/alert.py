from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Alert(BaseModel):
    __tablename__ = "alerts"

    alert_id = Column(String(50), unique=True, index=True, nullable=False)
    node_id = Column(String(50), ForeignKey("sensor_nodes.node_id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, index=True) # INFO, WARNING, HIGH, CRITICAL
    type = Column(String(30), nullable=False, index=True)     # flood, fire, pollution
    status = Column(String(20), default="active", nullable=False, index=True) # active, acknowledged, resolved
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by = Column(String(100), nullable=True)

    node = relationship("SensorNode", back_populates="alerts")
