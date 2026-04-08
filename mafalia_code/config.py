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
    "ollama": {
        "name": "Ollama (Local)",
        "base_url": "http://localhost:11434/v1",
        "models": [
            "llama3.2",
            "llama3.1",
            "llama3",
            "mistral",
            "gemma2",
            "qwen2.5",
            "phi3",
            "deepseek-coder",
        ],
        "env_key": "",
    },
}

DEFAULT_CONFIG = {
    "provider": "",
    "model": "",
    "api_key": "",
    "base_url": "",
    "max_tokens": 1024,
    "temperature": 0.4,
    "data_dir": ".",
    "theme": "dark",
}


def _ensure_dir():
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)


def load_config() -> Dict[str, Any]:
    _ensure_dir()
    cfg = dict(DEFAULT_CONFIG)
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
            cfg = {**DEFAULT_CONFIG, **saved}
        except Exception:
            pass
    
    # Override with environment variables if present
    if os.environ.get("OPENROUTER_API_KEY") and not cfg.get("api_key"):
        cfg["provider"] = "openrouter"
        cfg["api_key"] = os.environ.get("OPENROUTER_API_KEY")
        if not cfg.get("model"):
            cfg["model"] = "google/gemini-2.5-pro-preview-06-05"
    
    return cfg


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


def validate_config(cfg: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate configuration and return status dict.
    Checks if API key is set for cloud providers or if Ollama is accessible.
    """
    provider = cfg.get("provider", "")
    model = cfg.get("model", "")
    
    result = {
        "valid": False,
        "provider": provider,
        "model": model,
        "message": "",
        "checks": {},
    }
    
    if not provider:
        result["message"] = "No provider selected. Please select a provider in settings."
        return result
    
    if not model:
        result["message"] = f"No model selected for {provider}. Please select a model."
        return result
    
    # For Ollama, check if server is accessible
    if provider == "ollama":
        try:
            import httpx
            base_url = resolve_base_url(cfg) or "http://localhost:11434/v1"
            client = httpx.Client(timeout=5.0)
            response = client.get(f"{base_url}/models")
            if response.status_code == 200:
                result["valid"] = True
                result["message"] = f"Ollama server accessible at {base_url}"
                result["checks"]["ollama_server"] = "ok"
                result["checks"]["available_models"] = [m["name"] for m in response.json().get("models", [])]
            else:
                result["message"] = f"Ollama server returned status {response.status_code}. Ensure Ollama is running: 'ollama serve'"
                result["checks"]["ollama_server"] = f"error_{response.status_code}"
        except Exception as e:
            result["message"] = f"Cannot connect to Ollama at {base_url}. Ensure Ollama is running with 'ollama serve'. Error: {str(e)}"
            result["checks"]["ollama_server"] = "connection_failed"
        return result
    
    # For cloud providers, check API key
    api_key = get_api_key(cfg)
    if not api_key:
        env_key = PROVIDERS.get(provider, {}).get("env_key", "")
        if env_key:
            result["message"] = f"No API key set for {provider}. Set {env_key} environment variable or enter key in settings."
        else:
            result["message"] = f"No API key set for {provider}. Please enter API key in settings."
        result["checks"]["api_key"] = "missing"
        return result
    
    # Validate API key format (basic check)
    if provider == "anthropic" and not api_key.startswith("sk-ant-"):
        result["message"] = f"Invalid Anthropic API key format. Should start with 'sk-ant-'"
        result["checks"]["api_key"] = "invalid_format"
        return result
    elif provider == "openai" and not api_key.startswith("sk-"):
        result["message"] = f"Invalid OpenAI API key format. Should start with 'sk-'"
        result["checks"]["api_key"] = "invalid_format"
        return result
    
    result["valid"] = True
    result["message"] = f"Configuration valid: {provider} with model {model}"
    result["checks"]["api_key"] = "present"
    return result
