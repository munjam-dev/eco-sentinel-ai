from sqlalchemy import Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SensorNode(BaseModel):
    __tablename__ = "sensor_nodes"

    node_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    disaster_type = Column(String(30), nullable=False, index=True) # flood, fire, pollution
    status = Column(String(20), default="online", nullable=False, index=True) # online, warning, offline, maintenance
    
    # Geographic location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_address = Column(String(255), nullable=True)
    zone = Column(String(100), nullable=True, index=True)

    # Device & Hardware Telemetry
    battery_level = Column(Float, default=100.0, nullable=False)
    signal_strength = Column(Integer, default=-65, nullable=False) # RSSI dBm
    firmware_version = Column(String(20), default="v1.2.0", nullable=False)
    transport_protocol = Column(String(20), default="wifi", nullable=False) # wifi, lora
    health_score = Column(Float, default=100.0, nullable=False)
    
    last_ping = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    readings = relationship("SensorData", back_populates="node", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="node", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="node", cascade="all, delete-orphan")
    health_records = relationship("NodeHealth", back_populates="node", cascade="all, delete-orphan")
