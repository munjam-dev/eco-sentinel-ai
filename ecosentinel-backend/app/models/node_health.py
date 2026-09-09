from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class NodeHealth(BaseModel):
    __tablename__ = "node_health"

    node_id = Column(String(50), ForeignKey("sensor_nodes.node_id", ondelete="CASCADE"), nullable=False, index=True)
    
    battery_health = Column(Float, default=100.0, nullable=False)
    solar_charging_rate = Column(Float, default=0.0, nullable=False)
    sensor_failure_flag = Column(Boolean, default=False, nullable=False)
    calibration_needed = Column(Boolean, default=False, nullable=False)
    health_score = Column(Float, default=100.0, nullable=False)
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)

    node = relationship("SensorNode", back_populates="health_records")
