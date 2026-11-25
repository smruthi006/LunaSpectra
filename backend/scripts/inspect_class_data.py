"""Recursively inspect genuine Chandrayaan-2 CLASS dataset files without fabricating metadata.

Usage (from repository root):
    python backend/scripts/inspect_class_data.py
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.adapters.class_mendeley import ClassMendeleyAdapter  # noqa: E402
from app.core.config import get_settings  # noqa: E402
from app.core.logging import configure_logging  # noqa: E402


def inspect_directory(raw_dir: Path) -> list[dict[str, Any]]:
    """Inspect all files recursively under raw_dir using ClassMendeleyAdapter."""
    adapter = ClassMendeleyAdapter(raw_dir)
    return adapter.inventory_files()


def write_inventory_artifacts(
    records: list[dict[str, Any]], interim_dir: Path
) -> tuple[Path, Path]:
    """Write CSV and JSON inventory files to interim_dir."""
    interim_dir.mkdir(parents=True, exist_ok=True)
    json_path = interim_dir / "file_inventory.json"
    csv_path = interim_dir / "file_inventory.csv"

    json_path.write_text(json.dumps(records, indent=2, default=str), encoding="utf-8")

    fieldnames = [
        "relative_path",
        "original_filename",
        "extension",
        "file_size_bytes",
        "sha256",
        "detected_format",
        "open_success",
        "row_count",
        "column_names",
        "fits_hdu_names",
        "units",
        "date_metadata",
        "coordinate_metadata",
        "elemental_info",
        "error_message",
    ]
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for rec in records:
            writer.writerow(
                {
                    "relative_path": rec["relative_path"],
                    "original_filename": rec["original_filename"],
                    "extension": rec["extension"],
                    "file_size_bytes": rec["file_size_bytes"],
                    "sha256": rec["sha256"],
                    "detected_format": rec["detected_format"],
                    "open_success": rec["open_success"],
                    "row_count": rec["row_count"],
                    "column_names": "; ".join(rec["column_names"]),
                    "fits_hdu_names": "; ".join(rec["fits_hdu_names"]),
                    "units": "; ".join(rec["units"]),
                    "date_metadata": json.dumps(rec["date_metadata"], default=str),
                    "coordinate_metadata": json.dumps(rec["coordinate_metadata"], default=str),
                    "elemental_info": "; ".join(rec["elemental_info"]),
                    "error_message": rec["error_message"] or "",
                }
            )
    return csv_path, json_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Inspect genuine CLASS Mendeley raw dataset files."
    )
    settings = get_settings()
    parser.add_argument("--raw-dir", type=Path, default=settings.raw_dataset_dir)
    parser.add_argument("--interim-dir", type=Path, default=settings.interim_dataset_dir)
    args = parser.parse_args()

    logger = configure_logging(settings.log_level)
    records = inspect_directory(args.raw_dir)
    csv_path, json_path = write_inventory_artifacts(records, args.interim_dir)
    logger.info("Inspected %d files under %s", len(records), args.raw_dir)
    logger.info("Wrote inventory CSV: %s", csv_path)
    logger.info("Wrote inventory JSON: %s", json_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
