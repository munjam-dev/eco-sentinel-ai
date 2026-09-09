from sqlalchemy import Column, String, DateTime, Text, Integer
from app.models.base import BaseModel


class Report(BaseModel):
    __tablename__ = "reports"

    report_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(150), nullable=False)
    report_type = Column(String(30), nullable=False, index=True) # daily, weekly, monthly, incident
    format = Column(String(10), nullable=False)                 # pdf, csv, excel
    
    file_path = Column(String(255), nullable=True)
    file_size_bytes = Column(Integer, default=0)
    summary_notes = Column(Text, nullable=True)
    
    generated_at = Column(DateTime(timezone=True), nullable=False, index=True)
