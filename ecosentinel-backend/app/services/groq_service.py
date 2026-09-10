import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger


class GroqAIService:
    """Enterprise AI Disaster Analysis Service powered by Groq LLM Inference."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile"

    async def generate_disaster_analysis(
        self,
        hazard_type: str,
        node_id: str,
        telemetry: Dict[str, Any],
        risk_score: float,
        location: str = "Active Sector"
    ) -> Dict[str, Any]:
        """Generate high-precision contextual reasoning and tactical action plan."""
        if not self.api_key:
            return {
                "summary": f"Automated {hazard_type.upper()} risk calculation scored at {risk_score:.1f}/100.",
                "action_plan": "Monitor live telemetry and verify local flood/smoke barrier sensors.",
                "evacuation_needed": risk_score >= 80.0
            }

        prompt = f"""You are the Chief AI Environmental Scientist for EcoSentinel AI.
Analyze the following real-time IoT sensor telemetry packet:
- Node Identifier: {node_id}
- Monitored Hazard: {hazard_type.upper()}
- Risk Score: {risk_score:.1f} / 100
- Location: {location}
- Sensor Telemetry Vector: {telemetry}

Provide a concise, mission-critical report in JSON format with:
1. "summary": A 1-2 sentence human-readable explanation of what triggered this risk score based on specific sensor values.
2. "action_plan": 2-3 step tactical instructions for local disaster response teams.
3. "evacuation_needed": Boolean true/false based on severity.
Return ONLY valid JSON.
"""

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a specialized AI environmental defense system. Always return clean JSON."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 512
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(self.api_url, headers=headers, json=body)
                if res.status_code == 200:
                    data = res.json()
                    import json
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.warning(f"Groq API returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Groq AI service error: {e}")

        # Graceful fallback rule-based response
        return {
            "summary": f"{hazard_type.upper()} threat index assessed at {risk_score:.1f} based on rapid sensor telemetry spikes.",
            "action_plan": "Dispatch local inspection crew and verify hydrological/thermal perimeter sensors.",
            "evacuation_needed": risk_score >= 80.0
        }


groq_ai_service = GroqAIService()
