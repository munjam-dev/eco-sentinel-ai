import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator, model_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoSentinel AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "development-only-change-me"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ecosentinel_db"
    SYNC_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ecosentinel_db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ecosentinel-app.vercel.app",
    ]

    # Supabase Integration
    SUPABASE_URL: str = "https://bgeobskxeggfyhenkgjn.supabase.co"
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Groq AI LLM Engine
    GROQ_API_KEY: str = ""

    # Open-Meteo Weather Forecast API
    WEATHER_FORECAST_URL: str = "https://api.open-meteo.com/v1/forecast?latitude=22&longitude=79&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code,rain_sum&hourly=temperature_2m,rain,wind_speed_80m,cloud_cover,visibility&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=Asia%2FSingapore&forecast_days=16"

    # Telemetry Settings
    DATA_RETENTION_DAYS: int = 90
    LORA_GATEWAY_SECRET: str = ""

    # Emergency Alert Threshold Defaults
    THRESHOLD_TEMP_CRITICAL: float = 45.0
    THRESHOLD_WATER_CRITICAL: float = 5.0
    THRESHOLD_PM25_CRITICAL: float = 150.0

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.ENVIRONMENT.lower() == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production")
            if not self.SECRET_KEY or self.SECRET_KEY == "development-only-change-me":
                raise ValueError("Set a strong SECRET_KEY through the environment in production")
            if not self.LORA_GATEWAY_SECRET:
                raise ValueError("Set LORA_GATEWAY_SECRET through the environment in production")
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
