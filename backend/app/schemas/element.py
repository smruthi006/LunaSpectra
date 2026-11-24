"""Pydantic v2 schemas for elements summary endpoint."""

from __future__ import annotations

from pydantic import BaseModel


class ElementOut(BaseModel):
    element: str
    element_name: str | None = None
    measurement_types: list[str]
    units: list[str]
    abundance_record_count: int
    line_flux_record_count: int
    total_record_count: int
    uncertainty_available: bool


class ElementsResponse(BaseModel):
    items: list[ElementOut]
    total_items: int
