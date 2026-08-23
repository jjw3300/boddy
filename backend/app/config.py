from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    bgg_api_base_url: str = "https://boardgamegeek.com/xmlapi2"
    # BGG가 2025년 7월부터 XML API에 앱 등록 + 인증 토큰을 요구함.
    # https://boardgamegeek.com/using_the_xml_api 에서 토큰 발급 후 .env에 설정.
    bgg_api_token: str | None = None

    # https://developers.kakao.com 에서 앱 등록 후 발급받는 REST API 키.
    kakao_rest_api_key: str | None = None

    model_config = {"env_file": ".env"}


settings = Settings()
