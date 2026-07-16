from pathlib import Path

import pytest

from app.config import Settings
from app.hermes import HermesError, HermesService
from app.models import AgentStatus


def service_for(tmp_path: Path) -> HermesService:
    return HermesService(
        Settings(
            hermes_profiles_dir=tmp_path / "profiles",
            repo_root=tmp_path,
            execute_commands=False,
        )
    )


def test_profile_path_rejects_traversal(tmp_path: Path) -> None:
    service = service_for(tmp_path)

    with pytest.raises(HermesError):
        service.profile_path("../other-profile")


def test_status_uses_profile_configuration_without_running_commands(tmp_path: Path) -> None:
    service = service_for(tmp_path)
    profile = service.settings.hermes_profiles_dir / "farmacia-test"
    profile.mkdir(parents=True)

    assert service.status("farmacia-test") == AgentStatus.unconfigured

    (profile / ".env").write_text("TELEGRAM_BOT_TOKEN=not-a-real-token\n", encoding="utf-8")
    assert service.status("farmacia-test") == AgentStatus.offline
