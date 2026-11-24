"""Adapter for genuine Chandrayaan-2 CLASS Mendeley v1 dataset (DOI: 10.17632/6mmd96j5bg.1)."""

from __future__ import annotations

import hashlib
import re
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.adapters.base import DatasetAdapter
from app.core.constants import (
    DATA_ORIGIN_MISSION,
    DATASET_CONTRIBUTOR,
    DATASET_DOI,
    DATASET_ID,
    DATASET_INSTITUTION,
    DATASET_LICENSE,
    DATASET_NAME,
    DATASET_SOURCE_URL,
    DATASET_VERSION,
)
from astropy.io import fits

SCIENCE_HEADER_KEYS = (
    "TELESCOP",
    "INSTRUME",
    "DETNAM",
    "FILTER",
    "OBJECT",
    "ORIGIN",
    "CREATOR",
    "FILENAME",
    "PROGRAM",
    "DATE",
    "DATE-OBS",
    "DATE-END",
    "STARTIME",
    "ENDTIME",
    "TSTART",
    "TSTOP",
    "MJDREF",
    "TIMESYS",
    "TIMEUNIT",
    "EXPOSURE",
    "ONTIME",
    "LIVETIME",
    "HDUCLASS",
    "HDUCLAS1",
    "HDUCLAS2",
    "HDUCLAS3",
    "EXTNAME",
    "CHANTYPE",
    "DETCHANS",
    "RESPFILE",
    "ANCRFILE",
    "BACKFILE",
    "CORRFILE",
    "EQUINOX",
    "LAT",
    "LON",
    "LATITUDE",
    "LONGITUD",
    "BORESIGHT",
    "RA_OBJ",
    "DEC_OBJ",
)

COORD_PATTERN = re.compile(
    r"^(LAT|LON|LATITUDE|LONGITUD|RA_OBJ|DEC_OBJ|COORD|FOOTPRINT|BORESIGHT|CORNER)",
    re.IGNORECASE,
)
DATE_PATTERN = re.compile(r"(DATE|TIME|TSTART|TSTOP|STARTIME|ENDTIME|MJD)", re.IGNORECASE)
ELEMENT_TOKENS = ("O", "Na", "Mg", "Al", "Si", "Ca", "Ti", "Fe", "Fe-55")


def compute_sha256(path: Path) -> str:
    """Compute SHA-256 hex digest of a file."""
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def deterministic_id(prefix: str, key: str) -> str:
    """Build a deterministic short identifier from prefix and natural key."""
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}_{digest}"


def _detect_elements_in_text(text: str) -> list[str]:
    found: list[str] = []
    for elem in ELEMENT_TOKENS:
        if re.search(rf"(?<![A-Za-z0-9]){re.escape(elem)}(?![A-Za-z0-9])", text):
            found.append(elem)
    return found


def inspect_fits_file(path: Path) -> dict[str, Any]:
    """Inspect a FITS or PHA file using Astropy without printing binary contents."""
    hdu_names: list[str] = []
    header_metadata: dict[str, Any] = {}
    column_names: list[str] = []
    units: list[str] = []
    date_meta: dict[str, Any] = {}
    coord_meta: dict[str, Any] = {}
    row_count: int | None = None

    with fits.open(path, memmap=False) as hdul:
        for idx, hdu in enumerate(hdul):
            hdu_name = str(hdu.name or f"HDU_{idx}")
            hdu_names.append(hdu_name)
            hdr = hdu.header
            for key in hdr:
                if not key or key in ("COMMENT", "HISTORY"):
                    continue
                val = hdr[key]
                if key in SCIENCE_HEADER_KEYS or key.startswith(("TTYPE", "TUNIT")):
                    header_metadata[f"{hdu_name}.{key}"] = val
                if DATE_PATTERN.search(key) and not key.startswith(("TTYPE", "TUNIT")):
                    date_meta[f"{hdu_name}.{key}"] = val
                if COORD_PATTERN.search(key):
                    coord_meta[f"{hdu_name}.{key}"] = val
                if key.startswith("TUNIT") and str(val).strip():
                    units.append(str(val).strip())

            if getattr(hdu, "columns", None) is not None:
                cols = list(hdu.columns.names)
                column_names.extend(cols)
                for col in hdu.columns:
                    if col.unit:
                        units.append(str(col.unit).strip())
                if hdu.data is not None:
                    row_count = (row_count or 0) + int(len(hdu.data))

    return {
        "detected_format": "PHA_FITS" if path.suffix.lower() == ".pha" else "FITS",
        "open_success": True,
        "row_count": row_count,
        "column_names": sorted(set(column_names)),
        "fits_hdu_names": hdu_names,
        "fits_header_metadata": header_metadata,
        "units": sorted(set(units)),
        "date_metadata": date_meta,
        "coordinate_metadata": coord_meta,
        "elemental_info": [],
        "error_message": None,
    }


def inspect_text_file(path: Path) -> dict[str, Any]:
    """Inspect ASCII spectral tables, flux tables, abundance files, or READMEs."""
    raw_text = path.read_text(encoding="utf-8", errors="replace")
    lines = [line for line in raw_text.splitlines() if line.strip()]
    units: list[str] = []
    columns: list[str] = []
    elements = _detect_elements_in_text(raw_text)
    date_meta: dict[str, Any] = {}
    coord_meta: dict[str, Any] = {}

    if "weight %" in raw_text.lower():
        units.append("wt%")
    if "photons/cm2/s" in raw_text.lower():
        units.append("photons/cm2/s")
    if "photons/s" in raw_text.lower():
        units.append("photons/s")
    if "0.0135 kev" in raw_text.lower():
        units.append("keV (0.0135 * CHANNEL)")

    date_matches = re.findall(
        r"(20\d{2}-\d{2}-\d{2}|20\d{6}T\d{6,9}|\b\d{2}\s+(?:Nov|May)\w*\s+20\d{2}\b)",
        raw_text,
        re.IGNORECASE,
    )
    fname_dates = re.findall(r"(20\d{6}T\d{6,9}|20\d{6})", path.name)
    if date_matches or fname_dates:
        date_meta["matched_tokens"] = sorted(set(date_matches + fname_dates))

    data_rows = 0
    detected_format = "TEXT_README" if path.name.upper().startswith("README") else "TXT"
    if lines:
        first = lines[0].strip()
        if first.startswith("CHANNEL"):
            detected_format = "TXT_OGIP_SPECTRUM_TABLE"
            columns = first.split()
            if len(lines) >= 3 and "count" in lines[2].lower():
                units.append(lines[2].strip())
                data_rows = max(0, len(lines) - 3)
            elif len(lines) >= 2 and re.match(r"^\d+[A-Z]\b", lines[1].strip()):
                data_rows = max(0, len(lines) - 2)
        elif first.startswith("#Flux") or (
            len(lines) >= 2 and lines[0].lstrip("#").strip().startswith("O")
        ):
            detected_format = "TXT_LINE_FLUX_TABLE"
            header_line = lines[1] if first.startswith("#Flux") else lines[0]
            columns = header_line.lstrip("#").strip().split()
            data_rows = sum(
                1
                for ln in lines
                if not ln.strip().startswith("#") and not ln.strip().startswith("O ")
            )
            if first.startswith("#Flux"):
                data_rows = sum(1 for ln in lines[2:] if not ln.strip().startswith("#"))
        elif "weight %" in raw_text.lower() or "abundance" in path.name.lower():
            detected_format = "TXT_ABUNDANCE_SCRIPT"
            columns = ["element_array", "upper_err", "lower_err"]
            data_rows = sum(1 for ln in lines if "=" in ln and not ln.strip().startswith("#"))
        elif re.match(r"^\s*\d+(\.\d+)?\s+[-+]?\d", first):
            detected_format = "TXT_NUMERIC_TWO_COL"
            columns = ["col_0", "col_1"]
            data_rows = len(lines)
        else:
            data_rows = len(lines)

    return {
        "detected_format": detected_format,
        "open_success": True,
        "row_count": data_rows,
        "column_names": columns,
        "fits_hdu_names": [],
        "fits_header_metadata": {},
        "units": sorted(set(units)),
        "date_metadata": date_meta,
        "coordinate_metadata": coord_meta,
        "elemental_info": elements,
        "error_message": None,
    }


def inspect_zip_file(path: Path) -> dict[str, Any]:
    """Inspect a ZIP archive's member listing without extracting."""
    with zipfile.ZipFile(path, "r") as zf:
        members = zf.namelist()
    return {
        "detected_format": "ZIP_ARCHIVE",
        "open_success": True,
        "row_count": len(members),
        "column_names": [],
        "fits_hdu_names": [],
        "fits_header_metadata": {"archive_member_count": len(members)},
        "units": [],
        "date_metadata": {},
        "coordinate_metadata": {},
        "elemental_info": [],
        "error_message": None,
    }


def inspect_single_file(path: Path, raw_dir: Path) -> dict[str, Any]:
    """Inspect one file and return full inventory metadata."""
    rel_path = path.relative_to(raw_dir).as_posix()
    ext = path.suffix.lower() or "(none)"
    base_record: dict[str, Any] = {
        "relative_path": rel_path,
        "original_filename": path.name,
        "extension": ext,
        "file_size_bytes": path.stat().st_size,
        "sha256": compute_sha256(path),
    }
    try:
        if ext in {".fits", ".pha", ".fit", ".fts"}:
            details = inspect_fits_file(path)
        elif ext == ".zip":
            details = inspect_zip_file(path)
        elif ext in {".txt", ".csv", ".dat", ".xml", ".json"} or path.name.upper().startswith(
            "README"
        ):
            details = inspect_text_file(path)
        else:
            details = {
                "detected_format": f"UNSUPPORTED_{ext}",
                "open_success": False,
                "row_count": None,
                "column_names": [],
                "fits_hdu_names": [],
                "fits_header_metadata": {},
                "units": [],
                "date_metadata": {},
                "coordinate_metadata": {},
                "elemental_info": [],
                "error_message": f"Unsupported file extension: {ext}",
            }
    except Exception as exc:  # noqa: BLE001
        details = {
            "detected_format": f"ERROR_{ext}",
            "open_success": False,
            "row_count": None,
            "column_names": [],
            "fits_hdu_names": [],
            "fits_header_metadata": {},
            "units": [],
            "date_metadata": {},
            "coordinate_metadata": {},
            "elemental_info": [],
            "error_message": str(exc),
        }
    return {**base_record, **details}


def _parse_numeric_bracket_list(line: str) -> list[float]:
    match = re.search(r"\[([^\]]+)\]", line)
    if not match:
        raise ValueError(f"Expected bracketed numeric list in line: {line}")
    inner = match.group(1).replace(",", " ")
    return [float(tok) for tok in inner.split() if tok.strip()]


class ClassMendeleyAdapter(DatasetAdapter):
    """Deterministic adapter for the Chandrayaan-2 CLASS Mendeley v1 dataset."""

    def __init__(self, raw_dir: Path) -> None:
        super().__init__(raw_dir)
        self._data_root = self._resolve_data_root()
        self._created_at = datetime.now(UTC).isoformat()

    def _resolve_data_root(self) -> Path:
        candidate: Path = self.raw_dir / "data_repository"
        if candidate.is_dir():
            return candidate
        return Path(self.raw_dir)

    def _product_id_for(self, path: Path) -> str:
        rel = path.relative_to(self.raw_dir).as_posix()
        return deterministic_id("sp", f"{DATASET_ID}:{rel}")

    def describe_source(self) -> dict[str, Any]:
        observations = self.load_observations()
        return {
            "id": DATASET_ID,
            "name": DATASET_NAME,
            "doi": DATASET_DOI,
            "version": DATASET_VERSION,
            "contributor": DATASET_CONTRIBUTOR,
            "institution": DATASET_INSTITUTION,
            "license": DATASET_LICENSE,
            "source_url": DATASET_SOURCE_URL,
            "data_origin": DATA_ORIGIN_MISSION,
            "description": (
                "Genuine Chandrayaan-2 CLASS lunar X-ray spectral data, background spectra, "
                "XSM solar data, modelled X-ray line flux, and weight-percent abundance outputs "
                "for 18 November 2019 and 29 May 2020."
            ),
            "observation_count": len(observations),
            "created_at": self._created_at,
        }

    def inventory_files(self) -> list[dict[str, Any]]:
        if not self.raw_dir.exists():
            raise FileNotFoundError(f"Raw directory does not exist: {self.raw_dir}")
        files = sorted(p for p in self.raw_dir.rglob("*") if p.is_file())
        inventory: list[dict[str, Any]] = []
        for path in files:
            rec = inspect_single_file(path, self.raw_dir)
            rec["source_product_id"] = self._product_id_for(path)
            inventory.append(rec)
        return inventory

    def _build_source_products(self) -> list[dict[str, Any]]:
        records = self.inventory_files()
        products: list[dict[str, Any]] = []
        for rec in records:
            rel = rec["relative_path"]
            parse_status = "parsed" if rec["open_success"] else "unsupported"
            parse_error = rec["error_message"]

            if rel.endswith("R2_abundance.txt") and rec["open_success"]:
                parse_status = "warning"
                parse_error = (
                    "Header lists 5 elements (Na, Mg, Al, Si, Ca) while arrays contain 4 values "
                    "[2.0, 5.0, 8.0, 18.0]; element alignment withheld to avoid guessing."
                )
            elif rec["detected_format"] in {"TEXT_README", "ZIP_ARCHIVE"}:
                parse_status = "reference_only"

            products.append(
                {
                    "id": rec["source_product_id"],
                    "dataset_id": DATASET_ID,
                    "original_filename": rec["original_filename"],
                    "relative_path": rel,
                    "checksum_sha256": rec["sha256"],
                    "format": rec["detected_format"],
                    "file_size": rec["file_size_bytes"],
                    "source_url": DATASET_SOURCE_URL,
                    "parse_status": parse_status,
                    "parse_error": parse_error,
                    "created_at": self._created_at,
                }
            )
        return products

    def validate_source(self) -> dict[str, Any]:
        errors: list[str] = []
        warnings: list[str] = []
        if not self.raw_dir.exists():
            errors.append(f"Raw directory missing: {self.raw_dir}")
            return {"valid": False, "errors": errors, "warnings": warnings}

        products = self._build_source_products()
        unsupported = [p for p in products if p["parse_status"] in {"unsupported", "error"}]
        for item in unsupported:
            warnings.append(
                f"Unparsed file {item['relative_path']}: {item['parse_error']}"
            )

        expected_obs_dirs = ["181120", "290520"]
        for d in expected_obs_dirs:
            if not (self._data_root / d).is_dir():
                errors.append(f"Expected observation directory missing: {d}")

        r2_path = self._data_root / "181120" / "R2_abundance.txt"
        if r2_path.is_file():
            warnings.append(
                "181120/R2_abundance.txt header lists 5 elements (Na, Mg, Al, Si, Ca) but arrays "
                "contain 4 entries; numeric values are not assigned to guessed element names."
            )

        warnings.append(
            "Geospatial coordinates (latitude, longitude) and footprint corners are absent across "
            "all files in DOI 10.17632/6mmd96j5bg.1; map availability is false."
        )
        warnings.append(
            "Root README labels 181120 as R1 and 290520 as R2, whereas subfolder files use "
            "181120/R2_abundance.txt (README_R2) and 290520/R1_abundance.txt (README_R1)."
        )
        warnings.append(
            "290520 CLASS FITS headers store STARTIME=0 sentinel; "
            "acquisition_start_time is stored as null."
        )

        return {
            "valid": len(errors) == 0,
            "file_count": len(products),
            "errors": errors,
            "warnings": warnings,
        }

    def load_observations(self) -> list[dict[str, Any]]:
        observations: list[dict[str, Any]] = []

        nov_fits = (
            self._data_root
            / "181120"
            / "ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000.fits"
        )
        if nov_fits.is_file():
            with fits.open(nov_fits, memmap=False) as hdul:
                hdr = hdul[1].header
                start_val = str(hdr.get("STARTIME")).strip() if hdr.get("STARTIME") else None
                end_val = str(hdr.get("ENDTIME")).strip() if hdr.get("ENDTIME") else None
                exposure = float(hdr["EXPOSURE"]) if hdr.get("EXPOSURE") is not None else None
            observations.append(
                {
                    "id": "obs_class_20191118",
                    "observation_id": "CLASS_20191118",
                    "dataset_id": DATASET_ID,
                    "observation_date": "2019-11-18",
                    "acquisition_start_time": start_val if start_val != "0" else None,
                    "acquisition_end_time": end_val,
                    "latitude": None,
                    "longitude": None,
                    "footprint_geometry": None,
                    "exposure": exposure,
                    "data_origin": DATA_ORIGIN_MISSION,
                    "created_at": self._created_at,
                }
            )

        may_fits = (
            self._data_root
            / "290520"
            / "ch2_cla_scd_all_time_added_20200529T104532257-20200529T104548257.fits"
        )
        if may_fits.is_file():
            with fits.open(may_fits, memmap=False) as hdul:
                hdr = hdul[1].header
                raw_start = hdr.get("STARTIME")
                start_val = (
                    str(raw_start).strip()
                    if raw_start not in (None, 0, "0", "")
                    else None
                )
                end_val = str(hdr.get("ENDTIME")).strip() if hdr.get("ENDTIME") else None
                exposure = float(hdr["EXPOSURE"]) if hdr.get("EXPOSURE") is not None else None
            observations.append(
                {
                    "id": "obs_class_20200529",
                    "observation_id": "CLASS_20200529",
                    "dataset_id": DATASET_ID,
                    "observation_date": "2020-05-29",
                    "acquisition_start_time": start_val,
                    "acquisition_end_time": end_val,
                    "latitude": None,
                    "longitude": None,
                    "footprint_geometry": None,
                    "exposure": exposure,
                    "data_origin": DATA_ORIGIN_MISSION,
                    "created_at": self._created_at,
                }
            )

        return observations

    def _read_fits_spectrum(
        self,
        path: Path,
        observation_id: str | None,
        spectrum_type: str,
    ) -> dict[str, Any]:
        with fits.open(path, memmap=False) as hdul:
            data = hdul[1].data
            hdr = hdul[1].header
            channels = [float(x) for x in data["CHANNEL"].tolist()]
            counts = [float(x) for x in data["COUNTS"].tolist()]
            uncertainty: list[float] | None = None
            if "STAT_ERR" in data.names:
                uncertainty = [float(x) for x in data["STAT_ERR"].tolist()]
            unit = str(hdr.get("TUNIT2") or hdr.get("HDUCLAS3") or "count").strip().lower()
            value_unit = "count" if unit == "count" else unit
        return {
            "id": deterministic_id("spec", f"{observation_id}:{spectrum_type}:{path.name}"),
            "observation_id": observation_id,
            "source_product_id": self._product_id_for(path),
            "spectrum_type": spectrum_type,
            "energy_or_channel": channels,
            "measured_value": counts,
            "uncertainty": uncertainty,
            "energy_unit": "channel",
            "value_unit": value_unit,
        }

    def _read_two_col_ascii_spectrum(
        self,
        path: Path,
        observation_id: str | None,
        spectrum_type: str,
        energy_unit: str | None,
        value_unit: str,
    ) -> dict[str, Any]:
        xs: list[float] = []
        ys: list[float] = []
        for raw_line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            stripped = raw_line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            parts = stripped.split()
            if len(parts) < 2:
                continue
            try:
                x_val = float(parts[0])
                y_val = float(parts[1])
            except ValueError:
                continue
            xs.append(x_val)
            ys.append(y_val)
        return {
            "id": deterministic_id("spec", f"{observation_id}:{spectrum_type}:{path.name}"),
            "observation_id": observation_id,
            "source_product_id": self._product_id_for(path),
            "spectrum_type": spectrum_type,
            "energy_or_channel": xs,
            "measured_value": ys,
            "uncertainty": None,
            "energy_unit": energy_unit,
            "value_unit": value_unit,
        }

    def load_spectra(self) -> list[dict[str, Any]]:
        spectra: list[dict[str, Any]] = []

        mapping = [
            (
                self._data_root
                / "181120"
                / "ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000.fits",
                "obs_class_20191118",
                "source",
            ),
            (
                self._data_root / "181120" / "background_allevents.fits",
                "obs_class_20191118",
                "background",
            ),
            (
                self._data_root
                / "290520"
                / "ch2_cla_scd_all_time_added_20200529T104532257-20200529T104548257.fits",
                "obs_class_20200529",
                "source",
            ),
            (
                self._data_root
                / "290520"
                / "ch2_cla_l1_20200529T100116257_20200529T100124257.fits",
                "obs_class_20200529",
                "background",
            ),
            (
                self._data_root / "SOLAR_DATA" / "CH2_XSM_20191118_90853504_90853624.pha",
                "obs_class_20191118",
                "solar_xsm",
            ),
        ]
        for path, obs_pk, spec_type in mapping:
            if path.is_file():
                spectra.append(self._read_fits_spectrum(path, obs_pk, spec_type))

        chianti_path = (
            self._data_root / "SOLAR_DATA" / "chianti_isothermal_spectrum_T17p6E6_EM2p7E46.txt"
        )
        if chianti_path.is_file():
            spectra.append(
                self._read_two_col_ascii_spectrum(
                    chianti_path,
                    "obs_class_20191118",
                    "solar_model",
                    energy_unit=None,
                    value_unit="photons/s",
                )
            )

        preflight = self._data_root / "CALIBRATION_SPECTRA" / "SCD_0_11_added_t1.txt"
        if preflight.is_file():
            spectra.append(
                self._read_two_col_ascii_spectrum(
                    preflight,
                    None,
                    "calibration_preflight",
                    energy_unit="channel",
                    value_unit="count",
                )
            )

        postflight = (
            self._data_root / "CALIBRATION_SPECTRA" / "ch2_cla_scd_all_time_added_0-38_t1.txt"
        )
        if postflight.is_file():
            spectra.append(
                self._read_two_col_ascii_spectrum(
                    postflight,
                    None,
                    "calibration_postflight",
                    energy_unit="channel",
                    value_unit="count",
                )
            )

        return spectra

    def load_line_fluxes(self) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []

        nov_flux = self._data_root / "181120" / "flux_18nov_spec2.txt"
        if nov_flux.is_file():
            lines = [
                ln.strip()
                for ln in nov_flux.read_text(encoding="utf-8", errors="replace").splitlines()
                if ln.strip()
            ]
            # Expected format:
            # #Flux in units of photons/cm2/s ...
            # O err Na err Mg err Al err Si err
            # values...
            cols = lines[1].lstrip("#").strip().split()
            data_lines = [ln for ln in lines[2:] if not ln.startswith("#")]
            sp_id = self._product_id_for(nov_flux)
            for row_idx, row_str in enumerate(data_lines):
                vals = [float(v) for v in row_str.split()]
                for i in range(0, len(cols), 2):
                    elem = cols[i]
                    flux_val = vals[i]
                    err_val = vals[i + 1] if i + 1 < len(vals) else None
                    results.append(
                        {
                            "id": deterministic_id("flux", f"obs_class_20191118:{row_idx}:{elem}"),
                            "observation_id": "obs_class_20191118",
                            "source_product_id": sp_id,
                            "element": elem,
                            "spectral_line": None,
                            "line_energy": None,
                            "line_flux": flux_val,
                            "uncertainty": err_val,
                            "unit": "photons/cm2/s",
                            "row_index": row_idx,
                        }
                    )

        may_flux = self._data_root / "290520" / "flux_29may.txt"
        if may_flux.is_file():
            lines = [
                ln.strip()
                for ln in may_flux.read_text(encoding="utf-8", errors="replace").splitlines()
                if ln.strip()
            ]
            cols = lines[0].lstrip("#").strip().split()
            data_lines = [ln for ln in lines[1:] if not ln.startswith("#")]
            sp_id = self._product_id_for(may_flux)
            for row_idx, row_str in enumerate(data_lines):
                vals = [float(v) for v in row_str.split()]
                for i in range(0, len(cols), 2):
                    raw_col = cols[i]
                    if raw_col.startswith("Ca-"):
                        elem = "Ca"
                        spectral_line: str | None = raw_col
                    else:
                        elem = raw_col
                        spectral_line = None
                    flux_val = vals[i]
                    err_val = vals[i + 1] if i + 1 < len(vals) else None
                    line_key = spectral_line or elem
                    results.append(
                        {
                            "id": deterministic_id(
                                "flux", f"obs_class_20200529:{row_idx}:{line_key}"
                            ),
                            "observation_id": "obs_class_20200529",
                            "source_product_id": sp_id,
                            "element": elem,
                            "spectral_line": spectral_line,
                            "line_energy": None,
                            "line_flux": flux_val,
                            "uncertainty": err_val,
                            "unit": "photons/cm2/s",
                            "row_index": row_idx,
                        }
                    )

        return results

    def load_abundances(self) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []

        r1_path = self._data_root / "290520" / "R1_abundance.txt"
        if r1_path.is_file():
            lines = [
                ln.strip()
                for ln in r1_path.read_text(encoding="utf-8", errors="replace").splitlines()
                if ln.strip()
            ]
            # Header: "# Mg Al Si Ca in weight %"
            header_tokens = lines[0].lstrip("#").strip().split()
            valid_elements = ("O", "Na", "Mg", "Al", "Si", "Ca", "Ti", "Fe")
            elements = [tok for tok in header_tokens if tok in valid_elements]
            central_vals = _parse_numeric_bracket_list(lines[1])
            upper_errs = _parse_numeric_bracket_list(lines[2])
            lower_errs = _parse_numeric_bracket_list(lines[3])

            if len(elements) == len(central_vals) == len(upper_errs) == len(lower_errs):
                sp_id = self._product_id_for(r1_path)
                for elem, val, u_err, l_err in zip(
                    elements, central_vals, upper_errs, lower_errs, strict=True
                ):
                    sym_err = u_err if u_err == l_err else None
                    results.append(
                        {
                            "id": deterministic_id("abund", f"obs_class_20200529:{elem}"),
                            "observation_id": "obs_class_20200529",
                            "source_product_id": sp_id,
                            "element": elem,
                            "abundance": val,
                            "uncertainty": sym_err,
                            "uncertainty_upper": u_err,
                            "uncertainty_lower": l_err,
                            "unit": "wt%",
                            "derivation_note": (
                                "Derived using X2ABUNDANCE code as reported in "
                                "290520/R1_abundance.txt; asymmetric upper/lower "
                                "uncertainties preserved."
                            ),
                        }
                    )

        return results

    def build_provenance(self) -> dict[str, Any]:
        validation = self.validate_source()
        source_products = self._build_source_products()
        return {
            "dataset": self.describe_source(),
            "raw_dir": str(self.raw_dir),
            "generated_at_utc": self._created_at,
            "source_product_count": len(source_products),
            "source_products": source_products,
            "validation": validation,
            "attribution": {
                "isro_acknowledgement": (
                    "We acknowledge the use of data from the Chandrayaan-II, second lunar "
                    "mission of the Indian Space Research Organisation (ISRO), archived at the "
                    "Indian Space Science Data Centre (ISSDC)."
                ),
                "mendeley_citation": (
                    f"{DATASET_CONTRIBUTOR} ({DATASET_INSTITUTION}), {DATASET_NAME}, "
                    f"Mendeley Data, V{DATASET_VERSION}, DOI: {DATASET_DOI}, "
                    f"License: {DATASET_LICENSE}."
                ),
            },
        }
