from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ResponseEnvelope(BaseModel, Generic[DataT]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[DataT] = None
    error: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number starting at 1")
    page_size: int = Field(default=50, ge=1, le=500, description="Items per page")


class PaginatedResponse(BaseModel, Generic[DataT]):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[DataT]
