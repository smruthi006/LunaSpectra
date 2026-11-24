"""Abstract base adapter interface for real planetary dataset ingestion."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any


class DatasetAdapter(ABC):
    """Typed contract for ingesting genuine planetary science datasets."""

    def __init__(self, raw_dir: Path) -> None:
        self.raw_dir = raw_dir

    @abstractmethod
    def describe_source(self) -> dict[str, Any]:
        """Return dataset-level identity, DOI, license, and provenance metadata."""

    @abstractmethod
    def inventory_files(self) -> list[dict[str, Any]]:
        """Inspect and return structured metadata for every file in the raw directory."""

    @abstractmethod
    def validate_source(self) -> dict[str, Any]:
        """Validate source integrity, expected files, units, and anomalies."""

    @abstractmethod
    def load_observations(self) -> list[dict[str, Any]]:
        """Extract canonical observation records without fabricating absent fields."""

    @abstractmethod
    def load_spectra(self) -> list[dict[str, Any]]:
        """Extract spectrum and background-spectrum array records."""

    @abstractmethod
    def load_line_fluxes(self) -> list[dict[str, Any]]:
        """Extract modelled X-ray elemental line-flux records."""

    @abstractmethod
    def load_abundances(self) -> list[dict[str, Any]]:
        """Extract derived elemental abundance records."""

    @abstractmethod
    def build_provenance(self) -> dict[str, Any]:
        """Build complete provenance record linking source products, checksums, and outputs."""
