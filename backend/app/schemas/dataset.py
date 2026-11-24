"""Pydantic v2 schemas for datasets, dataset summaries, and map availability."""

from __future__ import annotations

from pydantic import BaseModel, Field


class DatasetOut(BaseModel):
    id: str
    name: str
    doi: str
    version: str
    contributor: str
    institution: str
    license: str
    source_url: str
    data_origin: str
    description: str | None = None
    observation_count: int
    available_content_types: list[str] = Field(default_factory=list)
    created_at: str


class DatasetsResponse(BaseModel):
    items: list[DatasetOut]
    total_items: int


class DateRangeOut(BaseModel):
    earliest_date: str | None = None
    latest_date: str | None = None
    distinct_dates: list[str] = Field(default_factory=list)


class CoordinateAvailabilityOut(BaseModel):
    available: bool
    coordinate_record_count: int
    footprint_record_count: int
    note: str


class DatasetSummaryOut(BaseModel):
    dataset_id: str
    name: str
    doi: str
    version: str
    contributor: str
    institution: str
    license: str
    source_url: str
    data_origin: str
    observation_count: int
    spectrum_count: int
    background_spectrum_count: int
    calibration_spectrum_count: int
    solar_spectrum_count: int
    available_elements: list[str]
    abundance_record_count: int
    line_flux_record_count: int
    date_range: DateRangeOut
    coordinate_availability: CoordinateAvailabilityOut
    missing_field_summary: dict[str, int]
    known_limitations: list[str] = Field(default_factory=list)


class MapAvailabilityOut(BaseModel):
    available: bool
    reason: str
    coordinate_record_count: int
    footprint_record_count: int


class HealthOut(BaseModel):
    status: str
    application: str
    api_version: str
    database_status: str
    active_dataset: str | None
    dataset_doi: str | None
    data_origin: str | None
    observation_count: int
    spectrum_count: int
    abundance_count: int
