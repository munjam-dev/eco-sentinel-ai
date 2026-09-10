from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.common import ResponseEnvelope
from app.services.weather_service import weather_service

router = APIRouter()


@router.get("/forecast", response_model=ResponseEnvelope[dict])
async def get_weather_forecast(
    latitude: Optional[float] = Query(default=22.0, description="Latitude coordinate"),
    longitude: Optional[float] = Query(default=79.0, description="Longitude coordinate")
):
    """Fetch 16-day Open-Meteo meteorological and precipitation forecast."""
    data = await weather_service.get_forecast(latitude, longitude)
    return ResponseEnvelope(
        message="Open-Meteo meteorological forecast fetched successfully",
        data=data
    )
