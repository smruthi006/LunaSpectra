"""SQLAlchemy 2 ORM models for LunaSpectra Phase 1 real CLASS data."""

from __future__ import annotations

from app.db.base import Base
from sqlalchemy import Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship


class DatasetModel(Base):
    __tablename__ = "datasets"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    doi: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    contributor: Mapped[str] = mapped_column(String(128), nullable=False)
    institution: Mapped[str] = mapped_column(String(256), nullable=False)
    license: Mapped[str] = mapped_column(String(64), nullable=False)
    source_url: Mapped[str] = mapped_column(String(512), nullable=False)
    data_origin: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    observation_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[str] = mapped_column(String(64), nullable=False)

    source_products: Mapped[list[SourceProductModel]] = relationship(
        back_populates="dataset", cascade="all, delete-orphan"
    )
    observations: Mapped[list[ObservationModel]] = relationship(
        back_populates="dataset", cascade="all, delete-orphan"
    )


class SourceProductModel(Base):
    __tablename__ = "source_products"
    __table_args__ = (
        UniqueConstraint("dataset_id", "relative_path", name="uq_source_product_rel_path"),
        UniqueConstraint("dataset_id", "checksum_sha256", name="uq_source_product_checksum"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    dataset_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    original_filename: Mapped[str] = mapped_column(String(256), nullable=False)
    relative_path: Mapped[str] = mapped_column(String(512), nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    format: Mapped[str] = mapped_column(String(64), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    parse_status: Mapped[str] = mapped_column(String(32), nullable=False)
    parse_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[str] = mapped_column(String(64), nullable=False)

    dataset: Mapped[DatasetModel] = relationship(back_populates="source_products")


class ObservationModel(Base):
    __tablename__ = "observations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    observation_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    dataset_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    observation_date: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    acquisition_start_time: Mapped[str | None] = mapped_column(String(64), nullable=True)
    acquisition_end_time: Mapped[str | None] = mapped_column(String(64), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    footprint_geometry: Mapped[str | None] = mapped_column(Text, nullable=True)
    exposure: Mapped[float | None] = mapped_column(Float, nullable=True)
    data_origin: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[str] = mapped_column(String(64), nullable=False)

    dataset: Mapped[DatasetModel] = relationship(back_populates="observations")
    spectra: Mapped[list[SpectrumModel]] = relationship(
        back_populates="observation", cascade="all, delete-orphan"
    )
    line_fluxes: Mapped[list[ElementalLineFluxModel]] = relationship(
        back_populates="observation", cascade="all, delete-orphan"
    )
    abundances: Mapped[list[ElementalAbundanceModel]] = relationship(
        back_populates="observation", cascade="all, delete-orphan"
    )


class SpectrumModel(Base):
    __tablename__ = "spectra"
    __table_args__ = (
        Index("ix_spectra_obs_type", "observation_id", "spectrum_type"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    observation_id: Mapped[str | None] = mapped_column(
        String(64), ForeignKey("observations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    source_product_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("source_products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    spectrum_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    point_count: Mapped[int] = mapped_column(Integer, nullable=False)
    energy_or_channel_json: Mapped[str] = mapped_column(Text, nullable=False)
    measured_value_json: Mapped[str] = mapped_column(Text, nullable=False)
    uncertainty_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    energy_unit: Mapped[str | None] = mapped_column(String(64), nullable=True)
    value_unit: Mapped[str] = mapped_column(String(64), nullable=False)

    observation: Mapped[ObservationModel | None] = relationship(back_populates="spectra")
    source_product: Mapped[SourceProductModel] = relationship()


class ElementalLineFluxModel(Base):
    __tablename__ = "elemental_line_fluxes"
    __table_args__ = (
        Index("ix_line_flux_obs_elem", "observation_id", "element"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    observation_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("observations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_product_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("source_products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    element: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    spectral_line: Mapped[str | None] = mapped_column(String(32), nullable=True)
    line_energy: Mapped[float | None] = mapped_column(Float, nullable=True)
    line_flux: Mapped[float | None] = mapped_column(Float, nullable=True)
    uncertainty: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(64), nullable=False)
    row_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    observation: Mapped[ObservationModel] = relationship(back_populates="line_fluxes")
    source_product: Mapped[SourceProductModel] = relationship()


class ElementalAbundanceModel(Base):
    __tablename__ = "elemental_abundances"
    __table_args__ = (
        UniqueConstraint(
            "observation_id", "source_product_id", "element", name="uq_abundance_obs_elem"
        ),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    observation_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("observations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_product_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("source_products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    element: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    abundance: Mapped[float | None] = mapped_column(Float, nullable=True)
    uncertainty: Mapped[float | None] = mapped_column(Float, nullable=True)
    uncertainty_upper: Mapped[float | None] = mapped_column(Float, nullable=True)
    uncertainty_lower: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    derivation_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    observation: Mapped[ObservationModel] = relationship(back_populates="abundances")
    source_product: Mapped[SourceProductModel] = relationship()
