import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoSentinel AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "production_super_secret_jwt_key_change_me_in_prod"
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

    # Telemetry Settings
    DATA_RETENTION_DAYS: int = 90
    LORA_GATEWAY_SECRET: str = "lora_gateway_auth_token_998877"

    # Emergency Alert Threshold Defaults
    THRESHOLD_TEMP_CRITICAL: float = 45.0
    THRESHOLD_WATER_CRITICAL: float = 5.0
    THRESHOLD_PM25_CRITICAL: float = 150.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
