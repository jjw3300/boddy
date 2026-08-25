from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import recommendation, games, cafe
from app.db import init_db

app = FastAPI(
    title="Boddy API",
    description="보드게임 편의성 지원 앱 Boddy의 백엔드 API",
    version="0.1.0",
)


@app.on_event("startup")
async def on_startup():
    await init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중 전체 허용, 배포 시 도메인 한정
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation.router, prefix="/api/v1")
app.include_router(games.router, prefix="/api/v1")
app.include_router(cafe.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": "Boddy"}
