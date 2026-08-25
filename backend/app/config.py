from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    bgg_api_base_url: str = "https://boardgamegeek.com/xmlapi2"
    # BGG가 2025년 7월부터 XML API에 앱 등록 + 인증 토큰을 요구함.
    # https://boardgamegeek.com/using_the_xml_api 에서 토큰 발급 후 .env에 설정.
    bgg_api_token: str | None = None

    # https://developers.kakao.com 에서 앱 등록 후 발급받는 REST API 키.
    kakao_rest_api_key: str | None = None

    # https://www.deepl.com/pro-api 에서 무료 가입 후 발급받는 API 키 (":fx"로
    # 끝나면 무료 플랜 — api-free.deepl.com 호스트를 자동으로 쓴다).
    deepl_api_key: str | None = None

    model_config = {"env_file": ".env"}


settings = Settings()
