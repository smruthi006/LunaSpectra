"""Service layer for observations, abundances, line fluxes, and spectra endpoints."""

from __future__ import annotations

import math

from app.db.models import ObservationModel
from app.repositories.observations import ObservationRepository
from app.schemas.common import PaginationMeta
from app.schemas.observation import (
    AbundanceOut,
    LineFluxOut,
    ObservationAbundancesResponse,
    ObservationDetailOut,
    ObservationLineFluxesResponse,
    ObservationSummaryOut,
    PaginatedObservationsResponse,
    SourceProductOut,
)
from app.schemas.spectrum import ObservationSpectraResponse
from app.services.spectrum_service import serialize_spectrum
from sqlalchemy.orm import Session


class ObservationService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = ObservationRepository(db)

    def list_observations(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        observation_date: str | None = None,
        element: str | None = None,
        has_abundance: bool | None = None,
        has_spectrum: bool | None = None,
        sort: str = "observation_date_asc",
    ) -> PaginatedObservationsResponse:
        rows, total = self.repo.list_observations(
            page=page,
            page_size=page_size,
            observation_date=observation_date,
            element=element,
            has_abundance=has_abundance,
            has_spectrum=has_spectrum,
            sort=sort,
        )
        items: list[ObservationSummaryOut] = []
        for obs in rows:
            elems = sorted(
                {a.element for a in obs.abundances} | {f.element for f in obs.line_fluxes}
            )
            bg_count = sum(1 for s in obs.spectra if s.spectrum_type == "background")
            items.append(
                ObservationSummaryOut(
                    id=obs.id,
                    observation_id=obs.observation_id,
                    dataset_id=obs.dataset_id,
                    observation_date=obs.observation_date,
                    acquisition_start_time=obs.acquisition_start_time,
                    acquisition_end_time=obs.acquisition_end_time,
                    latitude=obs.latitude,
                    longitude=obs.longitude,
                    footprint_geometry=obs.footprint_geometry,
                    exposure=obs.exposure,
                    data_origin=obs.data_origin,
                    spectrum_count=len(obs.spectra),
                    background_spectrum_count=bg_count,
                    abundance_count=len(obs.abundances),
                    line_flux_count=len(obs.line_fluxes),
                    elements=elems,
                )
            )
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        return PaginatedObservationsResponse(
            items=items,
            pagination=PaginationMeta(
                page=page,
                page_size=page_size,
                total_items=total,
                total_pages=total_pages,
            ),
        )

    @staticmethod
    def _missing_fields_for(obs: ObservationModel) -> list[str]:
        missing: list[str] = []
        for field in (
            "observation_date",
            "acquisition_start_time",
            "acquisition_end_time",
            "latitude",
            "longitude",
            "footprint_geometry",
            "exposure",
        ):
            if getattr(obs, field) is None:
                missing.append(field)
        if not obs.abundances:
            missing.append("verified_abundances")
        return missing

    def get_observation_detail(self, identifier: str) -> ObservationDetailOut | None:
        obs = self.repo.get_by_identifier(identifier)
        if obs is None:
            return None

        source_products = self.repo.get_source_products_for_observation(obs)
        ds = obs.dataset
        return ObservationDetailOut(
            id=obs.id,
            observation_id=obs.observation_id,
            dataset_id=obs.dataset_id,
            observation_date=obs.observation_date,
            acquisition_start_time=obs.acquisition_start_time,
            acquisition_end_time=obs.acquisition_end_time,
            latitude=obs.latitude,
            longitude=obs.longitude,
            footprint_geometry=obs.footprint_geometry,
            exposure=obs.exposure,
            data_origin=obs.data_origin,
            created_at=obs.created_at,
            source_products=[
                SourceProductOut(
                    id=sp.id,
                    dataset_id=sp.dataset_id,
                    original_filename=sp.original_filename,
                    relative_path=sp.relative_path,
                    checksum_sha256=sp.checksum_sha256,
                    format=sp.format,
                    file_size=sp.file_size,
                    source_url=sp.source_url,
                    parse_status=sp.parse_status,
                    parse_error=sp.parse_error,
                )
                for sp in source_products
            ],
            spectra=[serialize_spectrum(s) for s in obs.spectra],
            line_fluxes=[
                LineFluxOut(
                    id=f.id,
                    observation_id=f.observation_id,
                    source_product_id=f.source_product_id,
                    element=f.element,
                    spectral_line=f.spectral_line,
                    line_energy=f.line_energy,
                    line_flux=f.line_flux,
                    uncertainty=f.uncertainty,
                    unit=f.unit,
                )
                for f in obs.line_fluxes
            ],
            abundances=[
                AbundanceOut(
                    id=a.id,
                    observation_id=a.observation_id,
                    source_product_id=a.source_product_id,
                    element=a.element,
                    abundance=a.abundance,
                    uncertainty=a.uncertainty,
                    uncertainty_upper=a.uncertainty_upper,
                    uncertainty_lower=a.uncertainty_lower,
                    unit=a.unit,
                    derivation_note=a.derivation_note,
                )
                for a in obs.abundances
            ],
            provenance={
                "dataset_name": ds.name if ds else None,
                "doi": ds.doi if ds else None,
                "contributor": ds.contributor if ds else None,
                "institution": ds.institution if ds else None,
                "license": ds.license if ds else None,
                "source_url": ds.source_url if ds else None,
            },
            missing_fields=self._missing_fields_for(obs),
        )

    def get_observation_spectra(
        self,
        identifier: str,
        *,
        spectrum_type: str | None = None,
        max_points: int | None = None,
    ) -> ObservationSpectraResponse | None:
        obs = self.repo.get_by_identifier(identifier)
        if obs is None:
            return None
        filtered = [
            s for s in obs.spectra if spectrum_type is None or s.spectrum_type == spectrum_type
        ]
        serialized = [serialize_spectrum(s, max_points=max_points) for s in filtered]
        return ObservationSpectraResponse(
            observation_id=obs.observation_id,
            spectrum_count=len(serialized),
            spectra=serialized,
        )

    def get_observation_abundances(self, identifier: str) -> ObservationAbundancesResponse | None:
        obs = self.repo.get_by_identifier(identifier)
        if obs is None:
            return None
        notes: list[str] = []
        if obs.observation_id == "CLASS_20191118" and not obs.abundances:
            notes.append(
                "181120/R2_abundance.txt lists 5 header elements (Na, Mg, Al, Si, Ca) vs 4 values; "
                "records are withheld rather than guessing element assignment."
            )
        return ObservationAbundancesResponse(
            observation_id=obs.observation_id,
            count=len(obs.abundances),
            abundances=[
                AbundanceOut(
                    id=a.id,
                    observation_id=a.observation_id,
                    source_product_id=a.source_product_id,
                    element=a.element,
                    abundance=a.abundance,
                    uncertainty=a.uncertainty,
                    uncertainty_upper=a.uncertainty_upper,
                    uncertainty_lower=a.uncertainty_lower,
                    unit=a.unit,
                    derivation_note=a.derivation_note,
                )
                for a in obs.abundances
            ],
            notes=notes,
        )

    def get_observation_line_fluxes(self, identifier: str) -> ObservationLineFluxesResponse | None:
        obs = self.repo.get_by_identifier(identifier)
        if obs is None:
            return None
        return ObservationLineFluxesResponse(
            observation_id=obs.observation_id,
            count=len(obs.line_fluxes),
            line_fluxes=[
                LineFluxOut(
                    id=f.id,
                    observation_id=f.observation_id,
                    source_product_id=f.source_product_id,
                    element=f.element,
                    spectral_line=f.spectral_line,
                    line_energy=f.line_energy,
                    line_flux=f.line_flux,
                    uncertainty=f.uncertainty,
                    unit=f.unit,
                )
                for f in obs.line_fluxes
            ],
        )
