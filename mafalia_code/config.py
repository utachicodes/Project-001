# -*- coding: utf-8 -*-
"""
Mafalia Code -- Configuration & API Key Management
====================================================
Stores API keys, model selection, and user preferences.
Config is saved to ~/.mafalia/config.json
"""

import os
import json
from typing import Optional, Dict, Any
from pathlib import Path

CONFIG_DIR = Path.home() / ".mafalia"
CONFIG_FILE = CONFIG_DIR / "config.json"

PROVIDERS = {
    "anthropic": {
        "name": "Anthropic (Claude)",
        "base_url": "https://api.anthropic.com/v1",
        "models": [
            "claude-sonnet-4-20250514",
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            "claude-3-opus-20240229",
        ],
        "env_key": "ANTHROPIC_API_KEY",
    },
    "openai": {
        "name": "OpenAI (GPT)",
        "base_url": "https://api.openai.com/v1",
        "models": [
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "o1-preview",
            "o1-mini",
        ],
        "env_key": "OPENAI_API_KEY",
    },
    "google": {
        "name": "Google (Gemini)",
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "models": [
            "gemini-2.5-pro-preview-06-05",
            "gemini-2.0-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
        ],
        "env_key": "GOOGLE_API_KEY",
    },
    "openrouter": {
        "name": "OpenRouter (Any Model)",
        "base_url": "https://openrouter.ai/api/v1",
        "models": [
            "anthropic/claude-sonnet-4-20250514",
            "openai/gpt-4o",
            "google/gemini-2.5-pro-preview-06-05",
            "meta-llama/llama-3.1-405b-instruct",
            "deepseek/deepseek-chat",
        ],
        "env_key": "OPENROUTER_API_KEY",
    },
    "custom": {
        "name": "Custom (OpenAI-compatible)",
        "base_url": "",
        "models": [],
        "env_key": "CUSTOM_API_KEY",
    },
}

DEFAULT_CONFIG = {
    "provider": "",
    "model": "",
    "api_key": "",
    "base_url": "",
    "max_tokens": 4096,
    "temperature": 0.4,
    "data_dir": ".",
    "theme": "dark",
}


def _ensure_dir():
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def load_config() -> Dict[str, Any]:
    _ensure_dir()
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
            merged = {**DEFAULT_CONFIG, **saved}
            return merged
        except Exception:
            return dict(DEFAULT_CONFIG)
    return dict(DEFAULT_CONFIG)


def save_config(cfg: Dict[str, Any]):
    _ensure_dir()
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)


def get_api_key(cfg: Dict[str, Any]) -> Optional[str]:
    if cfg.get("api_key"):
        return cfg["api_key"]
    provider = cfg.get("provider", "")
    if provider in PROVIDERS:
        env_key = PROVIDERS[provider]["env_key"]
        return os.environ.get(env_key)
    return None


def resolve_base_url(cfg: Dict[str, Any]) -> str:
    if cfg.get("base_url"):
        return cfg["base_url"]
    provider = cfg.get("provider", "")
    if provider in PROVIDERS:
        return PROVIDERS[provider]["base_url"]
    return ""
