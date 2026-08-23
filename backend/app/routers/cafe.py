from fastapi import APIRouter, HTTPException, Query
from app.schemas.cafe import CafeSearchResponse
from app.services.kakao_service import search_nearby_cafes

router = APIRouter(prefix="/cafes", tags=["cafe"])


@router.get("", response_model=CafeSearchResponse)
async def get_nearby_cafes(
    lat: float = Query(..., description="현재 위치 위도"),
    lng: float = Query(..., description="현재 위치 경도"),
    radius: int = Query(2000, ge=100, le=20000, description="검색 반경 (m)"),
):
    """현재 위치 기준 반경 내 보드게임 카페 목록 (거리순)."""
    try:
        cafes = await search_nearby_cafes(lat, lng, radius)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"카카오 API 오류: {str(e)}")

    return CafeSearchResponse(cafes=cafes, total=len(cafes))
