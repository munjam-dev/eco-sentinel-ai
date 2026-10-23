from typing import Optional, Union
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field, model_validator


class SensorDataIngest(BaseModel):
    node_id: str = Field(..., alias="nodeId", description="ESP32 hardware node identifier")
    timestamp: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Node metadata
    type: Optional[str] = Field(default=None, description="Disaster type: FLOOD, FIRE, AIR")
    risk: Optional[str] = Field(default=None, description="Edge-computed advisory risk level")
    firmware_version: Optional[str] = Field(default=None, alias="firmwareVersion")
    protocol: Optional[str] = "wifi"  # wifi, lora

    # Core sensor metrics
    water_level: Optional[float] = Field(default=None, alias="waterLevel", description="Water level above configured baseline, cm")
    rain: Optional[Union[bool, float]] = None
    rain_rate: Optional[float] = Field(default=None, alias="rainRate", description="Calibrated rain intensity mm/hr, if available")
    rain_raw: Optional[int] = Field(default=None, alias="rainRaw")
    temperature: Optional[float] = Field(default=None, description="Ambient temperature °C")
    humidity: Optional[float] = Field(default=None, description="Relative humidity %")
    water_sensor_valid: Optional[bool] = Field(default=None, alias="waterSensorValid")
    climate_sensor_valid: Optional[bool] = Field(default=None, alias="climateSensorValid")

    # Gas / air metrics. mq2 is reserved for a calibrated concentration only.
    mq2_smoke: Optional[float] = Field(default=None, alias="mq2", description="Calibrated MQ-2 concentration only; do not send ADC counts here")
    mq2_raw: Optional[int] = Field(default=None, alias="mq2Raw", description="Raw MQ-2 ADC count; not ppm")
    mq2_digital_alarm: Optional[bool] = Field(default=None, alias="mq2DigitalAlarm")
    mq2_units: Optional[str] = Field(default=None, alias="mq2Units")
    mq135_air_quality: Optional[float] = Field(default=None, alias="mq135")
    flame_detected: Optional[float] = Field(default=0.0, alias="flame", description="Flame sensor state 0/1")

    # Extended telemetry
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co2_level: Optional[float] = Field(default=None, alias="co2")

    # Transmission diagnostics
    battery_level: Optional[float] = Field(default=100.0, alias="battery")
    rssi: Optional[int] = Field(default=-65, alias="signal")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data):
        if isinstance(data, dict):
            data = dict(data)
            # Legacy firmware sends a Boolean rain flag. Preserve the flag and
            # derive a rough presence indicator only; this is not mm/hour.
            if isinstance(data.get("rain"), bool):
                data.setdefault("rain_rate", 25.0 if data["rain"] else 0.0)
            # Never reinterpret raw MQ-2 ADC counts as concentration.
            if data.get("mq2Units") == "adc_raw" and "mq2" in data:
                data["mq2"] = None
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
