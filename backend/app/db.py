from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

# SQLite 파일 하나로 충분한 규모 — 별도 DB 서버 없이 로컬 파일로 운영한다.
# 커지면 DATABASE_URL만 postgresql+asyncpg://... 로 바꾸면 된다.
DATABASE_URL = "sqlite+aiosqlite:///./boddy.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def init_db() -> None:
    """앱 시작 시 테이블이 없으면 만든다. 마이그레이션 도구(Alembic) 없이
    단순 create_all로 충분한 규모 — 스키마가 커지면 그때 도입 검토."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
