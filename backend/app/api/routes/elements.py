"""Elements summary endpoint."""

from __future__ import annotations

from app.db.session import get_db
from app.schemas.element import ElementsResponse
from app.services.dataset_service import DatasetService
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(tags=["elements"])


@router.get(
    "/elements",
    response_model=ElementsResponse,
    summary="List available elements, measurement types, units, and uncertainty availability",
)
def list_elements(db: Session = Depends(get_db)) -> ElementsResponse:
    return DatasetService(db).list_elements()
