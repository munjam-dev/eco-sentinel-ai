import httpx
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger


class WeatherService:
    """Open-Meteo Weather Forecast & Atmospheric Modeling Integration."""

    def __init__(self):
        self.forecast_url = settings.WEATHER_FORECAST_URL

    async def get_forecast(self, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        """Fetch real-time atmospheric forecast from Open-Meteo."""
        url = self.forecast_url
        if lat is not None and lon is not None:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code,rain_sum&hourly=temperature_2m,rain,wind_speed_80m,cloud_cover,visibility&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=Asia%2FSingapore&forecast_days=16"

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    return res.json()
                else:
                    logger.warning(f"Open-Meteo returned {res.status_code}")
        except Exception as e:
            logger.error(f"Weather service fetch error: {e}")

        # Fallback default climate vector
        return {
            "current": {
                "temperature_2m": 28.5,
                "relative_humidity_2m": 68,
                "wind_speed_10m": 12.4,
                "weather_code": 1,
                "surface_pressure": 1012.3
            },
            "status": "cached_fallback"
        }


weather_service = WeatherService()
