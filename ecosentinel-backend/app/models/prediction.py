from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Prediction(BaseModel):
    __tablename__ = "predictions"

    node_id = Column(String(50), ForeignKey("sensor_nodes.node_id", ondelete="CASCADE"), nullable=False, index=True)
    hazard_type = Column(String(30), nullable=False, index=True) # flood, fire, pollution, overall
    
    risk_score = Column(Float, nullable=False)        # 0.0 - 100.0
    confidence_score = Column(Float, nullable=False)  # 0.0 - 1.0
    risk_category = Column(String(20), nullable=False) # Low, Moderate, High, Critical
    
    explanation = Column(Text, nullable=False)         # Natural language SHAP summary
    feature_importances = Column(JSON, nullable=True)  # SHAP factor key-value weights
    recommended_action = Column(Text, nullable=False) # Operational instructions for authorities
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)

    node = relationship("SensorNode", back_populates="predictions")
