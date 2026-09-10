from typing import Optional, Union
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field, model_validator


class SensorDataIngest(BaseModel):
    node_id: str = Field(..., alias="nodeId", description="ESP32 hardware node identifier")
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Node metadata
    type: Optional[str] = Field(default=None, description="Disaster type: FLOOD, FIRE, AIR")
    risk: Optional[str] = Field(default=None, description="Risk level: LOW, MEDIUM, HIGH, CRITICAL")

    # Core sensor metrics
    water_level: Optional[float] = Field(default=None, alias="waterLevel", description="Water depth / level")
    rain: Optional[Union[bool, float]] = Field(default=None, description="Rain detection flag / value")
    rain_rate: Optional[float] = Field(default=None, alias="rainRate", description="Rain intensity mm/hr")
    temperature: Optional[float] = Field(default=None, description="Ambient temperature °C")
    humidity: Optional[float] = Field(default=None, description="Relative humidity %")
    mq2_smoke: Optional[float] = Field(default=None, alias="mq2", description="Combustion gas / smoke PPM")
    mq135_air_quality: Optional[float] = Field(default=None, alias="mq135", description="Gas quality index PPM")
    flame_detected: Optional[float] = Field(default=0.0, alias="flame", description="Flame IR sensor binary 0/1")

    # Extended telemetry
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co2_level: Optional[float] = Field(default=None, alias="co2")

    # Transmission diagnostic metrics
    battery_level: Optional[float] = Field(default=100.0, alias="battery")
    rssi: Optional[int] = Field(default=-65, alias="signal")
    protocol: Optional[str] = "wifi" # wifi, lora

    model_config = ConfigDict(populate_by_name=True)

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: dict):
        if isinstance(data, dict):
            # Normalize rain boolean to rain_rate / float
            if "rain" in data and isinstance(data["rain"], bool):
                data["rain_rate"] = 25.0 if data["rain"] else 0.0
        return data


class SensorDataResponse(BaseModel):
    id: str
    node_id: str
    timestamp: datetime
    water_level: Optional[float] = None
    rain_rate: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    mq2_smoke: Optional[float] = None
    mq135_air_quality: Optional[float] = None
    flame_detected: Optional[float] = 0.0
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co2_level: Optional[float] = None
    battery_level: Optional[float] = 100.0
    rssi: Optional[int] = -65
    protocol: Optional[str] = "wifi"
    calculated_risk_score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
