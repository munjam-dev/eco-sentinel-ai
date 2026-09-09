from typing import List, Dict, Any
from pydantic import BaseModel


class TimeSeriesPoint(BaseModel):
    timestamp: str
    value: float


class AnalyticsOverviewResponse(BaseModel):
    active_alerts_count: int
    online_nodes_count: int
    total_nodes_count: int
    overall_health_score: float
    avg_response_time_sec: float
    trend_data: Dict[str, List[TimeSeriesPoint]]
    alert_distribution: Dict[str, int]
