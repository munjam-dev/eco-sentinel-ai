from fastapi import HTTPException, status


class EcoSentinelException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP-400-BAD-REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class NodeNotFoundException(EcoSentinelException):
    def __init__(self, node_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sensor node '{node_id}' not found in registry."
        )


class InvalidSensorDataException(EcoSentinelException):
    def __init__(self, reason: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Telemetry payload validation failed: {reason}"
        )


class AIModelInferenceException(EcoSentinelException):
    def __init__(self, model_type: str, reason: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Engine failure during {model_type} risk inference: {reason}"
        )
