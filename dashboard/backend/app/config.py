from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Speats Dashboard API"
    api_prefix: str = "/api"
    database_url: str = "postgresql+psycopg://speats:speats@localhost:5432/speats"
    auto_create_schema: bool = True

    dashboard_username: str | None = None
    dashboard_password: str | None = None
    cors_origins: list[str] = ["http://localhost:5173"]

    server_id: str = "speats-01"
    server_name: str = "Speats primary"
    execute_commands: bool = False
    systemd_unit_template: str = "hermes-gateway-{name}"
    command_timeout_seconds: int = 30

    repo_root: Path = Path(__file__).resolve().parents[3]
    hermes_profiles_dir: Path = Path("~/.hermes/profiles").expanduser()

    @property
    def templates_dir(self) -> Path:
        return self.repo_root / "templates"

    @property
    def create_agent_script(self) -> Path:
        return self.repo_root / "scripts" / "create-agent.sh"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("hermes_profiles_dir", mode="before")
    @classmethod
    def expand_path(cls, value: str | Path) -> Path:
        return Path(value).expanduser()


@lru_cache
def get_settings() -> Settings:
    return Settings()
