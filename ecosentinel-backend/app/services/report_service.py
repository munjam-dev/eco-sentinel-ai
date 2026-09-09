import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.report import Report
from app.schemas.report import ReportCreate


class ReportService:
    """Generates and manages PDF/CSV/Excel environmental disaster analysis reports."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_report(self, report_in: ReportCreate) -> Report:
        report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
        file_name = f"{report_id}_{report_in.report_type}.{report_in.format}"
        file_path = f"app/reports/files/{file_name}"

        report_obj = Report(
            report_id=report_id,
            title=report_in.title,
            report_type=report_in.report_type,
            format=report_in.format,
            file_path=file_path,
            file_size_bytes=1024 * 45, # Mock 45 KB file size
            summary_notes=report_in.summary_notes or f"Generated {report_in.report_type} environmental compliance report.",
            generated_at=datetime.now(timezone.utc),
        )

        self.db.add(report_obj)
        await self.db.commit()
        await self.db.refresh(report_obj)
        return report_obj
