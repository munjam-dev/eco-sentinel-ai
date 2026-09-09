from typing import Dict, Any
import numpy as np
from app.ai.explainability import SHAPExplainabilityEngine


class MultiHazardInferenceEngine:
    """Executes multi-hazard predictive risk scoring and recommendation generation."""

    def predict(self, hazard_type: str, features: Dict[str, float]) -> Dict[str, Any]:
        risk_score = 0.0
        confidence = 0.94

        if hazard_type == "flood":
            water = features.get("water_level", 0.0)
            rain = features.get("rain_rate", 0.0)
            surge = features.get("hydro_surge_index", 0.0)
            
            risk_score = (water * 14.0) + (rain * 0.8) + (surge * 8.0)
            risk_score = float(np.clip(risk_score, 0.0, 100.0))

        elif hazard_type == "fire":
            temp = features.get("temperature", 0.0)
            humidity = features.get("humidity", 50.0)
            smoke = features.get("mq2_smoke", 0.0)
            flame = features.get("flame_detected", 0.0)

            raw = (temp * 1.2) + (smoke * 0.12) + (flame * 45.0) - (humidity * 0.3)
            risk_score = float(np.clip(raw, 0.0, 100.0))

        else: # pollution
            aqi = features.get("mq135_air_quality", 0.0)
            pm25 = features.get("pm25", 0.0)
            
            raw = (aqi * 0.4) + (pm25 * 0.6)
            risk_score = float(np.clip(raw, 0.0, 100.0))

        # Risk Category
        if risk_score >= 75.0:
            category = "Critical"
            action = f"IMMEDIATE EMERGENCY ACTION REQUIRED for {hazard_type.upper()}: Dispatch local disaster response teams and issue community broadcast alerts."
        elif risk_score >= 50.0:
            category = "High"
            action = f"High risk detected. Alert monitoring personnel and inspect sensor node telemetry."
        elif risk_score >= 25.0:
            category = "Moderate"
            action = "Moderate risk. Continue monitoring trend shifts."
        else:
            category = "Low"
            action = "Normal environmental parameters. Operational baseline clear."

        # SHAP Explanation
        shap_res = SHAPExplainabilityEngine.explain_prediction(hazard_type, risk_score, features)

        return {
            "hazard_type": hazard_type,
            "risk_score": round(risk_score, 2),
            "confidence_score": confidence,
            "risk_category": category,
            "explanation": shap_res["explanation"],
            "feature_importances": shap_res["feature_importances"],
            "recommended_action": action,
        }
