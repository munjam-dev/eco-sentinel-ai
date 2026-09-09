from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ReportCreate(BaseModel):
    title: str
    report_type: str # daily, weekly, monthly, incident
    format: str      # pdf, csv, excel
    summary_notes: Optional[str] = None


class ReportResponse(ReportCreate):
    id: str
    report_id: str
    file_path: Optional[str] = None
    file_size_bytes: int
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
