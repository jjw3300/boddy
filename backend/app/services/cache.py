import time
from typing import Any

# 간단한 인메모리 TTL 캐시
# BGG API는 느리고 데이터가 자주 바뀌지 않으므로 로컬 캐시로 충분
_store: dict[str, tuple[Any, float]] = {}

DEFAULT_TTL = 60 * 60  # 1시간


def get(key: str) -> Any | None:
    entry = _store.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        del _store[key]
        return None
    return value


def set(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    _store[key] = (value, time.time() + ttl)


def delete(key: str) -> None:
    _store.pop(key, None)
