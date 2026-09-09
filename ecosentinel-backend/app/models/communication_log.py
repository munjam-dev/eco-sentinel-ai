from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from app.models.base import BaseModel


class CommunicationLog(BaseModel):
    __tablename__ = "communication_logs"

    node_id = Column(String(50), ForeignKey("sensor_nodes.node_id", ondelete="CASCADE"), nullable=False, index=True)
    protocol = Column(String(20), nullable=False) # wifi, lora, satellite
    
    rssi = Column(Integer, nullable=False)         # Signal strength in dBm
    snr = Column(Float, nullable=True)             # Signal to Noise Ratio (LoRa)
    latency_ms = Column(Float, nullable=False)     # Transmission delay
    packet_loss_rate = Column(Float, default=0.0)  # % loss
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
