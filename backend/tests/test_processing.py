"""Tests for processing pipeline: nulls, units, element normalization, and provenance."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from scripts.process_class_data import process_dataset


def test_process_outputs_preserve_nulls_units_elements_and_provenance(
    schema_raw_dir: Path, tmp_path: Path
) -> None:
    processed_dir = tmp_path / "processed"
    report = process_dataset(schema_raw_dir, processed_dir)

    assert report["valid"] is True
    assert report["output_counts"]["observations"] == 2
    assert report["output_counts"]["abundances"] == 4

    obs_df = pd.read_parquet(processed_dir / "observations.parquet")
    # Coordinates are absent in real source -> must remain null, never 0
    assert obs_df["latitude"].isna().all()
    assert obs_df["longitude"].isna().all()
    assert obs_df["footprint_geometry"].isna().all()

    may_row = obs_df.loc[obs_df["observation_id"] == "CLASS_20200529"].iloc[0]
    # STARTIME=0 sentinel in 290520 FITS must map to null, not "0"
    assert pd.isna(may_row["acquisition_start_time"])
    assert may_row["exposure"] == 16.0

    # Element normalization: Ca-Ka and Ca-Kb normalized to element="Ca" with spectral_line preserved
    flux_df = pd.read_parquet(processed_dir / "line_fluxes.parquet")
    ca_rows = flux_df.loc[flux_df["element"] == "Ca"]
    assert len(ca_rows) == 2
    assert set(ca_rows["spectral_line"]) == {"Ca-Ka", "Ca-Kb"}
    assert (ca_rows["unit"] == "photons/cm2/s").all()

    # Unit & asymmetric uncertainty preservation in abundances
    abund_df = pd.read_parquet(processed_dir / "abundances.parquet")
    assert (abund_df["unit"] == "wt%").all()
    ca_abund = abund_df.loc[abund_df["element"] == "Ca"].iloc[0]
    assert ca_abund["abundance"] == 9.0
    assert pd.isna(ca_abund["uncertainty"])
    assert ca_abund["uncertainty_upper"] == 3.0
    assert ca_abund["uncertainty_lower"] == 1.0

    provenance = json.loads((processed_dir / "provenance.json").read_text(encoding="utf-8"))
    assert provenance["dataset"]["doi"] == "10.17632/6mmd96j5bg.1"
    assert "Indian Space Science Data Centre" in provenance["attribution"]["isro_acknowledgement"]
