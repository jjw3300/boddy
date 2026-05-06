import asyncio
import httpx
import xmltodict
from app.config import settings
from app.schemas.recommendation import GameSummary, RecommendationFilter

# BGG 복잡도(weight) 기준
DIFFICULTY_RANGE = {
    "easy": (1.0, 2.0),
    "medium": (2.0, 3.5),
    "hard": (3.5, 5.0),
}

# 플레이 타임 기준 (분)
PLAY_TIME_RANGE = {
    "short": (0, 30),
    "medium": (30, 90),
    "long": (90, 9999),
}

# 협력/경쟁 BGG 카테고리 ID
COOPERATIVE_MECHANIC_ID = "2023"  # Co-operative Play


async def search_games(filters: RecommendationFilter) -> list[GameSummary]:
    """BGG API를 통해 필터 조건에 맞는 게임 목록을 반환."""
    # BGG API는 직접 필터 검색을 지원하지 않아 인기 게임 목록에서 필터링
    raw_games = await _fetch_hot_games()
    game_ids = [g["id"] for g in raw_games[:50]]  # 상위 50개 기준

    detailed_games = await _fetch_game_details(game_ids)
    filtered = _apply_filters(detailed_games, filters)

    return filtered[:20]  # 최대 20개 반환


async def _fetch_hot_games() -> list[dict]:
    """BGG 인기 게임 목록 조회."""
    url = f"{settings.bgg_api_base_url}/hot?type=boardgame"
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url)
        response.raise_for_status()

    data = xmltodict.parse(response.text)
    items = data.get("items", {}).get("item", [])
    if isinstance(items, dict):
        items = [items]

    return [{"id": item["@id"], "name": item["name"]["@value"]} for item in items]


async def _fetch_game_details(game_ids: list[str]) -> list[dict]:
    """BGG에서 게임 상세 정보 일괄 조회 (최대 20개씩 분할 요청)."""
    results = []
    chunk_size = 20

    async with httpx.AsyncClient(timeout=20.0) as client:
        for i in range(0, len(game_ids), chunk_size):
            chunk = game_ids[i : i + chunk_size]
            ids_str = ",".join(chunk)
            url = f"{settings.bgg_api_base_url}/thing?id={ids_str}&stats=1"

            response = await client.get(url)
            response.raise_for_status()

            data = xmltodict.parse(response.text)
            items = data.get("items", {}).get("item", [])
            if isinstance(items, dict):
                items = [items]

            results.extend(items)
            await asyncio.sleep(0.5)  # BGG API 요청 제한 방지

    return results


def _apply_filters(games: list[dict], filters: RecommendationFilter) -> list[GameSummary]:
    result = []

    for game in games:
        try:
            summary = _parse_game(game)
        except Exception:
            continue

        if filters.player_count is not None:
            if not (summary.min_players <= filters.player_count <= summary.max_players):
                continue

        if filters.difficulty is not None:
            min_w, max_w = DIFFICULTY_RANGE[filters.difficulty]
            if not (min_w <= summary.weight < max_w):
                continue

        if filters.play_time is not None:
            min_t, max_t = PLAY_TIME_RANGE[filters.play_time]
            if not (min_t <= summary.play_time < max_t):
                continue

        if filters.play_style is not None and filters.play_style != "both":
            is_coop = _is_cooperative(game)
            if filters.play_style == "cooperative" and not is_coop:
                continue
            if filters.play_style == "competitive" and is_coop:
                continue

        result.append(summary)

    return result


def _parse_game(game: dict) -> GameSummary:
    names = game.get("name", [])
    if isinstance(names, dict):
        names = [names]
    primary_name = next(
        (n["@value"] for n in names if n.get("@type") == "primary"), "Unknown"
    )

    stats = game.get("statistics", {}).get("ratings", {})
    weight = float(stats.get("averageweight", {}).get("@value", 0) or 0)

    return GameSummary(
        bgg_id=int(game["@id"]),
        name=primary_name,
        thumbnail=game.get("thumbnail"),
        min_players=int(game.get("minplayers", {}).get("@value", 1) or 1),
        max_players=int(game.get("maxplayers", {}).get("@value", 10) or 10),
        play_time=int(game.get("playingtime", {}).get("@value", 0) or 0),
        weight=round(weight, 2),
        description=None,  # 목록에서는 description 생략
    )


def _is_cooperative(game: dict) -> bool:
    links = game.get("link", [])
    if isinstance(links, dict):
        links = [links]
    return any(
        link.get("@type") == "boardgamemechanic"
        and link.get("@id") == COOPERATIVE_MECHANIC_ID
        for link in links
    )
