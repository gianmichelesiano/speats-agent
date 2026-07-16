import os
import re
import subprocess
from pathlib import Path
from typing import Any

import yaml

from .config import Settings
from .models import AgentStatus

PROFILE_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class HermesError(RuntimeError):
    pass


class HermesService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def profile_path(self, name: str) -> Path:
        if not PROFILE_PATTERN.fullmatch(name):
            raise HermesError("Invalid profile name")
        root = self.settings.hermes_profiles_dir.resolve()
        target = (root / name).resolve()
        if target.parent != root:
            raise HermesError("Profile path escapes Hermes root")
        return target

    def discover_profiles(self) -> list[str]:
        root = self.settings.hermes_profiles_dir
        if not root.is_dir():
            return []
        return sorted(
            item.name for item in root.iterdir() if item.is_dir() and PROFILE_PATTERN.fullmatch(item.name)
        )

    def status(self, name: str) -> AgentStatus:
        profile = self.profile_path(name)
        if not profile.exists():
            return AgentStatus.unconfigured
        if self.settings.execute_commands:
            unit = self.settings.systemd_unit_template.format(name=name)
            result = subprocess.run(
                ["systemctl", "--user", "is-active", unit],
                capture_output=True,
                text=True,
                timeout=5,
                check=False,
            )
            if result.returncode == 0 and result.stdout.strip() == "active":
                return AgentStatus.online
        env_file = profile / ".env"
        if env_file.is_file() and "TELEGRAM_BOT_TOKEN=" in env_file.read_text(
            encoding="utf-8", errors="ignore"
        ):
            return AgentStatus.offline
        return AgentStatus.unconfigured

    def read_soul(self, name: str) -> str | None:
        soul = self.profile_path(name) / "SOUL.md"
        return soul.read_text(encoding="utf-8") if soul.is_file() else None

    def write_soul(self, name: str, content: str) -> None:
        soul = self.profile_path(name) / "SOUL.md"
        if not soul.parent.is_dir():
            raise HermesError("Profile not found")
        soul.write_text(content, encoding="utf-8")

    def cron_jobs(self, name: str) -> list[dict[str, Any]]:
        config = self.profile_path(name) / "config.yaml"
        if not config.is_file():
            return []
        try:
            data = yaml.safe_load(config.read_text(encoding="utf-8")) or {}
        except yaml.YAMLError:
            return []
        jobs = data.get("cron", []) if isinstance(data, dict) else []
        return [
            {
                "id": f"cron-{index}",
                "name": job.get("name") or f"Scheduled job {index}",
                "schedule": job.get("schedule", "Unknown schedule"),
                "enabled": job.get("enabled", True),
            }
            for index, job in enumerate(jobs, start=1)
            if isinstance(job, dict)
        ]

    def templates(self) -> list[dict[str, Any]]:
        themes = {
            "farmacia": {"icon": "Rx", "color": "#a8f5cf", "language": "IT · DE"},
            "ristorante": {"icon": "QL", "color": "#ffca8a", "language": "IT · DE"},
            "consulenza": {"icon": "CO", "color": "#a9c4ff", "language": "IT · DE · EN"},
        }
        if not self.settings.templates_dir.is_dir():
            return []
        result: list[dict[str, Any]] = []
        for folder in sorted(item for item in self.settings.templates_dir.iterdir() if item.is_dir()):
            config_path = folder / "template.config.yaml"
            try:
                config = (
                    yaml.safe_load(config_path.read_text(encoding="utf-8")) if config_path.is_file() else {}
                )
            except yaml.YAMLError:
                config = {}
            meta = config.get("template", {}) if isinstance(config, dict) else {}
            soul = (folder / "SOUL.md").read_text(encoding="utf-8") if (folder / "SOUL.md").is_file() else ""
            preview = " ".join(
                line.strip("#* ") for line in soul.splitlines() if line.strip() and not line.startswith("|")
            )
            theme = themes.get(
                folder.name, {"icon": folder.name[:2].upper(), "color": "#a9c4ff", "language": "IT"}
            )
            result.append(
                {
                    "name": folder.name,
                    "display_name": str(meta.get("name", folder.name)).replace("-", " ").title(),
                    "description": meta.get("description", f"Template operativo {folder.name}"),
                    "version": str(meta.get("version", "draft")),
                    "soul_preview": preview[:180] or "SOUL.md non disponibile",
                    "files": sorted(item.name for item in folder.iterdir() if item.is_file()),
                    **theme,
                }
            )
        return result

    def provision(self, name: str, template: str, telegram_token: str) -> str:
        if not self.settings.execute_commands:
            raise HermesError("Command execution is disabled; set SPEATS_EXECUTE_COMMANDS=true on the server")
        if not (self.settings.templates_dir / template).is_dir():
            raise HermesError("Template not found")
        env = os.environ.copy()
        env["SPEATS_BOT_TOKEN"] = telegram_token
        env["SPEATS_TEMPLATES_DIR"] = str(self.settings.templates_dir)
        result = subprocess.run(
            [str(self.settings.create_agent_script), "--name", name, "--template", template],
            capture_output=True,
            text=True,
            env=env,
            timeout=self.settings.command_timeout_seconds,
            check=False,
        )
        output = (result.stdout + "\n" + result.stderr).strip()
        if result.returncode != 0:
            raise HermesError(output[-4000:] or "Provisioning failed")
        return output[-4000:]

    def restart(self, name: str) -> None:
        self.profile_path(name)
        if not self.settings.execute_commands:
            raise HermesError("Command execution is disabled")
        unit = self.settings.systemd_unit_template.format(name=name)
        result = subprocess.run(
            ["systemctl", "--user", "restart", unit],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        if result.returncode != 0:
            raise HermesError(result.stderr.strip() or f"Unable to restart {unit}")
