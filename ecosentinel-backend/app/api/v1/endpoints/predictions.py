from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.prediction import PredictionResponse
from app.schemas.common import ResponseEnvelope
from app.repositories.prediction_repo import PredictionRepository

router = APIRouter()


@router.get("/latest/{node_id}", response_model=ResponseEnvelope[PredictionResponse])
async def get_latest_prediction(
    node_id: str,
    hazard_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the latest AI risk prediction and SHAP explanation for a node."""
    repo = PredictionRepository(db)
    pred = await repo.get_latest_by_node(node_id, hazard_type)
    if not pred:
        raise HTTPException(status_code=404, detail="No prediction records found for this node")
    return ResponseEnvelope(data=PredictionResponse.model_validate(pred))
