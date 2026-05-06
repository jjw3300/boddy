from pydantic import BaseModel
from typing import Literal


class RecommendationFilter(BaseModel):
    player_count: int | None = None
    play_style: Literal["cooperative", "competitive", "both"] | None = None
    difficulty: Literal["easy", "medium", "hard"] | None = None
    play_time: Literal["short", "medium", "long"] | None = None  # <30m, 30~90m, >90m


class GameSummary(BaseModel):
    bgg_id: int
    name: str
    thumbnail: str | None
    min_players: int
    max_players: int
    play_time: int  # 분 단위
    weight: float  # BGG 복잡도 (1~5)
    description: str | None


class RecommendationResponse(BaseModel):
    games: list[GameSummary]
    total: int
