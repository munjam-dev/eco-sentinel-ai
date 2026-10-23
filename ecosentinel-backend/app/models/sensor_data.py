from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index, Integer, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SensorData(BaseModel):
    __tablename__ = "sensor_data"

    node_id = Column(String(50), ForeignKey("sensor_nodes.node_id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)

    # Core Environmental Sensors
    water_level = Column(Float, nullable=True)       # cm above configured baseline
    rain_rate = Column(Float, nullable=True)         # mm/hr only when calibrated
    temperature = Column(Float, nullable=True)       # °C
    humidity = Column(Float, nullable=True)          # %
    pressure_hpa = Column(Float, nullable=True)      # hPa, BME280
    mq2_smoke = Column(Float, nullable=True)          # calibrated concentration only
    mq135_air_quality = Column(Float, nullable=True)
    flame_detected = Column(Float, nullable=True)   # 0.0 or 1.0
    rain_raw = Column(Integer, nullable=True)
    rain_detected = Column(Boolean, nullable=True)
    water_sensor_valid = Column(Boolean, nullable=True)
    climate_sensor_valid = Column(Boolean, nullable=True)
    mq2_raw = Column(Integer, nullable=True)        # ADC counts, not ppm
    mq2_digital_alarm = Column(Boolean, nullable=True)
    mq2_units = Column(String(24), nullable=True)

    # Power, radio, firmware and optional location diagnostics
    battery_level = Column(Float, nullable=True)
    battery_voltage = Column(Float, nullable=True)
    rssi = Column(Integer, nullable=True)
    protocol = Column(String(16), nullable=True)
    firmware_version = Column(String(32), nullable=True)
    gps_latitude = Column(Float, nullable=True)
    gps_longitude = Column(Float, nullable=True)
    gps_fix_valid = Column(Boolean, nullable=True)
    sequence_number = Column(Integer, nullable=True)

    # Gas / Particulate Extended
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    co2_level = Column(Float, nullable=True)

    # Computed Risk Indicators
    calculated_risk_score = Column(Float, nullable=True)

    node = relationship("SensorNode", back_populates="readings")


Index("idx_sensor_data_node_time", SensorData.node_id, SensorData.timestamp.desc())
