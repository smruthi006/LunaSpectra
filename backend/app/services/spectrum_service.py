"""Service layer for spectrum serialization and deterministic downsampling."""

from __future__ import annotations

import json

from app.db.models import SpectrumModel
from app.schemas.spectrum import SpectrumOut


def downsample_series(
    xs: list[float],
    ys: list[float],
    errs: list[float] | None,
    max_points: int | None,
) -> tuple[list[float], list[float], list[float] | None, bool]:
    """Deterministically stride-sample spectral arrays when max_points < len(xs)."""
    n = len(xs)
    if max_points is None or max_points >= n or max_points <= 0:
        return xs, ys, errs, False
    if max_points == 1:
        return [xs[0]], [ys[0]], ([errs[0]] if errs is not None else None), True

    # Uniform index selection preserving endpoints
    indices = sorted(
        {round(i * (n - 1) / (max_points - 1)) for i in range(max_points)}
    )
    sampled_x = [xs[idx] for idx in indices]
    sampled_y = [ys[idx] for idx in indices]
    sampled_e = [errs[idx] for idx in indices] if errs is not None else None
    return sampled_x, sampled_y, sampled_e, True


def serialize_spectrum(spec: SpectrumModel, max_points: int | None = None) -> SpectrumOut:
    """Convert SpectrumModel JSON columns into a typed SpectrumOut schema."""
    xs = [float(v) for v in json.loads(spec.energy_or_channel_json)]
    ys = [float(v) for v in json.loads(spec.measured_value_json)]
    errs = (
        [float(v) for v in json.loads(spec.uncertainty_json)]
        if spec.uncertainty_json is not None
        else None
    )
    sx, sy, se, downsampled = downsample_series(xs, ys, errs, max_points)
    return SpectrumOut(
        id=spec.id,
        observation_id=spec.observation_id or "",
        source_product_id=spec.source_product_id,
        spectrum_type=spec.spectrum_type,
        point_count=spec.point_count,
        returned_point_count=len(sx),
        downsampled=downsampled,
        energy_or_channel=sx,
        measured_value=sy,
        uncertainty=se,
        energy_unit=spec.energy_unit,
        value_unit=spec.value_unit,
    )
