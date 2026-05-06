from fastapi import APIRouter, HTTPException
from app.schemas.recommendation import GameSummary
from app.services.bgg_service import fetch_game_detail

router = APIRouter(prefix="/games", tags=["games"])


@router.get("/{bgg_id}", response_model=GameSummary)
async def get_game_detail(bgg_id: int):
    """
    BGG ID로 게임 상세 정보 조회.
    description(최대 1000자), 썸네일, 인원, 플레이 시간, 난이도(weight) 포함.
    """
    game = await fetch_game_detail(bgg_id)
    if game is None:
        raise HTTPException(status_code=404, detail="게임을 찾을 수 없습니다.")
    return game
