from sqlalchemy import Column, String, Text
from app.models.base import BaseModel


class SystemSetting(BaseModel):
    __tablename__ = "system_settings"

    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    category = Column(String(50), default="general", nullable=False) # thresholds, alerts, ai, network
    description = Column(String(255), nullable=True)
