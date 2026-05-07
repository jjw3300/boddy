from fastapi import APIRouter, HTTPException, Query
from app.schemas.recommendation import GameSummary
from app.services.bgg_service import fetch_game_detail, search_games_by_name

router = APIRouter(prefix="/games", tags=["games"])


@router.get("/search")
async def search_games(q: str = Query(..., min_length=1)):
    """게임 이름으로 BGG 검색 (최대 10개)."""
    return await search_games_by_name(q)


@router.get("/{bgg_id}", response_model=GameSummary)
async def get_game_detail(bgg_id: int):
    """BGG ID로 게임 상세 정보 조회."""
    game = await fetch_game_detail(bgg_id)
    if game is None:
        raise HTTPException(status_code=404, detail="게임을 찾을 수 없습니다.")
    return game
