from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sensor_data import SensorData
from app.models.prediction import Prediction
from app.schemas.sensor_data import SensorDataIngest
from app.repositories.sensor_repo import SensorDataRepository
from app.repositories.node_repo import NodeRepository
from app.repositories.prediction_repo import PredictionRepository
from app.ai.pipeline import pipeline_manager
from app.services.alert_engine import AlertEngine
from app.services.health_engine import NodeHealthEngine
from app.websocket.manager import ws_manager


class SensorService:
    """Core Telemetry Ingestion Engine: Persists data, executes AI pipeline, evaluates alerts, and broadcasts realtime updates."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.sensor_repo = SensorDataRepository(db)
        self.node_repo = NodeRepository(db)
        self.prediction_repo = PredictionRepository(db)
        self.alert_engine = AlertEngine(db)
        self.health_engine = NodeHealthEngine(db)

    async def ingest_telemetry(self, payload: SensorDataIngest) -> SensorData:
        # 1. Fetch Node
        node = await self.node_repo.get_by_node_id(payload.node_id)
        # Prefer the registered node configuration; for an unregistered prototype
        # node, honor the incoming type instead of silently classifying every node as flood.
        disaster_type = node.disaster_type if node else (payload.type.lower() if payload.type else "flood")

        # 2. Extract telemetry dictionary
        telemetry_dict = payload.model_dump()
        
        # Fetch historical records for delta calculation
        history_records = await self.sensor_repo.get_history_by_node(payload.node_id, limit=5)
        history_dicts = [h.__dict__ for h in history_records]

        # 3. AI Inference & Feature Engineering
        ai_res = pipeline_manager.process_telemetry(disaster_type, telemetry_dict, history_dicts)
        
        risk_score = ai_res["risk_score"]

        # 4. Save Sensor Data
        sensor_obj = SensorData(
            node_id=payload.node_id,
            timestamp=payload.timestamp or datetime.now(timezone.utc),
            water_level=payload.water_level,
            rain_rate=payload.rain_rate,
            temperature=payload.temperature,
            humidity=payload.humidity,
            mq2_smoke=payload.mq2_smoke,
            mq135_air_quality=payload.mq135_air_quality,
            flame_detected=payload.flame_detected,
            pm25=payload.pm25,
            pm10=payload.pm10,
            co2_level=payload.co2_level,
            calculated_risk_score=risk_score,
        )
        saved_sensor = await self.sensor_repo.create(sensor_obj)

        # 5. Save Prediction
        prediction_obj = Prediction(
            node_id=payload.node_id,
            hazard_type=disaster_type,
            risk_score=risk_score,
            confidence_score=ai_res["confidence_score"],
            risk_category=ai_res["risk_category"],
            explanation=ai_res["explanation"],
            feature_importances=ai_res["feature_importances"],
            recommended_action=ai_res["recommended_action"],
            timestamp=datetime.now(timezone.utc),
        )
        await self.prediction_repo.create(prediction_obj)

        # 6. Alert Evaluation
        await self.alert_engine.process_risk_assessment(
            node_id=payload.node_id,
            hazard_type=disaster_type,
            risk_score=risk_score,
            explanation=ai_res["explanation"],
        )

        # 7. Node Health Evaluation
        if payload.battery_level is not None and payload.rssi is not None:
            await self.health_engine.evaluate_node_health(payload.node_id, payload.battery_level, payload.rssi)

        # 8. Real-time WebSocket Broadcast
        await ws_manager.broadcast("sensor_update", {
            "node_id": payload.node_id,
            "disaster_type": disaster_type,
            "timestamp": saved_sensor.timestamp.isoformat(),
            "telemetry": telemetry_dict,
            "risk_score": risk_score,
            "risk_category": ai_res["risk_category"],
        })

        return saved_sensor
