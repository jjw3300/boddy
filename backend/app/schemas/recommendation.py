from pydantic import BaseModel
from typing import Literal


class RecommendationFilter(BaseModel):
    player_count: int | None = None
    play_style: Literal["cooperative", "competitive", "both"] | None = None
    difficulty: Literal["easy", "medium", "hard"] | None = None
    play_time: Literal["short", "medium", "long"] | None = None  # <30m, 30~90m, >90m
    game_type: Literal["luck", "dexterity", "party", "strategy"] | None = None
    # luck(운빨): 주사위·카드 운 요소 중심
    # dexterity(피지컬): 손재주·반사신경 필요
    # party(파티): 가볍고 웃긴 파티 게임
    # strategy(뇌지컬): 전략·두뇌 싸움 중심


class GameSummary(BaseModel):
    bgg_id: int
    name: str
    thumbnail: str | None
    min_players: int
    max_players: int
    play_time: int  # 분 단위
    weight: float  # BGG 복잡도 (1~5)
    description: str | None
    game_type: Literal["luck", "dexterity", "party", "strategy"] | None = None


class RecommendationResponse(BaseModel):
    games: list[GameSummary]
    total: int
