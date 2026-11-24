"""Repository queries for observations, spectra, line fluxes, abundances, and source products."""

from __future__ import annotations

from app.db.models import (
    ElementalAbundanceModel,
    ElementalLineFluxModel,
    ObservationModel,
    SourceProductModel,
    SpectrumModel,
)
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload


class ObservationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_observations(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        observation_date: str | None = None,
        element: str | None = None,
        has_abundance: bool | None = None,
        has_spectrum: bool | None = None,
        sort: str = "observation_date_asc",
    ) -> tuple[list[ObservationModel], int]:
        stmt = select(ObservationModel).options(
            selectinload(ObservationModel.spectra),
            selectinload(ObservationModel.abundances),
            selectinload(ObservationModel.line_fluxes),
        )

        if observation_date:
            stmt = stmt.where(ObservationModel.observation_date == observation_date)

        if element:
            norm_elem = element.strip()
            has_elem_ab = select(ElementalAbundanceModel.id).where(
                ElementalAbundanceModel.observation_id == ObservationModel.id,
                func.lower(ElementalAbundanceModel.element) == norm_elem.lower(),
            ).exists()
            has_elem_fl = select(ElementalLineFluxModel.id).where(
                ElementalLineFluxModel.observation_id == ObservationModel.id,
                func.lower(ElementalLineFluxModel.element) == norm_elem.lower(),
            ).exists()
            stmt = stmt.where(or_(has_elem_ab, has_elem_fl))

        if has_abundance is True:
            stmt = stmt.where(
                select(ElementalAbundanceModel.id)
                .where(ElementalAbundanceModel.observation_id == ObservationModel.id)
                .exists()
            )
        elif has_abundance is False:
            stmt = stmt.where(
                ~select(ElementalAbundanceModel.id)
                .where(ElementalAbundanceModel.observation_id == ObservationModel.id)
                .exists()
            )

        if has_spectrum is True:
            stmt = stmt.where(
                select(SpectrumModel.id)
                .where(SpectrumModel.observation_id == ObservationModel.id)
                .exists()
            )
        elif has_spectrum is False:
            stmt = stmt.where(
                ~select(SpectrumModel.id)
                .where(SpectrumModel.observation_id == ObservationModel.id)
                .exists()
            )

        if sort == "observation_date_desc":
            stmt = stmt.order_by(
                ObservationModel.observation_date.desc(), ObservationModel.observation_id.desc()
            )
        elif sort == "exposure_desc":
            stmt = stmt.order_by(
                ObservationModel.exposure.desc().nullslast(), ObservationModel.observation_id.asc()
            )
        elif sort == "observation_id_asc":
            stmt = stmt.order_by(ObservationModel.observation_id.asc())
        else:
            stmt = stmt.order_by(
                ObservationModel.observation_date.asc(), ObservationModel.observation_id.asc()
            )

        count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
        total_items = int(self.db.scalar(count_stmt) or 0)

        offset = (page - 1) * page_size
        items: list[ObservationModel] = list(
            self.db.scalars(stmt.offset(offset).limit(page_size)).all()
        )
        return items, total_items

    def get_by_identifier(self, identifier: str) -> ObservationModel | None:
        stmt = (
            select(ObservationModel)
            .where(
                or_(
                    ObservationModel.observation_id == identifier,
                    ObservationModel.id == identifier,
                )
            )
            .options(
                selectinload(ObservationModel.spectra),
                selectinload(ObservationModel.line_fluxes),
                selectinload(ObservationModel.abundances),
                selectinload(ObservationModel.dataset),
            )
        )
        return self.db.scalars(stmt).first()

    def get_source_products_for_observation(
        self, obs: ObservationModel
    ) -> list[SourceProductModel]:
        sp_ids = {s.source_product_id for s in obs.spectra}
        sp_ids.update(f.source_product_id for f in obs.line_fluxes)
        sp_ids.update(a.source_product_id for a in obs.abundances)
        if not sp_ids:
            return []
        stmt = (
            select(SourceProductModel)
            .where(SourceProductModel.id.in_(sorted(sp_ids)))
            .order_by(SourceProductModel.relative_path.asc())
        )
        return list(self.db.scalars(stmt).all())
