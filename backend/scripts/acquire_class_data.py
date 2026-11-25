"""Acquire genuine Chandrayaan-2 CLASS dataset (DOI: 10.17632/6mmd96j5bg.1) from Mendeley Data.

Usage (from repository root):
    python backend/scripts/acquire_class_data.py
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import certifi
import httpx

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import get_settings  # noqa: E402
from app.core.constants import (  # noqa: E402
    DATASET_DOI,
    DATASET_PUBLIC_API_FILES_URL,
    DATASET_PUBLIC_API_META_URL,
    DATASET_SOURCE_URL,
)
from app.core.logging import configure_logging  # noqa: E402


def sha256_file(path: Path) -> str:
    """Compute SHA-256 hex digest for a local file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def acquire_dataset(
    raw_dir: Path,
    interim_dir: Path,
    timeout_seconds: float = 30.0,
) -> dict[str, Any]:
    """Download version 1 files from Mendeley public API into raw_dir idempotently."""
    raw_dir.mkdir(parents=True, exist_ok=True)
    interim_dir.mkdir(parents=True, exist_ok=True)

    downloaded_files: list[dict[str, Any]] = []
    extracted_archives: list[str] = []

    with httpx.Client(
        verify=certifi.where(),
        follow_redirects=True,
        timeout=timeout_seconds,
        headers={"User-Agent": "LunaSpectra/0.1 (Academic Research Pipeline)"},
    ) as client:
        meta_resp = client.get(DATASET_PUBLIC_API_META_URL)
        meta_resp.raise_for_status()
        dataset_meta = meta_resp.json()

        files_resp = client.get(DATASET_PUBLIC_API_FILES_URL)
        files_resp.raise_for_status()
        files_payload = files_resp.json()

        for entry in files_payload:
            filename = entry["filename"]
            details = entry.get("content_details", {})
            download_url = details.get("download_url")
            expected_sha = details.get("sha256_hash")
            expected_size = entry.get("size") or details.get("size")
            if not download_url:
                raise RuntimeError(f"Missing download_url for file entry: {filename}")

            target_path = raw_dir / filename
            already_valid = (
                target_path.exists()
                and expected_sha
                and sha256_file(target_path).lower() == str(expected_sha).lower()
            )
            action = "reused_verified_local"
            if not already_valid:
                dl_resp = client.get(download_url)
                dl_resp.raise_for_status()
                target_path.write_bytes(dl_resp.content)
                action = "downloaded"

            actual_sha = sha256_file(target_path)
            if expected_sha and actual_sha.lower() != str(expected_sha).lower():
                raise ValueError(
                    f"Checksum mismatch for {filename}: expected {expected_sha}, got {actual_sha}"
                )

            downloaded_files.append(
                {
                    "filename": filename,
                    "path": str(target_path),
                    "source_url": download_url,
                    "expected_size_bytes": expected_size,
                    "actual_size_bytes": target_path.stat().st_size,
                    "sha256": actual_sha,
                    "action": action,
                }
            )

            if target_path.suffix.lower() == ".zip":
                with zipfile.ZipFile(target_path, "r") as zf:
                    zf.extractall(raw_dir)
                extracted_archives.append(filename)

    manifest = {
        "dataset_doi": DATASET_DOI,
        "dataset_source_url": DATASET_SOURCE_URL,
        "public_api_files_url": DATASET_PUBLIC_API_FILES_URL,
        "dataset_name": dataset_meta.get("name"),
        "dataset_version": dataset_meta.get("version"),
        "acquired_at_utc": datetime.now(UTC).isoformat(),
        "raw_dir": str(raw_dir),
        "downloaded_files": downloaded_files,
        "extracted_archives": extracted_archives,
    }
    manifest_path = interim_dir / "acquisition_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description="Acquire genuine CLASS Mendeley v1 dataset.")
    settings = get_settings()
    parser.add_argument("--raw-dir", type=Path, default=settings.raw_dataset_dir)
    parser.add_argument("--interim-dir", type=Path, default=settings.interim_dataset_dir)
    args = parser.parse_args()

    logger = configure_logging(settings.log_level)
    try:
        manifest = acquire_dataset(args.raw_dir, args.interim_dir)
    except Exception as exc:  # noqa: BLE001
        logger.error("Automatic dataset acquisition failed: %s", exc)
        print(
            "\nAutomatic download failed. Please manually download all files using "
            "'Download All' at:\n"
            f"  {DATASET_SOURCE_URL}\n"
            f"and extract them into:\n  {args.raw_dir}\n",
            file=sys.stderr,
        )
        return 1

    logger.info(
        "Acquisition complete for %s (%d archive file(s)).",
        DATASET_DOI,
        len(manifest["downloaded_files"]),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
