"""Repository queries for datasets and aggregate element/dataset summaries."""

from __future__ import annotations

from dataclasses import dataclass, field

from app.db.models import (
    DatasetModel,
    ElementalAbundanceModel,
    ElementalLineFluxModel,
    ObservationModel,
    SourceProductModel,
    SpectrumModel,
)
from sqlalchemy import func, select
from sqlalchemy.orm import Session


@dataclass
class ElementAggregate:
    measurement_types: set[str] = field(default_factory=set)
    units: set[str] = field(default_factory=set)
    abundance_record_count: int = 0
    line_flux_record_count: int = 0
    uncertainty_available: bool = False


class DatasetRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_datasets(self) -> list[DatasetModel]:
        stmt = select(DatasetModel).order_by(DatasetModel.created_at.desc(), DatasetModel.id.asc())
        return list(self.db.scalars(stmt).all())

    def get_dataset(self, dataset_id: str) -> DatasetModel | None:
        return self.db.get(DatasetModel, dataset_id)

    def get_primary_dataset(self) -> DatasetModel | None:
        stmt = select(DatasetModel).order_by(DatasetModel.id.asc()).limit(1)
        return self.db.scalars(stmt).first()

    def count_observations(self, dataset_id: str | None = None) -> int:
        stmt = select(func.count(ObservationModel.id))
        if dataset_id:
            stmt = stmt.where(ObservationModel.dataset_id == dataset_id)
        return int(self.db.scalar(stmt) or 0)

    def count_spectra(self, dataset_id: str | None = None, spectrum_type: str | None = None) -> int:
        stmt = select(func.count(SpectrumModel.id)).join(
            SourceProductModel, SpectrumModel.source_product_id == SourceProductModel.id
        )
        if dataset_id:
            stmt = stmt.where(SourceProductModel.dataset_id == dataset_id)
        if spectrum_type:
            stmt = stmt.where(SpectrumModel.spectrum_type == spectrum_type)
        return int(self.db.scalar(stmt) or 0)

    def count_abundances(self, dataset_id: str | None = None) -> int:
        stmt = select(func.count(ElementalAbundanceModel.id)).join(
            ObservationModel, ElementalAbundanceModel.observation_id == ObservationModel.id
        )
        if dataset_id:
            stmt = stmt.where(ObservationModel.dataset_id == dataset_id)
        return int(self.db.scalar(stmt) or 0)

    def count_line_fluxes(self, dataset_id: str | None = None) -> int:
        stmt = select(func.count(ElementalLineFluxModel.id)).join(
            ObservationModel, ElementalLineFluxModel.observation_id == ObservationModel.id
        )
        if dataset_id:
            stmt = stmt.where(ObservationModel.dataset_id == dataset_id)
        return int(self.db.scalar(stmt) or 0)

    def get_distinct_spectrum_types(self, dataset_id: str) -> list[str]:
        stmt = (
            select(SpectrumModel.spectrum_type)
            .join(SourceProductModel, SpectrumModel.source_product_id == SourceProductModel.id)
            .where(SourceProductModel.dataset_id == dataset_id)
            .distinct()
            .order_by(SpectrumModel.spectrum_type.asc())
        )
        rows: list[str] = list(self.db.scalars(stmt).all())
        return [str(item) for item in rows]

    def get_observation_dates(self, dataset_id: str) -> list[str]:
        stmt = (
            select(ObservationModel.observation_date)
            .where(
                ObservationModel.dataset_id == dataset_id,
                ObservationModel.observation_date.is_not(None),
            )
            .distinct()
            .order_by(ObservationModel.observation_date.asc())
        )
        rows: list[str | None] = list(self.db.scalars(stmt).all())
        return [str(item) for item in rows if item is not None]

    def get_coordinate_counts(self, dataset_id: str | None = None) -> tuple[int, int]:
        coord_stmt = select(func.count(ObservationModel.id)).where(
            ObservationModel.latitude.is_not(None),
            ObservationModel.longitude.is_not(None),
        )
        foot_stmt = select(func.count(ObservationModel.id)).where(
            ObservationModel.footprint_geometry.is_not(None),
        )
        if dataset_id:
            coord_stmt = coord_stmt.where(ObservationModel.dataset_id == dataset_id)
            foot_stmt = foot_stmt.where(ObservationModel.dataset_id == dataset_id)
        return int(self.db.scalar(coord_stmt) or 0), int(self.db.scalar(foot_stmt) or 0)

    def get_missing_field_counts(self, dataset_id: str) -> dict[str, int]:
        obs_rows: list[ObservationModel] = list(
            self.db.scalars(
                select(ObservationModel).where(ObservationModel.dataset_id == dataset_id)
            ).all()
        )
        fields = [
            "observation_date",
            "acquisition_start_time",
            "acquisition_end_time",
            "latitude",
            "longitude",
            "footprint_geometry",
            "exposure",
        ]
        counts: dict[str, int] = {}
        for f in fields:
            missing = sum(1 for row in obs_rows if getattr(row, f) is None)
            if missing > 0:
                counts[f] = missing
        return counts

    def get_element_aggregates(self) -> dict[str, ElementAggregate]:
        summary: dict[str, ElementAggregate] = {}

        abund_rows: list[ElementalAbundanceModel] = list(
            self.db.scalars(select(ElementalAbundanceModel)).all()
        )
        for ab in abund_rows:
            entry = summary.setdefault(ab.element, ElementAggregate())
            entry.measurement_types.add("abundance")
            entry.units.add(ab.unit)
            entry.abundance_record_count += 1
            if (
                ab.uncertainty is not None
                or ab.uncertainty_upper is not None
                or ab.uncertainty_lower is not None
            ):
                entry.uncertainty_available = True

        flux_rows: list[ElementalLineFluxModel] = list(
            self.db.scalars(select(ElementalLineFluxModel)).all()
        )
        for fl in flux_rows:
            entry = summary.setdefault(fl.element, ElementAggregate())
            entry.measurement_types.add("line_flux")
            entry.units.add(fl.unit)
            entry.line_flux_record_count += 1
            if fl.uncertainty is not None:
                entry.uncertainty_available = True

        return summary
