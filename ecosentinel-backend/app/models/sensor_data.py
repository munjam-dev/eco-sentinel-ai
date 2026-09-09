from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SensorData(BaseModel):
    __tablename__ = "sensor_data"

    node_id = Column(String(50), ForeignKey("sensor_nodes.node_id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)

    # Core Environmental Sensors
    water_level = Column(Float, nullable=True)     # Meters
    rain_rate = Column(Float, nullable=True)       # mm/hr
    temperature = Column(Float, nullable=True)     # °C
    humidity = Column(Float, nullable=True)        # %
    mq2_smoke = Column(Float, nullable=True)       # PPM
    mq135_air_quality = Column(Float, nullable=True) # AQI index / PPM
    flame_detected = Column(Float, nullable=True)  # 0.0 or 1.0 (binary / intensity)
    
    # Gas / Particulate Extended
    pm25 = Column(Float, nullable=True)            # µg/m³
    pm10 = Column(Float, nullable=True)            # µg/m³
    co2_level = Column(Float, nullable=True)       # PPM

    # Computed Risk Indicators
    calculated_risk_score = Column(Float, nullable=True)

    # Relationship
    node = relationship("SensorNode", back_populates="readings")

Index("idx_sensor_data_node_time", SensorData.node_id, SensorData.timestamp.desc())
