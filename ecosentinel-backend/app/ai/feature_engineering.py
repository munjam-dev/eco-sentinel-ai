from typing import Dict, Any, List, Optional
import numpy as np


class FeatureEngineeringEngine:
    """Computes dynamic, temporal, and interaction features for multi-hazard AI inference."""

    @staticmethod
    def extract_features(
        current_telemetry: Dict[str, Any],
        historical_records: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, float]:
        """Transform raw telemetry into AI model feature vector."""
        temp = float(current_telemetry.get("temperature") or 25.0)
        humidity = float(current_telemetry.get("humidity") or 60.0)
        water_level = float(current_telemetry.get("water_level") or 1.2)
        rain_rate = float(current_telemetry.get("rain_rate") or 0.0)
        smoke = float(current_telemetry.get("mq2_smoke") or 120.0)
        aqi = float(current_telemetry.get("mq135_air_quality") or 45.0)
        flame = float(current_telemetry.get("flame_detected") or 0.0)
        pm25 = float(current_telemetry.get("pm25") or 20.0)

        # Derived Interaction Ratios
        vapor_pressure_deficit = (100.0 - humidity) * (temp / 100.0)
        heat_combustion_index = (temp * 1.5) + (smoke * 0.8) + (flame * 500.0)
        hydro_surge_index = water_level * (1.0 + (rain_rate / 10.0))
        air_toxicity_index = (aqi * 0.6) + (pm25 * 1.2) + (smoke * 0.4)

        # Temporal Rates of Change (Delta over history)
        temp_delta = 0.0
        water_delta = 0.0
        if historical_records and len(historical_records) > 0:
            prev = historical_records[0]
            temp_delta = temp - float(prev.get("temperature") or temp)
            water_delta = water_level - float(prev.get("water_level") or water_level)

        return {
            "temperature": temp,
            "humidity": humidity,
            "water_level": water_level,
            "rain_rate": rain_rate,
            "mq2_smoke": smoke,
            "mq135_air_quality": aqi,
            "flame_detected": flame,
            "pm25": pm25,
            "vapor_pressure_deficit": vapor_pressure_deficit,
            "heat_combustion_index": heat_combustion_index,
            "hydro_surge_index": hydro_surge_index,
            "air_toxicity_index": air_toxicity_index,
            "temp_delta": temp_delta,
            "water_delta": water_delta,
        }
