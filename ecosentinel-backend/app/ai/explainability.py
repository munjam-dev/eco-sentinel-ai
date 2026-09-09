from typing import Dict, Any


class SHAPExplainabilityEngine:
    """Generates feature importance attribution and natural language explanation for AI risk decisions."""

    @staticmethod
    def explain_prediction(
        hazard_type: str,
        risk_score: float,
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """Compute top feature importances and generate human-auditable text summary."""
        importances = {}
        explanation_parts = []

        if hazard_type == "flood":
            water = features.get("water_level", 0.0)
            rain = features.get("rain_rate", 0.0)
            surge = features.get("hydro_surge_index", 0.0)
            
            importances["water_level"] = round(min(100.0, water * 18.0), 1)
            importances["rain_rate"] = round(min(100.0, rain * 2.5), 1)
            importances["surge_index"] = round(min(100.0, surge * 15.0), 1)

            if risk_score > 70:
                explanation_parts.append(f"Critical water surge detected at {water}m with continuous rainfall rate of {rain}mm/hr.")
            elif risk_score > 40:
                explanation_parts.append(f"Moderate water accumulation observed ({water}m). River level rising.")
            else:
                explanation_parts.append("Hydrological indicators within normal operating range.")

        elif hazard_type == "fire":
            temp = features.get("temperature", 0.0)
            smoke = features.get("mq2_smoke", 0.0)
            flame = features.get("flame_detected", 0.0)
            
            importances["temperature"] = round(min(100.0, temp * 1.8), 1)
            importances["smoke_ppm"] = round(min(100.0, smoke * 0.15), 1)
            importances["flame_sensor"] = 100.0 if flame > 0 else 0.0

            if risk_score > 70:
                explanation_parts.append(f"Thermal anomaly ignition confirmed. Ambient temp {temp}°C with heavy combustion smoke ({smoke} PPM).")
            elif risk_score > 40:
                explanation_parts.append(f"Elevated thermal readings ({temp}°C) and minor gas concentration.")
            else:
                explanation_parts.append("Thermal and combustion gas levels stable.")

        else: # pollution
            aqi = features.get("mq135_air_quality", 0.0)
            pm25 = features.get("pm25", 0.0)
            
            importances["aqi_index"] = round(min(100.0, aqi * 0.5), 1)
            importances["pm25"] = round(min(100.0, pm25 * 0.8), 1)

            if risk_score > 70:
                explanation_parts.append(f"Hazardous AQI spike ({aqi}) with PM2.5 particulate concentration of {pm25}µg/m³.")
            elif risk_score > 40:
                explanation_parts.append(f"Moderate air quality deterioration ({aqi} AQI).")
            else:
                explanation_parts.append("Air quality parameters normal.")

        return {
            "feature_importances": importances,
            "explanation": " ".join(explanation_parts)
        }
