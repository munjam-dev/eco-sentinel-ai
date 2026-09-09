from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.analytics import AnalyticsOverviewResponse
from app.schemas.common import ResponseEnvelope
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/overview", response_model=ResponseEnvelope[AnalyticsOverviewResponse])
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """Retrieve aggregated platform analytics, KPIs, and time-series trends."""
    service = AnalyticsService(db)
    overview = await service.get_dashboard_overview()
    return ResponseEnvelope(data=AnalyticsOverviewResponse.model_validate(overview))
