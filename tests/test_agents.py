# -*- coding: utf-8 -*-
"""
Tests for Mafalia AI Agents
============================
Comprehensive tests for all 10 agents, profiles, processing, and edge cases.
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mafalia_agents.agents import (
    ALL_AGENTS, AGENT_PROFILES, get_agent, list_agents,
    AgentProfile, AgentPersonality, BaseMafaliaAgent,
    Zara, Kofi, Amara, Idris, Nala, Tariq, Sana, Ravi, Luna, Omar,
)

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

AGENT_NAMES = ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"]


# ---------------------------------------------------------------------------
# Agent Registry
# ---------------------------------------------------------------------------

class TestAgentRegistry:
    def test_all_agents_registered(self):
        assert set(ALL_AGENTS.keys()) == set(AGENT_NAMES)

    def test_agent_count(self):
        assert len(ALL_AGENTS) == 10

    def test_get_agent_valid(self):
        for name in AGENT_NAMES:
            agent = get_agent(name, DATA_DIR)
            assert isinstance(agent, BaseMafaliaAgent)

    def test_get_agent_case_insensitive(self):
        agent = get_agent("ZARA", DATA_DIR)
        assert agent.profile.name == "Zara"

    def test_get_agent_invalid_raises(self):
        with pytest.raises(ValueError, match="Unknown agent"):
            get_agent("nonexistent", DATA_DIR)

    def test_list_agents_returns_all(self):
        agents = list_agents()
        assert len(agents) == 10
        names = {a["name"] for a in agents}
        assert "Zara" in names
        assert "Omar" in names


# ---------------------------------------------------------------------------
# Agent Profiles
# ---------------------------------------------------------------------------

class TestAgentProfiles:
    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_profile_has_required_fields(self, name):
        agent = get_agent(name, DATA_DIR)
        p = agent.profile
        assert isinstance(p, AgentProfile)
        assert p.name
        assert p.title
        assert isinstance(p.personality, AgentPersonality)
        assert len(p.superpowers) >= 3
        assert p.description
        assert p.color.startswith("#")
        assert p.tag.startswith("[") and p.tag.endswith("]")
        assert p.voice_style
        assert len(p.expertise_areas) >= 3

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_profile_no_emojis(self, name):
        """Ensure no emoji characters in any profile field."""
        import re
        emoji_re = re.compile("[\U0001F300-\U0001F9FF\U00002600-\U000027BF\U0001FA00-\U0001FAFF]")
        agent = get_agent(name, DATA_DIR)
        p = agent.profile
        for field_val in [p.name, p.title, p.tag, p.description, p.voice_style, p.color]:
            assert not emoji_re.search(str(field_val)), f"Emoji found in {name} profile field: {field_val}"

    def test_all_tags_unique(self):
        tags = [p.tag for p in AGENT_PROFILES.values()]
        assert len(tags) == len(set(tags))

    def test_all_names_unique(self):
        names = [p.name for p in AGENT_PROFILES.values()]
        assert len(names) == len(set(names))

    def test_superpowers_are_descriptive(self):
        for name in AGENT_NAMES:
            agent = get_agent(name, DATA_DIR)
            for sp in agent.profile.superpowers:
                assert "--" in sp, f"Superpower missing description separator in {name}: {sp}"


# ---------------------------------------------------------------------------
# Agent Processing
# ---------------------------------------------------------------------------

class TestAgentProcessing:
    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_process_returns_dict(self, name):
        agent = get_agent(name, DATA_DIR)
        result = agent.process("general overview")
        assert isinstance(result, dict)

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_process_empty_string(self, name):
        agent = get_agent(name, DATA_DIR)
        result = agent.process("")
        assert isinstance(result, dict)

    def test_zara_revenue_keywords(self):
        agent = get_agent("zara", DATA_DIR)
        for kw in ["revenue", "price", "upsell", "pos", "retail"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_kofi_operations_keywords(self):
        agent = get_agent("kofi", DATA_DIR)
        for kw in ["order", "delivery", "hotel", "housekeeping", "transport"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_amara_customer_keywords(self):
        agent = get_agent("amara", DATA_DIR)
        for kw in ["customer", "churn", "loyalty", "satisfaction"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_idris_inventory_keywords(self):
        agent = get_agent("idris", DATA_DIR)
        for kw in ["stock", "reorder", "waste", "supplier"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_nala_marketing_keywords(self):
        agent = get_agent("nala", DATA_DIR)
        for kw in ["marketing", "campaign", "social", "content"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_tariq_finance_keywords(self):
        agent = get_agent("tariq", DATA_DIR)
        for kw in ["finance", "cash", "budget", "credit", "payment"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_sana_data_keywords(self):
        agent = get_agent("sana", DATA_DIR)
        for kw in ["predict", "pattern", "anomaly", "carbon", "code review"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_ravi_tech_keywords(self):
        agent = get_agent("ravi", DATA_DIR)
        for kw in ["api", "security review", "code review", "performance", "terminal", "equipment"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_luna_growth_keywords(self):
        agent = get_agent("luna", DATA_DIR)
        for kw in ["growth", "funnel", "experiment", "referral", "retention"]:
            result = agent.process(kw)
            assert isinstance(result, dict)

    def test_omar_partnership_keywords(self):
        agent = get_agent("omar", DATA_DIR)
        for kw in ["partner", "marketplace", "deal", "supplier", "ecosystem"]:
            result = agent.process(kw)
            assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# Code Review & Security Review (new superpowers)
# ---------------------------------------------------------------------------

class TestCodeAndSecurityReview:
    def test_ravi_code_review_structure(self):
        agent = get_agent("ravi", DATA_DIR)
        result = agent.process("code review")
        assert result["review_type"] == "Code Review"
        assert "checklist" in result
        assert "architecture" in result["checklist"]
        assert "dependencies" in result["checklist"]
        assert "best_practices" in result["checklist"]
        assert "recommendations" in result
        assert len(result["recommendations"]) >= 3

    def test_ravi_security_review_structure(self):
        agent = get_agent("ravi", DATA_DIR)
        result = agent.process("security review")
        assert result["review_type"] == "Security Review"
        assert "checklist" in result
        assert "authentication" in result["checklist"]
        assert "input_validation" in result["checklist"]
        assert "data_protection" in result["checklist"]
        assert "infrastructure" in result["checklist"]
        assert "risk_summary" in result
        assert "recommendations" in result

    def test_sana_code_review_structure(self):
        agent = get_agent("sana", DATA_DIR)
        result = agent.process("code review")
        assert result["review_type"] == "Data Pipeline & Logic Review"
        assert "checklist" in result
        assert "data_integrity" in result["checklist"]
        assert "logic_correctness" in result["checklist"]
        assert "output_quality" in result["checklist"]

    def test_security_review_severity_levels(self):
        agent = get_agent("ravi", DATA_DIR)
        result = agent.process("security review")
        for section in result["checklist"].values():
            assert "severity" in section
            assert section["severity"] in ("critical", "high", "medium", "low")


# ---------------------------------------------------------------------------
# Agent Chat Interface
# ---------------------------------------------------------------------------

class TestAgentChat:
    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_chat_returns_string(self, name):
        agent = get_agent(name, DATA_DIR)
        response = agent.chat("hello")
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_chat_builds_history(self, name):
        agent = get_agent(name, DATA_DIR)
        agent.chat("test message")
        assert len(agent.conversation_history) == 2  # user + assistant

    def test_format_response_includes_agent_tag(self):
        agent = get_agent("zara", DATA_DIR)
        result = agent.process("revenue")
        formatted = agent._format_response(result)
        assert "[REV]" in formatted


# ---------------------------------------------------------------------------
# Edge Cases
# ---------------------------------------------------------------------------

class TestEdgeCases:
    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_unicode_input(self, name):
        agent = get_agent(name, DATA_DIR)
        result = agent.process("revenus du restaurant en francais")
        assert isinstance(result, dict)

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_very_long_input(self, name):
        agent = get_agent(name, DATA_DIR)
        result = agent.process("x " * 1000)
        assert isinstance(result, dict)

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_special_characters(self, name):
        agent = get_agent(name, DATA_DIR)
        result = agent.process("<script>alert('xss')</script> & DROP TABLE;")
        assert isinstance(result, dict)
