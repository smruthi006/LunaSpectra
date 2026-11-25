"""Datasets, dataset summary, and map availability endpoints."""

from __future__ import annotations

from app.db.session import get_db
from app.schemas.dataset import (
    DatasetOut,
    DatasetsResponse,
    DatasetSummaryOut,
    MapAvailabilityOut,
)
from app.services.dataset_service import DatasetService
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(tags=["datasets"])


@router.get("/datasets", response_model=DatasetsResponse, summary="List registered real datasets")
def list_datasets(db: Session = Depends(get_db)) -> DatasetsResponse:
    return DatasetService(db).list_datasets()


@router.get(
    "/datasets/{dataset_id}",
    response_model=DatasetOut,
    summary="Retrieve single dataset metadata",
)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)) -> DatasetOut:
    result = DatasetService(db).get_dataset(dataset_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "DATASET_NOT_FOUND", "message": f"Dataset '{dataset_id}' not found."},
        )
    return result


@router.get(
    "/dataset/summary",
    response_model=DatasetSummaryOut,
    summary="Return measurable summary statistics for the active dataset",
)
def get_dataset_summary(
    dataset_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> DatasetSummaryOut:
    result = DatasetService(db).get_dataset_summary(dataset_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "DATASET_NOT_FOUND",
                "message": "No active dataset found in database.",
            },
        )
    return result


@router.get(
    "/map/availability",
    response_model=MapAvailabilityOut,
    summary="Report verified geospatial coordinate and footprint availability",
)
def get_map_availability(db: Session = Depends(get_db)) -> MapAvailabilityOut:
    return DatasetService(db).get_map_availability()
