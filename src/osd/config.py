from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql://osd:osd@localhost:5432/osd"
    duckdb_path: str = "data/processed/osd_analytics.duckdb"
    osd_model_version: str = "0.1.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8742


settings = Settings()
