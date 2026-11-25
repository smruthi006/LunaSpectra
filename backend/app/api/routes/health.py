"""Health check endpoint."""

from __future__ import annotations

from app.db.session import get_db
from app.schemas.dataset import HealthOut
from app.services.dataset_service import DatasetService
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut, summary="Backend and database health check")
def get_health(db: Session = Depends(get_db)) -> HealthOut:
    return DatasetService(db).get_health()
