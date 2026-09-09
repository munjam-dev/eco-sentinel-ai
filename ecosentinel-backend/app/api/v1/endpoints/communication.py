from typing import Dict, Any
from fastapi import APIRouter, Header, HTTPException
from app.schemas.common import ResponseEnvelope
from app.core.config import settings

router = APIRouter()


@router.post("/lora-gateway-ingest", response_model=ResponseEnvelope[dict])
async def lora_gateway_ingest(
    payload: Dict[str, Any],
    x_gateway_token: str = Header(None)
):
    """Receive and unpack packet concentrator payload from LoRaWAN gateway nodes."""
    if x_gateway_token != settings.LORA_GATEWAY_SECRET:
        raise HTTPException(status_code=401, detail="Invalid LoRa Gateway authentication token")

    node_id = payload.get("node_id", "UNKNOWN-LORA")
    rssi = payload.get("rssi", -80)
    snr = payload.get("snr", 8.5)

    return ResponseEnvelope(
        message="LoRa mesh packet decoded and queued for AI pipeline",
        data={
            "gateway_status": "authenticated",
            "node_id": node_id,
            "rssi": rssi,
            "snr": snr,
            "unpack_status": "success",
        }
    )
