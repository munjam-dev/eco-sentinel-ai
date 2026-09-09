from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.report import ReportCreate, ReportResponse
from app.schemas.common import ResponseEnvelope
from app.services.report_service import ReportService

router = APIRouter()


@router.post("", response_model=ResponseEnvelope[ReportResponse])
async def generate_report(payload: ReportCreate, db: AsyncSession = Depends(get_db)):
    """Generate automated PDF/CSV/Excel environmental compliance report."""
    service = ReportService(db)
    report = await service.generate_report(payload)
    return ResponseEnvelope(message="Report generated successfully", data=ReportResponse.model_validate(report))
