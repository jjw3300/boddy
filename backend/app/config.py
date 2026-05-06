from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    bgg_api_base_url: str = "https://boardgamegeek.com/xmlapi2"

    model_config = {"env_file": ".env"}


settings = Settings()
