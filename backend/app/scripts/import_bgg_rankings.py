"""
BGG 랭킹 데이터셋(공개 커뮤니티 저장소, beefsack/bgg-ranking-historicals)을
가져와 상위 N개 게임을 추천 풀 시드로 DB에 채워 넣는 스크립트.

BGG 공식 XML API에는 "게임 전체 목록"이나 "조건 검색" 엔드포인트가 없어서
(search는 제목 텍스트 매칭만 가능) 어떤 게임이 존재하는지 자체를 알아낼
방법이 마땅치 않다. 이 저장소는 BGG 랭킹 페이지를 매일 스크랩해 CSV로
커밋해두는 커뮤니티 프로젝트라, "존재하는 게임 id + 랭킹" 목록을 벌크로
얻을 수 있다. 실제 상세 정보(플레이어 수, 난이도, 설명 등)는 기존과 동일하게
BGG 공식 API의 /thing 엔드포인트에서 그때그때 가져온다 — 이 스크립트 자체는
BGG API를 전혀 호출하지 않는다 (CSV 읽고 DB에 id만 upsert).

이미 seed_games.py로 등록해둔 korean_name 등 큐레이션 필드는 건드리지 않는다
(bulk_mark_seed는 is_seed만 세팅).

실행: cd backend && venv/Scripts/python -m app.scripts.import_bgg_rankings [상위 N개, 기본 300]
"""

import asyncio
import csv
import sys
import urllib.request
from datetime import date, timedelta

from app.db import init_db
from app.services.game_metadata_service import bulk_mark_seed

RANKINGS_CSV_URL = "https://raw.githubusercontent.com/beefsack/bgg-ranking-historicals/master/{d}.csv"


def _download_latest_csv() -> str:
    """오늘자 CSV를 시도하고, 아직 안 올라왔으면 하루 전 것을 시도."""
    for days_ago in (0, 1, 2):
        d = (date.today() - timedelta(days=days_ago)).isoformat()
        url = RANKINGS_CSV_URL.format(d=d)
        try:
            with urllib.request.urlopen(url, timeout=15) as resp:
                print(f"다운로드 성공: {url}")
                return resp.read().decode("utf-8")
        except Exception as e:
            print(f"  {url} 실패 ({e}), 이전 날짜로 재시도...")
    raise RuntimeError("최근 3일치 랭킹 CSV를 모두 가져오지 못했습니다.")


async def main(top_n: int) -> None:
    await init_db()

    text = _download_latest_csv()
    reader = csv.DictReader(text.splitlines())
    rows = [r for r in reader if r.get("Rank", "").isdigit() and r.get("ID", "").isdigit()]
    rows.sort(key=lambda r: int(r["Rank"]))
    top_rows = rows[:top_n]

    print(f"랭킹 상위 {len(top_rows)}개 게임을 시드로 등록 중...")
    await bulk_mark_seed([int(r["ID"]) for r in top_rows])
    print("완료.")


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 300
    if sys.platform.startswith("win"):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main(n))
