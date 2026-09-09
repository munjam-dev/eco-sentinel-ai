from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PredictionResponse(BaseModel):
    id: str
    node_id: str
    hazard_type: str
    risk_score: float
    confidence_score: float
    risk_category: str
    explanation: str
    feature_importances: Optional[Dict[str, float]] = None
    recommended_action: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
