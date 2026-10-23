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
    protocol: Optional[str] = "wifi"
    sequence_number: Optional[int] = Field(default=None, alias="sequenceNumber", ge=0)
    boot_id: Optional[str] = Field(default=None, alias="bootId", max_length=24)

    # Core sensor metrics
    water_level: Optional[float] = Field(default=None, alias="waterLevel", description="Water level above configured baseline, cm")
    rain: Optional[Union[bool, float]] = None
    rain_rate: Optional[float] = Field(default=None, alias="rainRate", description="Calibrated rain intensity mm/hr, if available")
    rain_raw: Optional[int] = Field(default=None, alias="rainRaw")
    rain_detected: Optional[bool] = Field(default=None, alias="rainDetected")
    temperature: Optional[float] = Field(default=None, description="Ambient temperature °C")
    humidity: Optional[float] = Field(default=None, description="Relative humidity %")
    pressure_hpa: Optional[float] = Field(default=None, alias="pressureHpa", ge=0, le=1200)
    water_sensor_valid: Optional[bool] = Field(default=None, alias="waterSensorValid")
    climate_sensor_valid: Optional[bool] = Field(default=None, alias="climateSensorValid")

    # Gas / air metrics. mq2 is reserved for a calibrated concentration only.
    mq2_smoke: Optional[float] = Field(default=None, alias="mq2", description="Calibrated MQ-2 concentration only; do not send ADC counts here")
    mq2_raw: Optional[int] = Field(default=None, alias="mq2Raw", ge=0)
    mq2_digital_alarm: Optional[bool] = Field(default=None, alias="mq2DigitalAlarm")
    mq2_units: Optional[str] = Field(default=None, alias="mq2Units", max_length=24)
    mq135_air_quality: Optional[float] = Field(default=None, alias="mq135")
    flame_detected: Optional[float] = Field(default=None, alias="flame", description="Flame sensor state 0/1; absent means unknown")

    # Extended telemetry
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co2_level: Optional[float] = Field(default=None, alias="co2")

    # Transmission diagnostics. No fabricated defaults: absent means unknown.
    battery_level: Optional[float] = Field(default=None, alias="battery", ge=0, le=100)
    battery_voltage: Optional[float] = Field(default=None, alias="batteryVoltage", ge=0, le=30)
    rssi: Optional[int] = Field(default=None, alias="signal", ge=-160, le=20)
    gps_latitude: Optional[float] = Field(default=None, alias="gpsLatitude", ge=-90, le=90)
    gps_longitude: Optional[float] = Field(default=None, alias="gpsLongitude", ge=-180, le=180)
    gps_fix_valid: Optional[bool] = Field(default=None, alias="gpsFixValid")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data):
        if isinstance(data, dict):
            data = dict(data)
            # Legacy firmware sends a Boolean rain flag. This proxy is not calibrated mm/hr.
            if isinstance(data.get("rain"), bool):
                data.setdefault("rain_detected", data["rain"])
                data.setdefault("rain_rate", None)
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
    rain_raw: Optional[int] = None
    rain_detected: Optional[bool] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure_hpa: Optional[float] = None
    water_sensor_valid: Optional[bool] = None
    climate_sensor_valid: Optional[bool] = None
    mq2_smoke: Optional[float] = None
    mq2_raw: Optional[int] = None
    mq2_digital_alarm: Optional[bool] = None
    mq2_units: Optional[str] = None
    mq135_air_quality: Optional[float] = None
    flame_detected: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co2_level: Optional[float] = None
    battery_level: Optional[float] = None
    battery_voltage: Optional[float] = None
    rssi: Optional[int] = None
    protocol: Optional[str] = None
    firmware_version: Optional[str] = None
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None
    gps_fix_valid: Optional[bool] = None
    sequence_number: Optional[int] = None
    boot_id: Optional[str] = None
    calculated_risk_score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
