from sqlalchemy import select
from app.db import async_session
from app.models import GameMetadata


async def get_metadata_map(bgg_ids: list[int]) -> dict[int, GameMetadata]:
    """주어진 bgg_id들에 대한 큐레이션 데이터를 한 번에 조회."""
    if not bgg_ids:
        return {}
    async with async_session() as session:
        result = await session.execute(
            select(GameMetadata).where(GameMetadata.bgg_id.in_(bgg_ids))
        )
        return {row.bgg_id: row for row in result.scalars().all()}


async def get_seed_bgg_ids() -> list[int]:
    """추천 풀 확장용 시드 게임 id 목록 (is_seed=True인 행들)."""
    async with async_session() as session:
        result = await session.execute(
            select(GameMetadata.bgg_id).where(GameMetadata.is_seed.is_(True))
        )
        return [row[0] for row in result.all()]


async def upsert_metadata(bgg_id: int, **fields) -> None:
    """시드/큐레이션 스크립트에서 쓰는 upsert. None이 아닌 필드만 반영."""
    async with async_session() as session:
        existing = await session.get(GameMetadata, bgg_id)
        if existing is None:
            existing = GameMetadata(bgg_id=bgg_id)
            session.add(existing)
        for key, value in fields.items():
            if value is not None:
                setattr(existing, key, value)
        await session.commit()


async def bulk_mark_seed(bgg_ids: list[int]) -> None:
    """대량 랭킹 데이터 임포트용. 개별 upsert_metadata(id당 세션+커밋)는
    수백~수천 개 규모에서 너무 느려서, 세션 1개·커밋 1번으로 처리한다."""
    if not bgg_ids:
        return
    async with async_session() as session:
        result = await session.execute(
            select(GameMetadata).where(GameMetadata.bgg_id.in_(bgg_ids))
        )
        existing_map = {row.bgg_id: row for row in result.scalars().all()}

        for bgg_id in bgg_ids:
            row = existing_map.get(bgg_id)
            if row is None:
                session.add(GameMetadata(bgg_id=bgg_id, is_seed=True))
            else:
                row.is_seed = True

        await session.commit()
