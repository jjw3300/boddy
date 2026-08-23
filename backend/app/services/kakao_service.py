import httpx
from app.config import settings
from app.schemas.cafe import CafeSummary
from app.services import cache

KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
DEFAULT_QUERY = "보드게임카페"
MAX_RADIUS_M = 20000  # 카카오 로컬 API 반경 상한


async def search_nearby_cafes(
    lat: float,
    lng: float,
    radius_m: int,
    query: str = DEFAULT_QUERY,
) -> list[CafeSummary]:
    """주어진 좌표 기준 반경 내 보드게임 카페 검색 (거리순, 최대 15곳)."""
    if not settings.kakao_rest_api_key:
        raise RuntimeError(
            "카카오 API 키가 설정되지 않았습니다. "
            "https://developers.kakao.com 에서 앱 등록 후 REST API 키를 발급받아 "
            "backend/.env의 KAKAO_REST_API_KEY에 설정하세요."
        )

    radius_m = min(radius_m, MAX_RADIUS_M)
    cache_key = f"cafes:{query}:{round(lat, 3)}:{round(lng, 3)}:{radius_m}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    headers = {"Authorization": f"KakaoAK {settings.kakao_rest_api_key}"}
    params = {
        "query": query,
        "x": str(lng),  # 카카오 API는 x=경도, y=위도
        "y": str(lat),
        "radius": radius_m,
        "sort": "distance",
        "size": 15,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(KEYWORD_SEARCH_URL, headers=headers, params=params)

    if response.status_code == 401:
        raise RuntimeError("카카오 API 인증 실패: REST API 키를 확인하세요.")
    response.raise_for_status()

    data = response.json()
    results = [_parse_document(doc) for doc in data.get("documents", [])]

    cache.set(cache_key, results, ttl=60 * 10)  # 10분 캐시
    return results


def _parse_document(doc: dict) -> CafeSummary:
    distance = doc.get("distance")
    return CafeSummary(
        id=doc["id"],
        name=doc["place_name"],
        address=doc["address_name"],
        road_address=doc.get("road_address_name") or None,
        phone=doc.get("phone") or None,
        lat=float(doc["y"]),
        lng=float(doc["x"]),
        distance_m=int(distance) if distance else None,
        place_url=doc["place_url"],
    )
