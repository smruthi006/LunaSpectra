"""Pydantic v2 schemas for observations, source products, line fluxes, and abundances."""

from __future__ import annotations

from app.schemas.common import PaginationMeta
from app.schemas.spectrum import SpectrumOut
from pydantic import BaseModel, Field


class SourceProductOut(BaseModel):
    id: str
    dataset_id: str
    original_filename: str
    relative_path: str
    checksum_sha256: str
    format: str
    file_size: int
    source_url: str | None = None
    parse_status: str
    parse_error: str | None = None


class LineFluxOut(BaseModel):
    id: str
    observation_id: str
    source_product_id: str
    element: str
    spectral_line: str | None = None
    line_energy: float | None = None
    line_flux: float | None = None
    uncertainty: float | None = None
    unit: str


class AbundanceOut(BaseModel):
    id: str
    observation_id: str
    source_product_id: str
    element: str
    abundance: float | None = None
    uncertainty: float | None = None
    uncertainty_upper: float | None = None
    uncertainty_lower: float | None = None
    unit: str
    derivation_note: str | None = None


class ObservationSummaryOut(BaseModel):
    id: str
    observation_id: str
    dataset_id: str
    observation_date: str | None = None
    acquisition_start_time: str | None = None
    acquisition_end_time: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    footprint_geometry: str | None = None
    exposure: float | None = None
    data_origin: str
    spectrum_count: int
    background_spectrum_count: int
    abundance_count: int
    line_flux_count: int
    elements: list[str] = Field(default_factory=list)


class PaginatedObservationsResponse(BaseModel):
    items: list[ObservationSummaryOut]
    pagination: PaginationMeta


class ObservationDetailOut(BaseModel):
    id: str
    observation_id: str
    dataset_id: str
    observation_date: str | None = None
    acquisition_start_time: str | None = None
    acquisition_end_time: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    footprint_geometry: str | None = None
    exposure: float | None = None
    data_origin: str
    created_at: str
    source_products: list[SourceProductOut]
    spectra: list[SpectrumOut]
    line_fluxes: list[LineFluxOut]
    abundances: list[AbundanceOut]
    provenance: dict[str, object]
    missing_fields: list[str]


class ObservationAbundancesResponse(BaseModel):
    observation_id: str
    count: int
    abundances: list[AbundanceOut]
    notes: list[str] = Field(default_factory=list)


class ObservationLineFluxesResponse(BaseModel):
    observation_id: str
    count: int
    line_fluxes: list[LineFluxOut]
