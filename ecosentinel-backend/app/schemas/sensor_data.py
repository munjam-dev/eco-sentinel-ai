from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SensorDataIngest(BaseModel):
    node_id: str = Field(..., description="ESP32 hardware node identifier")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)

    # Core sensor metrics
    water_level: Optional[float] = Field(default=None, description="Water depth in meters")
    rain_rate: Optional[float] = Field(default=None, description="Rain intensity mm/hr")
    temperature: Optional[float] = Field(default=None, description="Ambient temperature °C")
    humidity: Optional[float] = Field(default=None, description="Relative humidity %")
    mq2_smoke: Optional[float] = Field(default=None, description="Combustion gas PPM")
    mq135_air_quality: Optional[float] = Field(default=None, description="Gas quality index PPM")
    flame_detected: Optional[float] = Field(default=0.0, description="Flame IR sensor binary 0/1")

    # Extended telemetry
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co2_level: Optional[float] = None

    # Transmission diagnostic metrics
    battery_level: Optional[float] = 100.0
    rssi: Optional[int] = -65
    protocol: Optional[str] = "wifi" # wifi, lora


class SensorDataResponse(SensorDataIngest):
    id: str
    calculated_risk_score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
