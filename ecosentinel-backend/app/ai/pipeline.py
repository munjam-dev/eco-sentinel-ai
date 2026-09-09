from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.ai.feature_engineering import FeatureEngineeringEngine
from app.ai.inference import MultiHazardInferenceEngine


class AIPipelineManager:
    """Orchestrates end-to-end telemetry ingestion ➔ feature extraction ➔ inference ➔ SHAP output."""

    def __init__(self):
        self.feature_engine = FeatureEngineeringEngine()
        self.inference_engine = MultiHazardInferenceEngine()

    def process_telemetry(
        self,
        node_type: str,
        current_telemetry: Dict[str, Any],
        historical_records: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Execute full ML processing pipeline for incoming telemetry."""
        # 1. Feature Engineering
        features = self.feature_engine.extract_features(current_telemetry, historical_records)

        # 2. Multi-Hazard Inference
        result = self.inference_engine.predict(node_type, features)
        result["timestamp"] = datetime.now(timezone.utc).isoformat()
        result["features_extracted"] = features

        return result


pipeline_manager = AIPipelineManager()
