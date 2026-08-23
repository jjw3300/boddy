from pydantic import BaseModel


class CafeSummary(BaseModel):
    id: str
    name: str
    address: str
    road_address: str | None
    phone: str | None
    lat: float
    lng: float
    distance_m: int | None  # 검색 기준 좌표로부터의 거리 (m)
    place_url: str  # 카카오맵 상세 페이지 (앱/웹에서 열기)


class CafeSearchResponse(BaseModel):
    cafes: list[CafeSummary]
    total: int
