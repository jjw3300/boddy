import asyncio
import httpx
import xmltodict
from typing import Literal
from app.config import settings
from app.schemas.recommendation import GameSummary, RecommendationFilter
from app.services import cache

# ───────────────────────────── 상수 ─────────────────────────────

DIFFICULTY_RANGE = {
    "easy": (1.0, 2.0),
    "medium": (2.0, 3.5),
    "hard": (3.5, 5.0),
}

PLAY_TIME_RANGE = {
    "short": (0, 30),
    "medium": (30, 90),
    "long": (90, 9999),
}

COOPERATIVE_MECHANIC_ID = "2023"

GAME_TYPE_MECHANIC_IDS = {
    "luck": {"2072", "2661", "2041"},   # Dice Rolling, Push Your Luck, Roll/Spin and Move
    "dexterity": {"2878"},              # Dexterity
}
GAME_TYPE_CATEGORY_IDS = {
    "dexterity": {"1107"},
    "party": {"1030"},
    "strategy": {"1015", "1009"},
}

MAX_RETRIES = 3
RETRY_DELAY = 2.0  # 초


# ───────────────────────────── 공개 API ─────────────────────────────

async def search_games(filters: RecommendationFilter) -> list[GameSummary]:
    """필터 조건에 맞는 게임 목록 반환 (최대 20개)."""
    raw_games = await _fetch_hot_games()
    game_ids = [g["id"] for g in raw_games[:50]]
    detailed_games = await _fetch_game_details(game_ids)
    return _apply_filters(detailed_games, filters)[:20]


async def fetch_game_detail(bgg_id: int) -> GameSummary | None:
    """단일 게임 상세 정보 반환 (description 포함)."""
    cache_key = f"game_detail:{bgg_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    items = await _fetch_game_details([str(bgg_id)])
    if not items:
        return None

    game = items[0]
    detected_type = _detect_game_type(game)
    summary = _parse_game(game, detected_type, include_description=True)

    cache.set(cache_key, summary, ttl=60 * 60 * 6)  # 6시간 캐시
    return summary


# ───────────────────────────── BGG API 호출 ─────────────────────────────

async def _fetch_hot_games() -> list[dict]:
    cache_key = "hot_games"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{settings.bgg_api_base_url}/hot?type=boardgame"
    data = await _get_with_retry(url)

    items = data.get("items", {}).get("item", [])
    if isinstance(items, dict):
        items = [items]

    result = [{"id": item["@id"], "name": item["name"]["@value"]} for item in items]
    cache.set(cache_key, result, ttl=60 * 30)  # 30분 캐시
    return result


async def _fetch_game_details(game_ids: list[str]) -> list[dict]:
    # 이미 캐시된 항목은 건너뜀
    cached_items = []
    uncached_ids = []
    for gid in game_ids:
        hit = cache.get(f"game_raw:{gid}")
        if hit is not None:
            cached_items.append(hit)
        else:
            uncached_ids.append(gid)

    fetched_items = []
    chunk_size = 20

    async with httpx.AsyncClient(timeout=20.0) as client:
        for i in range(0, len(uncached_ids), chunk_size):
            chunk = uncached_ids[i : i + chunk_size]
            ids_str = ",".join(chunk)
            url = f"{settings.bgg_api_base_url}/thing?id={ids_str}&stats=1"

            raw = await _get_with_retry(url, client=client)
            items = raw.get("items", {}).get("item", [])
            if isinstance(items, dict):
                items = [items]

            for item in items:
                cache.set(f"game_raw:{item['@id']}", item, ttl=60 * 60 * 6)

            fetched_items.extend(items)

            if i + chunk_size < len(uncached_ids):
                await asyncio.sleep(0.5)  # BGG API 요청 제한 방지

    return cached_items + fetched_items


async def _get_with_retry(
    url: str,
    client: httpx.AsyncClient | None = None,
) -> dict:
    """GET 요청 + 지수 백오프 재시도."""
    should_close = client is None
    if client is None:
        client = httpx.AsyncClient(timeout=20.0)

    last_error: Exception | None = None
    try:
        for attempt in range(MAX_RETRIES):
            try:
                response = await client.get(url)
                response.raise_for_status()
                return xmltodict.parse(response.text)
            except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
                last_error = e
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAY * (2 ** attempt))
        raise RuntimeError(f"BGG API 요청 실패 ({MAX_RETRIES}회 재시도): {last_error}")
    finally:
        if should_close:
            await client.aclose()


# ───────────────────────────── 필터링 ─────────────────────────────

def _apply_filters(games: list[dict], filters: RecommendationFilter) -> list[GameSummary]:
    result = []
    for game in games:
        try:
            detected_type = _detect_game_type(game)
            summary = _parse_game(game, detected_type)
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

        if filters.game_type is not None and detected_type != filters.game_type:
            continue

        result.append(summary)
    return result


# ───────────────────────────── 파싱 / 판별 ─────────────────────────────

def _detect_game_type(game: dict) -> Literal["luck", "dexterity", "party", "strategy"] | None:
    links = game.get("link", [])
    if isinstance(links, dict):
        links = [links]

    mechanic_ids = {l["@id"] for l in links if l.get("@type") == "boardgamemechanic"}
    category_ids = {l["@id"] for l in links if l.get("@type") == "boardgamecategory"}

    if mechanic_ids & GAME_TYPE_MECHANIC_IDS["dexterity"] or category_ids & GAME_TYPE_CATEGORY_IDS["dexterity"]:
        return "dexterity"
    if category_ids & GAME_TYPE_CATEGORY_IDS["party"]:
        return "party"
    if mechanic_ids & GAME_TYPE_MECHANIC_IDS["luck"]:
        return "luck"
    if category_ids & GAME_TYPE_CATEGORY_IDS["strategy"]:
        return "strategy"
    return None


def _parse_game(
    game: dict,
    game_type=None,
    include_description: bool = False,
) -> GameSummary:
    names = game.get("name", [])
    if isinstance(names, dict):
        names = [names]
    primary_name = next(
        (n["@value"] for n in names if n.get("@type") == "primary"), "Unknown"
    )

    stats = game.get("statistics", {}).get("ratings", {})
    weight = float(stats.get("averageweight", {}).get("@value", 0) or 0)

    description = None
    if include_description:
        raw_desc = game.get("description", "")
        # BGG description은 HTML 엔티티 포함 — 기본 정리만
        description = raw_desc.replace("&#10;", "\n").replace("&mdash;", "—").strip()
        description = description[:1000] if description else None  # 최대 1000자

    return GameSummary(
        bgg_id=int(game["@id"]),
        name=primary_name,
        thumbnail=game.get("thumbnail"),
        min_players=int(game.get("minplayers", {}).get("@value", 1) or 1),
        max_players=int(game.get("maxplayers", {}).get("@value", 10) or 10),
        play_time=int(game.get("playingtime", {}).get("@value", 0) or 0),
        weight=round(weight, 2),
        description=description,
        game_type=game_type,
    )


def _is_cooperative(game: dict) -> bool:
    links = game.get("link", [])
    if isinstance(links, dict):
        links = [links]
    return any(
        l.get("@type") == "boardgamemechanic" and l.get("@id") == COOPERATIVE_MECHANIC_ID
        for l in links
    )
