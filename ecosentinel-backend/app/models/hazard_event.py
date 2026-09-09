from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from app.models.base import BaseModel


class HazardEvent(BaseModel):
    __tablename__ = "hazard_events"

    event_id = Column(String(50), unique=True, index=True, nullable=False)
    hazard_type = Column(String(30), nullable=False, index=True)
    severity = Column(String(20), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), default="ongoing", nullable=False) # ongoing, contained, resolved
    
    affected_nodes = Column(JSON, nullable=True) # List of node IDs
    geo_perimeter = Column(JSON, nullable=True)  # List of lat/lng boundary points
