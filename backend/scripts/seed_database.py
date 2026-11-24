"""Idempotently initialize SQLite database and seed it from processed Parquet outputs.

Usage (from repository root):
    python backend/scripts/seed_database.py
or (from backend/):
    python -m scripts.seed_database
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path
from typing import Any

import pandas as pd
from sqlalchemy.engine import Engine

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import get_settings  # noqa: E402
from app.core.logging import configure_logging  # noqa: E402
from app.db.initialize import initialize_database  # noqa: E402
from app.db.models import (  # noqa: E402
    DatasetModel,
    ElementalAbundanceModel,
    ElementalLineFluxModel,
    ObservationModel,
    SourceProductModel,
    SpectrumModel,
)
from app.db.session import create_app_engine, create_session_factory  # noqa: E402


def _clean(val: Any) -> Any:
    """Convert pandas NA / NaN values to Python None so NULL semantics are preserved."""
    if val is None:
        return None
    if isinstance(val, float) and math.isnan(val):
        return None
    if pd.isna(val):
        return None
    return val


def seed_from_processed(processed_dir: Path, engine: Engine | None = None) -> dict[str, int]:
    """Load processed Parquet tables idempotently into SQLite via session.merge."""
    required = [
        "datasets.parquet",
        "source_products.parquet",
        "observations.parquet",
        "spectra.parquet",
        "line_fluxes.parquet",
        "abundances.parquet",
    ]
    for name in required:
        if not (processed_dir / name).is_file():
            raise FileNotFoundError(
                f"Missing processed Parquet table '{name}' in {processed_dir}. "
                "Run process_class_data.py first."
            )

    target_engine = engine or create_app_engine()
    initialize_database(target_engine)
    session_factory = create_session_factory(target_engine)

    datasets_df = pd.read_parquet(processed_dir / "datasets.parquet")
    products_df = pd.read_parquet(processed_dir / "source_products.parquet")
    obs_df = pd.read_parquet(processed_dir / "observations.parquet")
    spectra_df = pd.read_parquet(processed_dir / "spectra.parquet")
    flux_df = pd.read_parquet(processed_dir / "line_fluxes.parquet")
    abund_df = pd.read_parquet(processed_dir / "abundances.parquet")

    with session_factory() as db:  # type: Session
        for row in datasets_df.to_dict(orient="records"):
            db.merge(
                DatasetModel(
                    id=str(row["id"]),
                    name=str(row["name"]),
                    doi=str(row["doi"]),
                    version=str(row["version"]),
                    contributor=str(row["contributor"]),
                    institution=str(row["institution"]),
                    license=str(row["license"]),
                    source_url=str(row["source_url"]),
                    data_origin=str(row["data_origin"]),
                    description=_clean(row.get("description")),
                    observation_count=int(row["observation_count"]),
                    created_at=str(row["created_at"]),
                )
            )

        for row in products_df.to_dict(orient="records"):
            db.merge(
                SourceProductModel(
                    id=str(row["id"]),
                    dataset_id=str(row["dataset_id"]),
                    original_filename=str(row["original_filename"]),
                    relative_path=str(row["relative_path"]),
                    checksum_sha256=str(row["checksum_sha256"]),
                    format=str(row["format"]),
                    file_size=int(row["file_size"]),
                    source_url=_clean(row.get("source_url")),
                    parse_status=str(row["parse_status"]),
                    parse_error=_clean(row.get("parse_error")),
                    created_at=str(row["created_at"]),
                )
            )

        for row in obs_df.to_dict(orient="records"):
            lat = _clean(row.get("latitude"))
            lon = _clean(row.get("longitude"))
            exp = _clean(row.get("exposure"))
            db.merge(
                ObservationModel(
                    id=str(row["id"]),
                    observation_id=str(row["observation_id"]),
                    dataset_id=str(row["dataset_id"]),
                    observation_date=_clean(row.get("observation_date")),
                    acquisition_start_time=_clean(row.get("acquisition_start_time")),
                    acquisition_end_time=_clean(row.get("acquisition_end_time")),
                    latitude=float(lat) if lat is not None else None,
                    longitude=float(lon) if lon is not None else None,
                    footprint_geometry=_clean(row.get("footprint_geometry")),
                    exposure=float(exp) if exp is not None else None,
                    data_origin=str(row["data_origin"]),
                    created_at=str(row["created_at"]),
                )
            )

        for row in spectra_df.to_dict(orient="records"):
            db.merge(
                SpectrumModel(
                    id=str(row["id"]),
                    observation_id=_clean(row.get("observation_id")),
                    source_product_id=str(row["source_product_id"]),
                    spectrum_type=str(row["spectrum_type"]),
                    point_count=int(row["point_count"]),
                    energy_or_channel_json=str(row["energy_or_channel_json"]),
                    measured_value_json=str(row["measured_value_json"]),
                    uncertainty_json=_clean(row.get("uncertainty_json")),
                    energy_unit=_clean(row.get("energy_unit")),
                    value_unit=str(row["value_unit"]),
                )
            )

        for row in flux_df.to_dict(orient="records"):
            le = _clean(row.get("line_energy"))
            lf = _clean(row.get("line_flux"))
            unc = _clean(row.get("uncertainty"))
            db.merge(
                ElementalLineFluxModel(
                    id=str(row["id"]),
                    observation_id=str(row["observation_id"]),
                    source_product_id=str(row["source_product_id"]),
                    element=str(row["element"]),
                    spectral_line=_clean(row.get("spectral_line")),
                    line_energy=float(le) if le is not None else None,
                    line_flux=float(lf) if lf is not None else None,
                    uncertainty=float(unc) if unc is not None else None,
                    unit=str(row["unit"]),
                    row_index=int(row.get("row_index", 0)),
                )
            )

        for row in abund_df.to_dict(orient="records"):
            ab = _clean(row.get("abundance"))
            unc = _clean(row.get("uncertainty"))
            u_up = _clean(row.get("uncertainty_upper"))
            u_lo = _clean(row.get("uncertainty_lower"))
            db.merge(
                ElementalAbundanceModel(
                    id=str(row["id"]),
                    observation_id=str(row["observation_id"]),
                    source_product_id=str(row["source_product_id"]),
                    element=str(row["element"]),
                    abundance=float(ab) if ab is not None else None,
                    uncertainty=float(unc) if unc is not None else None,
                    uncertainty_upper=float(u_up) if u_up is not None else None,
                    uncertainty_lower=float(u_lo) if u_lo is not None else None,
                    unit=str(row["unit"]),
                    derivation_note=_clean(row.get("derivation_note")),
                )
            )

        db.commit()

    return {
        "datasets": len(datasets_df),
        "source_products": len(products_df),
        "observations": len(obs_df),
        "spectra": len(spectra_df),
        "line_fluxes": len(flux_df),
        "abundances": len(abund_df),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Seed SQLite database from processed Parquet tables."
    )
    settings = get_settings()
    parser.add_argument("--processed-dir", type=Path, default=settings.processed_dataset_dir)
    args = parser.parse_args()

    logger = configure_logging(settings.log_level)
    counts = seed_from_processed(args.processed_dir)
    logger.info("Database seeded idempotently: %s", counts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
