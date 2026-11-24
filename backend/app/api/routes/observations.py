"""Observations, abundances, and line-fluxes endpoints."""

from __future__ import annotations

from typing import Literal

from app.db.session import get_db
from app.schemas.observation import (
    ObservationAbundancesResponse,
    ObservationDetailOut,
    ObservationLineFluxesResponse,
    PaginatedObservationsResponse,
)
from app.services.observation_service import ObservationService
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/observations", tags=["observations"])


@router.get(
    "",
    response_model=PaginatedObservationsResponse,
    summary="List paginated and filterable real CLASS observations",
)
def list_observations(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
    observation_date: str | None = Query(default=None),
    element: str | None = Query(default=None),
    has_abundance: bool | None = Query(default=None),
    has_spectrum: bool | None = Query(default=None),
    sort: Literal[
        "observation_date_asc",
        "observation_date_desc",
        "exposure_desc",
        "observation_id_asc",
    ] = Query(default="observation_date_asc"),
    db: Session = Depends(get_db),
) -> PaginatedObservationsResponse:
    return ObservationService(db).list_observations(
        page=page,
        page_size=page_size,
        observation_date=observation_date,
        element=element,
        has_abundance=has_abundance,
        has_spectrum=has_spectrum,
        sort=sort,
    )


@router.get(
    "/{observation_id}",
    response_model=ObservationDetailOut,
    summary="Get full metadata, provenance, spectra, fluxes, abundances, and missing fields",
)
def get_observation_detail(
    observation_id: str,
    db: Session = Depends(get_db),
) -> ObservationDetailOut:
    result = ObservationService(db).get_observation_detail(observation_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "OBSERVATION_NOT_FOUND",
                "message": f"Observation '{observation_id}' not found.",
            },
        )
    return result


@router.get(
    "/{observation_id}/abundances",
    response_model=ObservationAbundancesResponse,
    summary="Get derived elemental abundances and uncertainties for an observation",
)
def get_observation_abundances(
    observation_id: str,
    db: Session = Depends(get_db),
) -> ObservationAbundancesResponse:
    result = ObservationService(db).get_observation_abundances(observation_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "OBSERVATION_NOT_FOUND",
                "message": f"Observation '{observation_id}' not found.",
            },
        )
    return result


@router.get(
    "/{observation_id}/line-fluxes",
    response_model=ObservationLineFluxesResponse,
    summary="Get modelled X-ray line fluxes and uncertainties for an observation",
)
def get_observation_line_fluxes(
    observation_id: str,
    db: Session = Depends(get_db),
) -> ObservationLineFluxesResponse:
    result = ObservationService(db).get_observation_line_fluxes(observation_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "OBSERVATION_NOT_FOUND",
                "message": f"Observation '{observation_id}' not found.",
            },
        )
    return result
