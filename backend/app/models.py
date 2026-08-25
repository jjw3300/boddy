from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base


class GameMetadata(Base):
    """BGG API에 없는, 우리가 직접 큐레이션하는 게임별 부가 정보.
    질문 트리(Q7~Q9 등: 운/실력 비율·상호작용 강도·룰 복잡도·리플레이성·
    다운타임·테마·손맛/비주얼·테이블 공간)와 한국어 정발명이 채워지는 자리 —
    지금은 없는 값이 많고, 확인되는 대로 하나씩 채워나간다."""

    __tablename__ = "game_metadata"

    bgg_id: Mapped[int] = mapped_column(primary_key=True)

    # 한국어 이름 — 정발명이면 "official", 커뮤니티에서 통용되는 이름이면
    # "community". 없으면 둘 다 None이고 영어 원문을 그대로 쓴다.
    korean_name: Mapped[str | None] = mapped_column(String, nullable=True)
    name_source: Mapped[str | None] = mapped_column(String, nullable=True)

    # 장르 소분류 태그 (recommendationTaxonomy의 GenreTag id 배열, 예:
    # ["worker_placement", "deck_building"])
    mechanisms: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # 질문 트리 신규 축 — 전부 해당 질문의 옵션 id 값(예: 'luck:high')을 그대로 저장
    luck_level: Mapped[str | None] = mapped_column(String, nullable=True)
    interaction_level: Mapped[str | None] = mapped_column(String, nullable=True)
    rule_complexity: Mapped[str | None] = mapped_column(String, nullable=True)
    replayability: Mapped[str | None] = mapped_column(String, nullable=True)
    downtime: Mapped[str | None] = mapped_column(String, nullable=True)
    theme: Mapped[str | None] = mapped_column(String, nullable=True)
    visual_style: Mapped[str | None] = mapped_column(String, nullable=True)
    table_space: Mapped[str | None] = mapped_column(String, nullable=True)

    # 추천 풀 확장용 시드 목록 소속 여부 — true인 행들이 /hot과 합쳐져서
    # 후보 풀이 된다 (예전 SEED_GAME_TITLES를 대체)
    is_seed: Mapped[bool] = mapped_column(Boolean, default=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
