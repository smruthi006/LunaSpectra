"""Process genuine Chandrayaan-2 CLASS raw files into normalized Parquet tables and provenance JSON.

Usage (from repository root):
    python backend/scripts/process_class_data.py
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.adapters.class_mendeley import ClassMendeleyAdapter  # noqa: E402
from app.core.config import get_settings  # noqa: E402
from app.core.logging import configure_logging  # noqa: E402


def _write_parquet(df: pd.DataFrame, path: Path) -> None:
    df.to_parquet(path, engine="pyarrow", index=False)


def process_dataset(raw_dir: Path, processed_dir: Path) -> dict[str, Any]:
    """Run ClassMendeleyAdapter extraction and persist normalized Parquet + JSON artifacts."""
    processed_dir.mkdir(parents=True, exist_ok=True)
    adapter = ClassMendeleyAdapter(raw_dir)

    validation = adapter.validate_source()
    if not validation["valid"]:
        raise RuntimeError(f"Source validation failed: {validation['errors']}")

    dataset_record = adapter.describe_source()
    provenance = adapter.build_provenance()
    source_products = provenance["source_products"]
    observations = adapter.load_observations()
    spectra_raw = adapter.load_spectra()
    line_fluxes = adapter.load_line_fluxes()
    abundances = adapter.load_abundances()

    spectra_rows = [
        {
            "id": sp["id"],
            "observation_id": sp["observation_id"],
            "source_product_id": sp["source_product_id"],
            "spectrum_type": sp["spectrum_type"],
            "point_count": len(sp["energy_or_channel"]),
            "energy_or_channel_json": json.dumps(sp["energy_or_channel"]),
            "measured_value_json": json.dumps(sp["measured_value"]),
            "uncertainty_json": (
                json.dumps(sp["uncertainty"]) if sp["uncertainty"] is not None else None
            ),
            "energy_unit": sp["energy_unit"],
            "value_unit": sp["value_unit"],
        }
        for sp in spectra_raw
    ]

    datasets_df = pd.DataFrame([dataset_record])
    source_products_df = pd.DataFrame(source_products)
    observations_df = pd.DataFrame(observations)
    spectra_df = pd.DataFrame(spectra_rows)
    line_fluxes_df = pd.DataFrame(line_fluxes)
    abundances_df = pd.DataFrame(abundances)

    _write_parquet(datasets_df, processed_dir / "datasets.parquet")
    _write_parquet(source_products_df, processed_dir / "source_products.parquet")
    _write_parquet(observations_df, processed_dir / "observations.parquet")
    _write_parquet(spectra_df, processed_dir / "spectra.parquet")
    _write_parquet(line_fluxes_df, processed_dir / "line_fluxes.parquet")
    _write_parquet(abundances_df, processed_dir / "abundances.parquet")

    (processed_dir / "provenance.json").write_text(
        json.dumps(provenance, indent=2, default=str), encoding="utf-8"
    )
    validation_report = {
        **validation,
        "output_counts": {
            "datasets": len(datasets_df),
            "source_products": len(source_products_df),
            "observations": len(observations_df),
            "spectra": len(spectra_df),
            "line_fluxes": len(line_fluxes_df),
            "abundances": len(abundances_df),
        },
    }
    (processed_dir / "validation_report.json").write_text(
        json.dumps(validation_report, indent=2, default=str), encoding="utf-8"
    )
    return validation_report


def main() -> int:
    parser = argparse.ArgumentParser(description="Process genuine CLASS data into Parquet tables.")
    settings = get_settings()
    parser.add_argument("--raw-dir", type=Path, default=settings.raw_dataset_dir)
    parser.add_argument("--processed-dir", type=Path, default=settings.processed_dataset_dir)
    args = parser.parse_args()

    logger = configure_logging(settings.log_level)
    report = process_dataset(args.raw_dir, args.processed_dir)
    logger.info("Processed CLASS dataset into %s: %s", args.processed_dir, report["output_counts"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
