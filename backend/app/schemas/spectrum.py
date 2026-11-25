"""Pydantic v2 schemas for spectrum and background-spectrum arrays."""

from __future__ import annotations

from pydantic import BaseModel


class SpectrumOut(BaseModel):
    id: str
    observation_id: str
    source_product_id: str
    spectrum_type: str
    point_count: int
    returned_point_count: int
    downsampled: bool
    energy_or_channel: list[float]
    measured_value: list[float]
    uncertainty: list[float] | None = None
    energy_unit: str | None = None
    value_unit: str


class ObservationSpectraResponse(BaseModel):
    observation_id: str
    spectrum_count: int
    spectra: list[SpectrumOut]
