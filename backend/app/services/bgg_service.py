import asyncio
import urllib.parse
import httpx
import xmltodict
from typing import Literal
from app.config import settings
from app.schemas.recommendation import GameSummary, RecommendationFilter
from app.services import cache
from app.services.translate_service import translate_to_korean
from app.services import game_metadata_service

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

async def search_games(filters: RecommendationFilter) -> tuple[list[GameSummary], list[str]]:
    """필터 조건에 맞는 게임 목록 반환 (최대 20개, 순위 매김) + 완화된 필터 목록."""
    hot_games, seed_games = await asyncio.gather(_fetch_hot_games(), _fetch_seed_games())

    seen_ids: set[str] = set()
    merged: list[dict] = []
    for g in hot_games + seed_games:
        if g["id"] not in seen_ids:
            seen_ids.add(g["id"])
            merged.append(g)

    game_ids = [g["id"] for g in merged]
    detailed_games = await _fetch_game_details(game_ids)
    metadata_map = await game_metadata_service.get_metadata_map([int(gid) for gid in game_ids])
    return _apply_filters(detailed_games, filters, metadata_map)


async def search_games_by_name(query: str) -> list[dict]:
    """BGG 게임 이름 검색 결과 반환 (최대 10개)."""
    encoded = urllib.parse.quote(query)
    url = f"{settings.bgg_api_base_url}/search?query={encoded}&type=boardgame"
    data = await _get_with_retry(url)

    items = data.get("items", {}).get("item", [])
    if isinstance(items, dict):
        items = [items]

    results = []
    for item in items[:10]:
        name_data = item.get("name", {})
        if isinstance(name_data, list):
            name = next(
                (n["@value"] for n in name_data if n.get("@type") == "primary"),
                name_data[0]["@value"] if name_data else "Unknown",
            )
        elif isinstance(name_data, dict):
            name = name_data.get("@value", "Unknown")
        else:
            name = "Unknown"

        year_data = item.get("yearpublished", {})
        year = year_data.get("@value") if isinstance(year_data, dict) else None

        results.append({"bgg_id": int(item["@id"]), "name": name, "year": year})

    return results


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
    metadata_map = await game_metadata_service.get_metadata_map([bgg_id])
    korean_name = metadata_map.get(bgg_id).korean_name if bgg_id in metadata_map else None
    summary = _parse_game(game, detected_type, include_description=True, korean_name_override=korean_name)

    if summary.description:
        translated = await translate_to_korean(summary.description)
        if translated:
            summary.description = translated

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


async def _fetch_seed_games() -> list[dict]:
    """DB에 미리 저장해둔 시드 게임 id 목록 (app/scripts/seed_games.py로 채움).
    예전엔 앱이 매 콜드 캐시마다 /search를 70번 호출해서 느렸는데, 이제 DB
    조회 한 번으로 끝난다 — BGG API 호출 없음."""
    ids = await game_metadata_service.get_seed_bgg_ids()
    return [{"id": str(bgg_id), "name": ""} for bgg_id in ids]


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


def _auth_headers() -> dict[str, str]:
    """BGG는 2025-07부터 XML API에 앱 등록 토큰을 요구함.
    https://boardgamegeek.com/using_the_xml_api 에서 발급받아 .env의
    BGG_API_TOKEN에 설정하면 자동으로 실린다."""
    if settings.bgg_api_token:
        return {"Authorization": f"Bearer {settings.bgg_api_token}"}
    return {}


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
                response = await client.get(url, headers=_auth_headers())
                if response.status_code in (401, 403):
                    # 인증 문제는 재시도해도 해결되지 않음 — 즉시 실패
                    raise RuntimeError(
                        "BGG API 인증 실패: BGG_API_TOKEN이 없거나 유효하지 않습니다. "
                        "https://boardgamegeek.com/using_the_xml_api 에서 토큰을 발급받아 "
                        "backend/.env의 BGG_API_TOKEN에 설정하세요."
                    )
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

# 조건에 맞는 게임이 하나도 없을 때, 이 순서대로 하나씩 하드 필터를 풀어서
# 재시도한다 — 시간/난이도는 비교적 relax하기 쉽고, 인원수는 실제로 몇 명이
# 모였는지에 달린 물리적 제약이라 가장 마지막에 푼다. 장르 대분류는 애초에
# 하드 필터가 아니라 스코어링에만 반영되므로 이 목록에 없다.
_FALLBACK_ORDER = ["play_time", "difficulty", "play_style", "player_count"]


def _passes_hard_filters(
    summary: GameSummary,
    is_coop: bool,
    filters: RecommendationFilter,
    active: set[str],
) -> bool:
    if "player_count" in active and filters.player_count is not None:
        if not (summary.min_players <= filters.player_count <= summary.max_players):
            return False

    if "difficulty" in active and filters.difficulty is not None:
        min_w, max_w = DIFFICULTY_RANGE[filters.difficulty]
        if not (min_w <= summary.weight < max_w):
            return False

    if "play_time" in active and filters.play_time is not None:
        min_t, max_t = PLAY_TIME_RANGE[filters.play_time]
        if not (min_t <= summary.play_time < max_t):
            return False

    if "play_style" in active and filters.play_style is not None and filters.play_style != "both":
        if filters.play_style == "cooperative" and not is_coop:
            return False
        if filters.play_style == "competitive" and is_coop:
            return False

    return True


def _score_game(
    summary: GameSummary,
    detected_type: str | None,
    is_coop: bool,
    filters: RecommendationFilter,
) -> float:
    """조건에 얼마나 잘 맞는지 점수화. 장르 대분류는 하드 필터가 아니라
    여기서만 반영된다 — 맞으면 가산점, 안 맞아도 탈락시키지 않는다."""
    score = 0.0

    if filters.game_type is not None:
        score += 3.0 if detected_type == filters.game_type else 0.0

    if filters.difficulty is not None:
        min_w, max_w = DIFFICULTY_RANGE[filters.difficulty]
        if min_w <= summary.weight < max_w:
            score += 2.0
        else:
            mid = (min_w + max_w) / 2
            score -= min(abs(summary.weight - mid), 3.0) * 0.3

    if filters.play_time is not None:
        min_t, max_t = PLAY_TIME_RANGE[filters.play_time]
        if min_t <= summary.play_time < max_t:
            score += 2.0
        else:
            mid = min_t if max_t >= 9999 else (min_t + max_t) / 2
            score -= min(abs(summary.play_time - mid) / 30, 3.0) * 0.3

    if filters.player_count is not None:
        if summary.min_players <= filters.player_count <= summary.max_players:
            score += 2.0

    if filters.play_style is not None and filters.play_style != "both":
        wants_coop = filters.play_style == "cooperative"
        if wants_coop == is_coop:
            score += 2.0

    return score


def _apply_filters(
    games: list[dict],
    filters: RecommendationFilter,
    metadata_map: dict[int, "game_metadata_service.GameMetadata"] | None = None,
) -> tuple[list[GameSummary], list[str]]:
    metadata_map = metadata_map or {}
    parsed: list[tuple[GameSummary, str | None, bool]] = []
    for game in games:
        try:
            detected_type = _detect_game_type(game)
            meta = metadata_map.get(int(game["@id"]))
            summary = _parse_game(game, detected_type, korean_name_override=meta.korean_name if meta else None)
            is_coop = _is_cooperative(game)
        except Exception:
            continue
        parsed.append((summary, detected_type, is_coop))

    active = {"player_count", "difficulty", "play_time", "play_style"}
    relaxed: list[str] = []
    matched = [p for p in parsed if _passes_hard_filters(p[0], p[2], filters, active)]

    for field in _FALLBACK_ORDER:
        if matched:
            break
        active.discard(field)
        relaxed.append(field)
        matched = [p for p in parsed if _passes_hard_filters(p[0], p[2], filters, active)]

    # 그래도 하나도 없으면(극단적으로 좁은 풀) 전체 후보를 스코어링만으로 추천
    if not matched:
        matched = parsed

    matched.sort(key=lambda p: _score_game(p[0], p[1], p[2], filters), reverse=True)

    result = []
    for rank, (summary, _, _) in enumerate(matched[:20], start=1):
        summary.rank = rank
        result.append(summary)

    return result, relaxed


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
    korean_name_override: str | None = None,
) -> GameSummary:
    names = game.get("name", [])
    if isinstance(names, dict):
        names = [names]
    primary_name = next(
        (n["@value"] for n in names if n.get("@type") == "primary"), "Unknown"
    )

    # 한국어 이름 우선순위: 1) 큐레이션 DB(korean_name_override, 정발/통용명)
    # → 2) BGG에 등록된 alternate name 중 한글 포함된 것 → 3) 영어 원문.
    display_name = korean_name_override or _find_hangul_alt_name(names) or primary_name

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
        name=display_name,
        thumbnail=game.get("thumbnail"),
        min_players=int(game.get("minplayers", {}).get("@value", 1) or 1),
        max_players=int(game.get("maxplayers", {}).get("@value", 10) or 10),
        play_time=int(game.get("playingtime", {}).get("@value", 0) or 0),
        weight=round(weight, 2),
        description=description,
        game_type=game_type,
    )


def _find_hangul_alt_name(names: list[dict]) -> str | None:
    """BGG는 게임마다 각국 발매판 이름을 alternate name으로 등록해두는 경우가
    많다 — 그중 한글이 포함된 게 있으면 그게 보통 한국 정발명이다."""
    for n in names:
        value = n.get("@value", "")
        if any("가" <= ch <= "힣" for ch in value):
            return value
    return None


def _is_cooperative(game: dict) -> bool:
    links = game.get("link", [])
    if isinstance(links, dict):
        links = [links]
    return any(
        l.get("@type") == "boardgamemechanic" and l.get("@id") == COOPERATIVE_MECHANIC_ID
        for l in links
    )
