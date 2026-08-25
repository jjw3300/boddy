import httpx
from app.config import settings

FREE_HOST = "https://api-free.deepl.com/v2/translate"
PRO_HOST = "https://api.deepl.com/v2/translate"


def _endpoint() -> str:
    """무료 플랜 키는 ":fx"로 끝나고, 반드시 api-free 호스트를 써야 한다."""
    key = settings.deepl_api_key or ""
    return FREE_HOST if key.endswith(":fx") else PRO_HOST


async def translate_to_korean(text: str) -> str | None:
    """영어 텍스트를 한국어로 번역. 키가 없거나 실패하면 None (호출 쪽에서 원문 폴백)."""
    if not settings.deepl_api_key or not text:
        return None

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                _endpoint(),
                headers={"Authorization": f"DeepL-Auth-Key {settings.deepl_api_key}"},
                data={"text": text, "target_lang": "KO", "source_lang": "EN"},
            )
        response.raise_for_status()
        data = response.json()
        return data["translations"][0]["text"]
    except Exception:
        return None
