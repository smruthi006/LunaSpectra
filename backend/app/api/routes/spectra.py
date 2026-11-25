"""Spectra and background-spectrum array endpoint."""

from __future__ import annotations

from app.db.session import get_db
from app.schemas.spectrum import ObservationSpectraResponse
from app.services.observation_service import ObservationService
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/observations", tags=["spectra"])


@router.get(
    "/{observation_id}/spectra",
    response_model=ObservationSpectraResponse,
    summary="Get spectrum and background arrays for an observation (supports downsampling)",
)
def get_observation_spectra(
    observation_id: str,
    spectrum_type: str | None = Query(default=None),
    max_points: int | None = Query(default=None, ge=2, le=4096),
    db: Session = Depends(get_db),
) -> ObservationSpectraResponse:
    result = ObservationService(db).get_observation_spectra(
        observation_id,
        spectrum_type=spectrum_type,
        max_points=max_points,
    )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "OBSERVATION_NOT_FOUND",
                "message": f"Observation '{observation_id}' not found.",
            },
        )
    return result
