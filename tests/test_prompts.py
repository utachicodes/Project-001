# -*- coding: utf-8 -*-
"""
Tests for Mafalia Prompts
===========================
"""

import os
import sys
import re
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mafalia_agents.prompts import (
    SYSTEM_PROMPTS, FEW_SHOT_EXAMPLES, ORCHESTRATOR_PROMPT, get_system_prompt,
)

AGENT_NAMES = ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"]
EMOJI_RE = re.compile("[\U0001F300-\U0001F9FF\U00002600-\U000027BF\U0001FA00-\U0001FAFF]")


class TestSystemPrompts:
    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_each_agent_has_prompt(self, name):
        assert name in SYSTEM_PROMPTS
        assert len(SYSTEM_PROMPTS[name]) > 100

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_get_system_prompt(self, name):
        prompt = get_system_prompt(name)
        assert isinstance(prompt, str)
        assert len(prompt) > 50

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_no_emojis_in_prompts(self, name):
        prompt = SYSTEM_PROMPTS[name]
        assert not EMOJI_RE.search(prompt), f"Emoji found in {name} system prompt"

    def test_orchestrator_prompt_exists(self):
        assert len(ORCHESTRATOR_PROMPT) > 100

    def test_orchestrator_prompt_no_emojis(self):
        assert not EMOJI_RE.search(ORCHESTRATOR_PROMPT)

    def test_orchestrator_prompt_has_all_tags(self):
        for tag in ["[REV]", "[OPS]", "[CUS]", "[INV]", "[MKT]", "[FIN]", "[DAT]", "[TEC]", "[GRO]", "[PAR]"]:
            assert tag in ORCHESTRATOR_PROMPT, f"Missing {tag} in orchestrator prompt"


class TestFewShotExamples:
    def test_few_shot_exists(self):
        assert isinstance(FEW_SHOT_EXAMPLES, dict)
        assert len(FEW_SHOT_EXAMPLES) >= 1

    def test_few_shot_no_emojis(self):
        for agent, examples in FEW_SHOT_EXAMPLES.items():
            for ex in examples:
                assert not EMOJI_RE.search(ex.get("assistant", "")), \
                    f"Emoji in {agent} few-shot example"

    def test_few_shot_structure(self):
        for agent, examples in FEW_SHOT_EXAMPLES.items():
            for ex in examples:
                assert "user" in ex
                assert "assistant" in ex
