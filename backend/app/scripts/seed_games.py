"""
추천 풀 확장용 시드 게임을 DB에 채워 넣는 일회성(또는 필요시 재실행) 스크립트.

예전엔 SEED_GAME_TITLES를 앱이 매 콜드 캐시마다 /search로 70번 호출해 풀이
느리게 만들어졌다 — 이제 이 스크립트를 한 번 돌려서 DB에 저장해두면, 앱은
그냥 DB를 읽기만 하면 된다 (즉시 응답, BGG API 호출 없음).

실행: cd backend && venv/Scripts/python -m app.scripts.seed_games

한국어 정발명은 확실히 아는 것만 채웠다 — 나머지는 None으로 둬서
bgg_service가 BGG의 alternate name(한글 포함시) → 영어 원문 순으로
자동 폴백하도록 한다. 틀릴 수 있는 이름을 억지로 채우는 것보다 안전하다.
"""

import asyncio
import sys

from app.db import init_db
from app.services.bgg_service import search_games_by_name
from app.services.game_metadata_service import upsert_metadata

# (영문 제목, 확실히 아는 한국어 정발/통용명 또는 None)
SEED_GAMES: list[tuple[str, str | None]] = [
    # 전략 — 일꾼 놓기 / 덱빌딩 / 타일 놓기 / 4X / 추상 / 엔진빌딩 등
    ("Terraforming Mars", "테라포밍 마스"),
    ("Brass: Birmingham", None),
    ("Gloomhaven", None),
    ("Twilight Imperium", None),
    ("Scythe", None),
    ("Ark Nova", None),
    ("Great Western Trail", None),
    ("Puerto Rico", None),
    ("Agricola", "아그리콜라"),
    ("Caverna", None),
    ("Viticulture", None),
    ("Wingspan", "윙스팬"),
    ("Everdell", None),
    ("Terra Mystica", None),
    ("Gaia Project", None),
    ("Through the Ages", None),
    ("Concordia", None),
    ("Power Grid", None),
    ("El Grande", None),
    ("Tigris & Euphrates", None),
    ("Hive", None),
    ("Onitama", "오니타마"),
    ("Star Realms", None),
    ("Dominion", "도미니언"),
    ("Clank!", None),
    ("7 Wonders", "세븐 원더스"),
    ("Ticket to Ride", "티켓 투 라이드"),
    ("Carcassonne", "카르카손"),
    ("Catan", "카탄"),
    # 파티 / 심리 / 상호작용
    ("Codenames", "코드네임"),
    ("One Night Ultimate Werewolf", None),
    ("Secret Hitler", None),
    ("Coup", None),
    ("Avalon", None),
    ("Sheriff of Nottingham", None),
    ("Skull", None),
    ("Bang!", None),
    ("Two Rooms and a Boom", None),
    ("Spyfall", None),
    ("Dixit", "딕싯"),
    ("Just One", None),
    ("Wavelength", None),
    ("Poetry for Neanderthals", None),
    # 협동 / 피지컬 / 기타
    ("Pandemic", "팬데믹"),
    ("Pandemic Legacy", None),
    ("Forbidden Island", None),
    ("Forbidden Desert", None),
    ("Spirit Island", None),
    ("The Crew", None),
    ("Hanabi", "하나비"),
    ("Mysterium", None),
    ("Betrayal at House on the Hill", None),
    ("Flamme Rouge", None),
    ("Kingdomino", None),
    ("Azul", "아줄"),
    ("Splendor", "스플렌더"),
    ("Sushi Go", "스시고"),
    ("King of Tokyo", "킹 오브 도쿄"),
    ("Love Letter", "러브레터"),
    ("No Thanks!", None),
    ("Camel Up", None),
    ("Incan Gold", None),
]


async def resolve_and_upsert(semaphore: asyncio.Semaphore, title: str, korean_name: str | None) -> None:
    async with semaphore:
        await asyncio.sleep(0.6)  # BGG 요청 제한(429) 방지
        try:
            results = await search_games_by_name(title)
        except Exception as e:
            print(f"  [실패] {title}: {e}")
            return

        if not results:
            print(f"  [못찾음] {title}")
            return

        exact = next(
            (r for r in results if r["name"].strip().lower() == title.strip().lower()),
            None,
        )
        best = exact or results[0]

        await upsert_metadata(
            best["bgg_id"],
            korean_name=korean_name,
            name_source="official" if korean_name else None,
            is_seed=True,
        )
        marker = f" → {korean_name}" if korean_name else ""
        print(f"  [완료] {title} (bgg_id={best['bgg_id']}){marker}")


async def main() -> None:
    await init_db()
    print(f"시드 게임 {len(SEED_GAMES)}개 처리 시작...")

    semaphore = asyncio.Semaphore(2)
    await asyncio.gather(
        *(resolve_and_upsert(semaphore, title, ko) for title, ko in SEED_GAMES)
    )
    print("완료.")


if __name__ == "__main__":
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
