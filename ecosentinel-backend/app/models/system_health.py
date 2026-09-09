from sqlalchemy import Column, String, Float, Integer, DateTime
from app.models.base import BaseModel


class SystemHealth(BaseModel):
    __tablename__ = "system_health"

    api_latency_ms = Column(Float, nullable=False)
    db_connection_pool_active = Column(Integer, nullable=False)
    cpu_usage_percent = Column(Float, nullable=False)
    memory_usage_percent = Column(Float, nullable=False)
    active_websocket_connections = Column(Integer, default=0, nullable=False)
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
