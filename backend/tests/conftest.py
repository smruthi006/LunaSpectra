"""Shared pytest fixtures building small schema-faithful FITS/ASCII test bundles."""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import numpy as np
import pytest
from app.db.initialize import initialize_database
from app.db.session import create_app_engine, create_session_factory, get_db
from app.main import create_app
from astropy.io import fits
from fastapi.testclient import TestClient
from scripts.process_class_data import process_dataset
from scripts.seed_database import seed_from_processed
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session


def _write_minimal_fits(
    path: Path,
    *,
    channels: list[int],
    counts: list[float],
    startime: str | int,
    endtime: str,
    exposure: float,
    stat_err: list[float] | None = None,
) -> None:
    cols = [
        fits.Column(name="CHANNEL", format="1I", array=np.array(channels, dtype=np.int16)),
        fits.Column(
            name="COUNTS", format="1D", unit="count", array=np.array(counts, dtype=np.float64)
        ),
    ]
    if stat_err is not None:
        cols.append(
            fits.Column(name="STAT_ERR", format="1E", array=np.array(stat_err, dtype=np.float32))
        )
    hdu_primary = fits.PrimaryHDU()
    hdu_table = fits.BinTableHDU.from_columns(cols, name="SPECTRUM")
    hdu_table.header["TELESCOP"] = "CHANDRAYAAN-2"
    hdu_table.header["INSTRUME"] = "CLASS"
    hdu_table.header["STARTIME"] = startime
    hdu_table.header["ENDTIME"] = endtime
    hdu_table.header["EXPOSURE"] = exposure
    hdu_table.header["HDUCLAS3"] = "COUNT"
    fits.HDUList([hdu_primary, hdu_table]).writeto(path, overwrite=True)


def build_schema_fixture_tree(root: Path) -> Path:
    """Create a minimal schema-compatible directory matching CLASS Mendeley v1 layout."""
    repo = root / "data_repository"
    nov = repo / "181120"
    may = repo / "290520"
    calib = repo / "CALIBRATION_SPECTRA"
    solar = repo / "SOLAR_DATA"
    for d in (nov, may, calib, solar):
        d.mkdir(parents=True, exist_ok=True)

    (repo / "README").write_text(
        "Fig 15,16,17,19 data: R1 in 181120, R2 in 290520\n", encoding="utf-8"
    )

    # 181120 files
    _write_minimal_fits(
        nov / "ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000.fits",
        channels=list(range(16)),
        counts=[float(i * 2) for i in range(16)],
        startime="2019-11-18T12:58:48.000",
        endtime="2019-11-18T13:05:04.000",
        exposure=368.0,
    )
    _write_minimal_fits(
        nov / "background_allevents.fits",
        channels=list(range(16)),
        counts=[float(i) for i in range(16)],
        startime="15-Sep-2019",
        endtime="30-May-2020",
        exposure=441000.0,
    )
    (nov / "flux_18nov_spec2.txt").write_text(
        "#Flux in units of photons/cm2/s from R2 XRF spectrum\n"
        "O\terr\tNa\terr\tMg\terr\tAl\terr\tSi\terr\n"
        "7.05\t0.36\t0.013\t0.0003\t0.02\t0.005\t0.015\t0.004\t0.027\t0.005\n",
        encoding="utf-8",
    )
    (nov / "R2_abundance.txt").write_text(
        "#Na Mg Al Si Ca in weight %\n"
        "pixel_2=[2.0,5.0,8.0,18.0]  ; Central value\n"
        "pixel_2_pluserr=[1.0,1.0,2.0,1.0] ; upper limit\n"
        "pixel_2_minuserr=[1.0,1.0,1.0,2.0]  ; lower limit\n",
        encoding="utf-8",
    )

    # 290520 files (with STARTIME=0 sentinel and Ca-Ka/Ca-Kb)
    _write_minimal_fits(
        may / "ch2_cla_scd_all_time_added_20200529T104532257-20200529T104548257.fits",
        channels=list(range(16)),
        counts=[float(i * 3) for i in range(16)],
        startime=0,
        endtime="2020-05-29T10:45:48.257",
        exposure=16.0,
    )
    _write_minimal_fits(
        may / "ch2_cla_l1_20200529T100116257_20200529T100124257.fits",
        channels=list(range(16)),
        counts=[1.0 for _ in range(16)],
        startime=0,
        endtime="20200529T100124257",
        exposure=8.0,
    )
    (may / "flux_29may.txt").write_text(
        "#O\terr\tMg\terr\tAl\terr\tSi\terr\tCa-Ka\terr-a\tCa-Kb\terrb\tFe\terr\n"
        "18.4\t4\t0.32\t0.05\t1.33\t0.06\t1.7\t0.07\t0.47\t0.03\t0.06\t0.01\t0.15\t0.02\n",
        encoding="utf-8",
    )
    (may / "R1_abundance.txt").write_text(
        "# Mg Al Si Ca in weight %\n"
        "pixel_29may=[3 13 16 9] ; central value\n"
        "pixel_29may_perr=[1,1,1,3] ; Upper limit\n"
        "pixel_29may_nerr=[1,1,1,1] ; lower limit\n",
        encoding="utf-8",
    )

    # SOLAR_DATA
    _write_minimal_fits(
        solar / "CH2_XSM_20191118_90853504_90853624.pha",
        channels=list(range(12)),
        counts=[float(i * 5) for i in range(12)],
        startime="2019-11-18 00:00:00.73500000",
        endtime="2019-11-18 23:59:59.64100000",
        exposure=37.0,
        stat_err=[0.5 for _ in range(12)],
    )
    (solar / "chianti_isothermal_spectrum_T17p6E6_EM2p7E46.txt").write_text(
        "0.10 100.0\n0.20 200.0\n0.30 150.0\n",
        encoding="utf-8",
    )

    # CALIBRATION_SPECTRA
    (calib / "SCD_0_11_added_t1.txt").write_text("0 1.0\n1 2.0\n2 3.0\n", encoding="utf-8")
    (calib / "ch2_cla_scd_all_time_added_0-38_t1.txt").write_text(
        "CHANNEL COUNTS\n1I 1E\ncount\n0 11.0\n1 5.0\n",
        encoding="utf-8",
    )
    return root


@pytest.fixture()
def schema_raw_dir(tmp_path: Path) -> Path:
    return build_schema_fixture_tree(tmp_path / "raw")


@pytest.fixture()
def seeded_engine(schema_raw_dir: Path, tmp_path: Path) -> Generator[Engine, None, None]:
    processed_dir = tmp_path / "processed"
    process_dataset(schema_raw_dir, processed_dir)
    db_path = tmp_path / "test_lunaspectra.db"
    engine = create_app_engine(f"sqlite:///{db_path.as_posix()}")
    seed_from_processed(processed_dir, engine=engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def seeded_client(seeded_engine: Engine) -> Generator[TestClient, None, None]:
    session_factory = create_session_factory(seeded_engine)
    app = create_app()

    def override_get_db() -> Generator[Session, None, None]:
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture()
def empty_client(tmp_path: Path) -> Generator[TestClient, None, None]:
    db_path = tmp_path / "empty.db"
    engine = create_app_engine(f"sqlite:///{db_path.as_posix()}")
    initialize_database(engine)
    session_factory = create_session_factory(engine)
    app = create_app()

    def override_get_db() -> Generator[Session, None, None]:
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    engine.dispose()
