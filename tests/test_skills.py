# -*- coding: utf-8 -*-
"""
Tests for Mafalia Skills System
=================================
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mafalia_agents.skills import get_all_skills, get_skills_for_agent, skills_summary

AGENT_NAMES = ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"]


class TestSkills:
    def test_get_all_skills(self):
        skills = get_all_skills()
        assert isinstance(skills, dict)
        assert len(skills) > 0

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_skills_per_agent(self, name):
        skills = get_skills_for_agent(name)
        assert isinstance(skills, list)
        assert len(skills) >= 1

    def test_skills_summary(self):
        summary = skills_summary()
        assert "total_skills" in summary
        assert "agents" in summary
        assert "skills_per_agent" in summary
        assert summary["agents"] == 10

    def test_skill_has_required_fields(self):
        all_skills_dict = get_all_skills()
        for agent, skills in all_skills_dict.items():
            for s in skills:
                assert "id" in s
                assert "name" in s
                assert "category" in s
                assert "difficulty" in s

    def test_invalid_agent_returns_empty(self):
        skills = get_skills_for_agent("nonexistent")
        assert skills == [] or skills is None
