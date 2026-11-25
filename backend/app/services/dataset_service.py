"""Service layer for datasets, health, summary, elements, and map availability."""

from __future__ import annotations

from app.core.config import get_settings
from app.core.constants import ELEMENT_NAMES
from app.repositories.datasets import DatasetRepository
from app.schemas.dataset import (
    CoordinateAvailabilityOut,
    DatasetOut,
    DatasetsResponse,
    DatasetSummaryOut,
    DateRangeOut,
    HealthOut,
    MapAvailabilityOut,
)
from app.schemas.element import ElementOut, ElementsResponse
from sqlalchemy import text
from sqlalchemy.orm import Session


class DatasetService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = DatasetRepository(db)

    def get_health(self) -> HealthOut:
        settings = get_settings()
        db_ok = True
        try:
            self.db.execute(text("SELECT 1"))
        except Exception:  # noqa: BLE001
            db_ok = False

        primary = self.repo.get_primary_dataset() if db_ok else None
        obs_count = self.repo.count_observations(primary.id) if primary else 0
        spec_count = self.repo.count_spectra(primary.id) if primary else 0
        abund_count = self.repo.count_abundances(primary.id) if primary else 0

        return HealthOut(
            status="ok" if db_ok else "degraded",
            application=settings.app_name,
            api_version=settings.api_version,
            database_status="connected" if db_ok else "unavailable",
            active_dataset=primary.id if primary else None,
            dataset_doi=primary.doi if primary else None,
            data_origin=primary.data_origin if primary else None,
            observation_count=obs_count,
            spectrum_count=spec_count,
            abundance_count=abund_count,
        )

    def list_datasets(self) -> DatasetsResponse:
        rows = self.repo.list_datasets()
        items: list[DatasetOut] = []
        for ds in rows:
            content_types = self.repo.get_distinct_spectrum_types(ds.id)
            if self.repo.count_line_fluxes(ds.id) > 0:
                content_types.append("line_flux")
            if self.repo.count_abundances(ds.id) > 0:
                content_types.append("abundance")
            items.append(
                DatasetOut(
                    id=ds.id,
                    name=ds.name,
                    doi=ds.doi,
                    version=ds.version,
                    contributor=ds.contributor,
                    institution=ds.institution,
                    license=ds.license,
                    source_url=ds.source_url,
                    data_origin=ds.data_origin,
                    description=ds.description,
                    observation_count=ds.observation_count,
                    available_content_types=sorted(set(content_types)),
                    created_at=ds.created_at,
                )
            )
        return DatasetsResponse(items=items, total_items=len(items))

    def get_dataset(self, dataset_id: str) -> DatasetOut | None:
        ds = self.repo.get_dataset(dataset_id)
        if ds is None:
            return None
        content_types = self.repo.get_distinct_spectrum_types(ds.id)
        if self.repo.count_line_fluxes(ds.id) > 0:
            content_types.append("line_flux")
        if self.repo.count_abundances(ds.id) > 0:
            content_types.append("abundance")
        return DatasetOut(
            id=ds.id,
            name=ds.name,
            doi=ds.doi,
            version=ds.version,
            contributor=ds.contributor,
            institution=ds.institution,
            license=ds.license,
            source_url=ds.source_url,
            data_origin=ds.data_origin,
            description=ds.description,
            observation_count=ds.observation_count,
            available_content_types=sorted(set(content_types)),
            created_at=ds.created_at,
        )

    def get_dataset_summary(self, dataset_id: str | None = None) -> DatasetSummaryOut | None:
        ds = self.repo.get_dataset(dataset_id) if dataset_id else self.repo.get_primary_dataset()
        if ds is None:
            return None

        dates = self.repo.get_observation_dates(ds.id)
        coord_count, foot_count = self.repo.get_coordinate_counts(ds.id)
        elements = sorted(self.repo.get_element_aggregates().keys())
        missing_summary = self.repo.get_missing_field_counts(ds.id)

        return DatasetSummaryOut(
            dataset_id=ds.id,
            name=ds.name,
            doi=ds.doi,
            version=ds.version,
            contributor=ds.contributor,
            institution=ds.institution,
            license=ds.license,
            source_url=ds.source_url,
            data_origin=ds.data_origin,
            observation_count=self.repo.count_observations(ds.id),
            spectrum_count=self.repo.count_spectra(ds.id),
            background_spectrum_count=self.repo.count_spectra(ds.id, "background"),
            calibration_spectrum_count=(
                self.repo.count_spectra(ds.id, "calibration_preflight")
                + self.repo.count_spectra(ds.id, "calibration_postflight")
            ),
            solar_spectrum_count=(
                self.repo.count_spectra(ds.id, "solar_xsm")
                + self.repo.count_spectra(ds.id, "solar_model")
            ),
            available_elements=elements,
            abundance_record_count=self.repo.count_abundances(ds.id),
            line_flux_record_count=self.repo.count_line_fluxes(ds.id),
            date_range=DateRangeOut(
                earliest_date=dates[0] if dates else None,
                latest_date=dates[-1] if dates else None,
                distinct_dates=dates,
            ),
            coordinate_availability=CoordinateAvailabilityOut(
                available=coord_count > 0,
                coordinate_record_count=coord_count,
                footprint_record_count=foot_count,
                note=(
                    "Geospatial coordinates and footprint polygons are absent in "
                    "DOI 10.17632/6mmd96j5bg.1."
                    if coord_count == 0
                    else "Verified coordinates available."
                ),
            ),
            missing_field_summary=missing_summary,
            known_limitations=[
                "Only two lunar observation dates (2019-11-18 and 2020-05-29) are present "
                "in this dataset.",
                "No latitude, longitude, or footprint geometry is included in the "
                "Mendeley v1 files.",
                "181120/R2_abundance.txt has 5 header element names (Na, Mg, Al, Si, Ca) "
                "vs 4 array values; element mapping is withheld to avoid guessing.",
                "290520 CLASS FITS headers store STARTIME=0 sentinel; "
                "acquisition_start_time is null.",
            ],
        )

    def list_elements(self) -> ElementsResponse:
        agg = self.repo.get_element_aggregates()
        items: list[ElementOut] = []
        for elem in sorted(agg.keys()):
            info = agg[elem]
            ab_count = info.abundance_record_count
            fl_count = info.line_flux_record_count
            items.append(
                ElementOut(
                    element=elem,
                    element_name=ELEMENT_NAMES.get(elem),
                    measurement_types=sorted(info.measurement_types),
                    units=sorted(info.units),
                    abundance_record_count=ab_count,
                    line_flux_record_count=fl_count,
                    total_record_count=ab_count + fl_count,
                    uncertainty_available=info.uncertainty_available,
                )
            )
        return ElementsResponse(items=items, total_items=len(items))

    def get_map_availability(self) -> MapAvailabilityOut:
        coord_count, foot_count = self.repo.get_coordinate_counts()
        if coord_count == 0:
            return MapAvailabilityOut(
                available=False,
                reason="The active real dataset does not provide verified geospatial coordinates.",
                coordinate_record_count=0,
                footprint_record_count=foot_count,
            )
        return MapAvailabilityOut(
            available=True,
            reason="Verified geospatial coordinates are available.",
            coordinate_record_count=coord_count,
            footprint_record_count=foot_count,
        )
