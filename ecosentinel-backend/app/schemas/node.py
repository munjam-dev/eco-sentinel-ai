from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class NodeBase(BaseModel):
    node_id: str = Field(..., description="Unique ESP32/LoRa hardware identifier")
    name: str = Field(..., description="Node label")
    disaster_type: str = Field(..., description="flood, fire, pollution")
    latitude: float
    longitude: float
    location_address: Optional[str] = None
    zone: Optional[str] = None
    transport_protocol: str = Field(default="wifi", description="wifi or lora")


class NodeCreate(NodeBase):
    firmware_version: Optional[str] = "v1.2.0"


class NodeUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    battery_level: Optional[float] = None
    signal_strength: Optional[int] = None
    health_score: Optional[float] = None
    firmware_version: Optional[str] = None


class NodeResponse(NodeBase):
    id: str
    status: str
    battery_level: float
    signal_strength: int
    firmware_version: str
    health_score: float
    last_ping: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
