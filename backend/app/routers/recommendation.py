from fastapi import APIRouter, HTTPException
from app.schemas.recommendation import RecommendationFilter, RecommendationResponse
from app.services.bgg_service import search_games

router = APIRouter(prefix="/recommendations", tags=["recommendation"])


@router.post("", response_model=RecommendationResponse)
async def get_recommendations(filters: RecommendationFilter):
    """
    Q&A 필터 결과를 받아 조건에 맞는 보드게임 목록을 반환.

    - player_count: 인원 수
    - play_style: cooperative(협력) | competitive(경쟁) | both
    - difficulty: easy | medium | hard
    - play_time: short(<30분) | medium(30~90분) | long(>90분)
    """
    try:
        games, relaxed_filters = await search_games(filters)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"BGG API 오류: {str(e)}")

    return RecommendationResponse(games=games, total=len(games), relaxed_filters=relaxed_filters)
