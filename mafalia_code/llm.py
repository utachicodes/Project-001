# -*- coding: utf-8 -*-
"""
Mafalia Code -- Multi-Provider LLM Client
============================================
Unified interface for OpenAI, Anthropic, Google Gemini, OpenRouter,
and any OpenAI-compatible endpoint. Handles tool calling across all providers.
"""

import json
import httpx
from typing import Dict, List, Any, Optional

from mafalia_code.config import resolve_base_url, get_api_key
from mafalia_code.system_prompt import MAFALIA_SYSTEM_PROMPT, TOOLS_SCHEMA, ANTHROPIC_TOOLS


class TokenTracker:
    def __init__(self):
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.total_calls = 0

    def add(self, prompt: int, completion: int):
        self.prompt_tokens += prompt
        self.completion_tokens += completion
        self.total_calls += 1

    @property
    def total_tokens(self):
        return self.prompt_tokens + self.completion_tokens

    def summary(self) -> Dict:
        return {
            "calls": self.total_calls,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
        }


class MafaliaLLM:
    """Unified LLM client for all providers."""

    def __init__(self, cfg: Dict[str, Any]):
        self.cfg = cfg
        self.provider = cfg.get("provider", "openai")
        self.model = cfg.get("model", "")
        self.api_key = get_api_key(cfg) or ""
        self.base_url = resolve_base_url(cfg)
        self.max_tokens = cfg.get("max_tokens", 4096)
        self.temperature = cfg.get("temperature", 0.4)
        self.tracker = TokenTracker()
        self.conversation: List[Dict] = []
        self._client = httpx.Client(timeout=120.0)

    def reset(self):
        self.conversation = []

    def chat(self, user_message: str) -> Dict[str, Any]:
        self.conversation.append({"role": "user", "content": user_message})
        if self.provider == "anthropic":
            return self._anthropic()
        elif self.provider == "google":
            return self._google()
        else:
            return self._openai()

    def tool_result(self, call_id: str, name: str, result: str) -> Dict[str, Any]:
        if self.provider == "anthropic":
            self.conversation.append({
                "role": "user",
                "content": [{"type": "tool_result", "tool_use_id": call_id, "content": result}],
            })
            return self._anthropic()
        elif self.provider == "google":
            self.conversation.append({
                "role": "function",
                "parts": [{"functionResponse": {"name": name, "response": json.loads(result)}}],
            })
            return self._google()
        else:
            self.conversation.append({"role": "tool", "tool_call_id": call_id, "content": result})
            return self._openai()

    # ── OpenAI / OpenRouter / Custom ────────────────────────────────────

    def _openai(self) -> Dict[str, Any]:
        msgs = [{"role": "system", "content": MAFALIA_SYSTEM_PROMPT}] + self.conversation
        body = {
            "model": self.model,
            "messages": msgs,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "tools": TOOLS_SCHEMA,
        }
        hdrs = {"Content-Type": "application/json"}
        # Only add Authorization header if we have an API key (Ollama doesn't need one)
        if self.api_key:
            hdrs["Authorization"] = f"Bearer {self.api_key}"
        if self.provider == "openrouter":
            hdrs["HTTP-Referer"] = "https://mafalia.com"
            hdrs["X-Title"] = "Mafalia Code"
        try:
            r = self._client.post(f"{self.base_url}/chat/completions", json=body, headers=hdrs)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            return self._err(e)

        choice = data.get("choices", [{}])[0]
        msg = choice.get("message", {})
        usage = data.get("usage", {})
        self.tracker.add(usage.get("prompt_tokens", 0), usage.get("completion_tokens", 0))

        tool_calls = []
        if msg.get("tool_calls"):
            for tc in msg["tool_calls"]:
                tool_calls.append({
                    "id": tc["id"],
                    "name": tc["function"]["name"],
                    "arguments": json.loads(tc["function"].get("arguments", "{}")),
                })
            self.conversation.append(msg)
        else:
            text = msg.get("content", "") or ""
            self.conversation.append({"role": "assistant", "content": text})

        return {"text": msg.get("content", "") or "", "tool_calls": tool_calls, "usage": usage}

    # ── Anthropic ───────────────────────────────────────────────────────

    def _anthropic(self) -> Dict[str, Any]:
        body = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "system": MAFALIA_SYSTEM_PROMPT,
            "messages": self.conversation,
            "tools": ANTHROPIC_TOOLS,
        }
        hdrs = {"x-api-key": self.api_key, "anthropic-version": "2023-06-01", "Content-Type": "application/json"}
        try:
            r = self._client.post(f"{self.base_url}/messages", json=body, headers=hdrs)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            return self._err(e)

        usage = data.get("usage", {})
        self.tracker.add(usage.get("input_tokens", 0), usage.get("output_tokens", 0))

        texts, tool_calls = [], []
        blocks = data.get("content", [])
        for b in blocks:
            if b["type"] == "text":
                texts.append(b["text"])
            elif b["type"] == "tool_use":
                tool_calls.append({"id": b["id"], "name": b["name"], "arguments": b.get("input", {})})
        self.conversation.append({"role": "assistant", "content": blocks})
        return {"text": "\n".join(texts), "tool_calls": tool_calls, "usage": usage}

    # ── Google Gemini ───────────────────────────────────────────────────

    def _google(self) -> Dict[str, Any]:
        contents = [
            {"role": "user", "parts": [{"text": MAFALIA_SYSTEM_PROMPT}]},
            {"role": "model", "parts": [{"text": "Understood. I am Mafalia Code, ready."}]},
        ]
        for m in self.conversation:
            role = m.get("role", "user")
            if role == "user" and isinstance(m.get("content"), str):
                contents.append({"role": "user", "parts": [{"text": m["content"]}]})
            elif role == "assistant" and isinstance(m.get("content"), str):
                contents.append({"role": "model", "parts": [{"text": m["content"]}]})
            elif role == "function":
                contents.append(m)

        tools = [{"function_declarations": [
            {"name": t["function"]["name"], "description": t["function"]["description"], "parameters": t["function"]["parameters"]}
            for t in TOOLS_SCHEMA
        ]}]
        body = {"contents": contents, "tools": tools, "generationConfig": {"maxOutputTokens": self.max_tokens, "temperature": self.temperature}}
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        try:
            r = self._client.post(url, json=body)
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            return self._err(e)

        usage = data.get("usageMetadata", {})
        self.tracker.add(usage.get("promptTokenCount", 0), usage.get("candidatesTokenCount", 0))

        cands = data.get("candidates", [{}])
        parts = cands[0].get("content", {}).get("parts", []) if cands else []
        texts, tool_calls = [], []
        for p in parts:
            if "text" in p:
                texts.append(p["text"])
            elif "functionCall" in p:
                fc = p["functionCall"]
                tool_calls.append({"id": fc["name"], "name": fc["name"], "arguments": fc.get("args", {})})

        text = "\n".join(texts)
        if text:
            self.conversation.append({"role": "assistant", "content": text})
        return {"text": text, "tool_calls": tool_calls, "usage": usage}

    def _err(self, e: Exception) -> Dict[str, Any]:
        msg = str(e)
        if hasattr(e, "response"):
            msg = f"API Error: {e.response.text[:500]}"
        return {"text": f"Error: {msg}", "tool_calls": [], "usage": {}}
