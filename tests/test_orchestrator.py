# -*- coding: utf-8 -*-
"""
Tests for Mafalia Orchestrator
===============================
Routing, multi-agent coordination, summaries, and alerts.
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mafalia_agents.orchestrator import MafaliaOrchestrator, AGENT_ROUTING_MAP

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class TestRoutingMap:
    def test_all_10_agents_in_routing(self):
        expected = {"zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"}
        assert set(AGENT_ROUTING_MAP.keys()) == expected

    def test_each_agent_has_keywords(self):
        for name, config in AGENT_ROUTING_MAP.items():
            assert "keywords" in config, f"{name} missing keywords"
            assert len(config["keywords"]) >= 3, f"{name} has too few keywords"

    def test_each_agent_has_priority(self):
        for name, config in AGENT_ROUTING_MAP.items():
            assert "priority" in config
            assert isinstance(config["priority"], int)

    def test_code_review_routes_to_ravi(self):
        assert "code review" in AGENT_ROUTING_MAP["ravi"]["keywords"]

    def test_security_review_routes_to_ravi(self):
        assert "security review" in AGENT_ROUTING_MAP["ravi"]["keywords"]

    def test_code_review_routes_to_sana(self):
        assert "code review" in AGENT_ROUTING_MAP["sana"]["keywords"]


class TestOrchestrator:
    @pytest.fixture
    def orch(self):
        return MafaliaOrchestrator(DATA_DIR)

    def test_orchestrate_returns_dict(self, orch):
        result = orch.orchestrate("How is revenue?")
        assert isinstance(result, dict)
        assert "results" in result
        assert "agents_consulted" in result

    def test_orchestrate_routes_revenue_to_zara(self, orch):
        result = orch.orchestrate("revenue analysis")
        agents = [r["agent"] for r in result["results"]]
        assert "zara" in agents

    def test_orchestrate_routes_stock_to_idris(self, orch):
        result = orch.orchestrate("check stock levels")
        agents = [r["agent"] for r in result["results"]]
        assert "idris" in agents

    def test_orchestrate_routes_security_to_ravi(self, orch):
        result = orch.orchestrate("security review of the system")
        agents = [r["agent"] for r in result["results"]]
        assert "ravi" in agents

    def test_orchestrate_max_agents_respected(self, orch):
        result = orch.orchestrate("full business overview", max_agents=2)
        assert len(result["results"]) <= 2

    def test_orchestrate_has_execution_time(self, orch):
        result = orch.orchestrate("revenue")
        assert "execution_time" in result

    def test_full_business_summary(self, orch):
        result = orch.full_business_summary()
        assert isinstance(result, dict)
        assert "agents_active" in result
        assert result["agents_active"] >= 1
        assert "cross_agent_alerts" in result
        assert "top_opportunities" in result

    def test_summary_alerts_format(self, orch):
        result = orch.full_business_summary()
        for alert in result["cross_agent_alerts"]:
            assert "severity" in alert
            assert "message" in alert
            assert "action" in alert
            assert alert["severity"] in ("low", "medium", "high", "critical")

    def test_get_key_metrics(self, orch):
        result = orch.get_key_metrics()
        assert isinstance(result, dict)
        assert "generated_at" in result

    def test_list_agent_capabilities(self, orch):
        caps = orch.list_agent_capabilities()
        assert len(caps) == 10
        for name, info in caps.items():
            assert "name" in info
            assert "tag" in info
            assert "superpowers" in info

    def test_orchestration_stats(self, orch):
        orch.orchestrate("test query")
        stats = orch.get_orchestration_stats()
        assert "total_orchestrations" in stats
        assert stats["total_orchestrations"] >= 1


class TestOrchestratorEdgeCases:
    def test_empty_request_still_works(self):
        orch = MafaliaOrchestrator(DATA_DIR)
        result = orch.orchestrate("")
        assert isinstance(result, dict)

    def test_gibberish_request(self):
        orch = MafaliaOrchestrator(DATA_DIR)
        result = orch.orchestrate("asdfghjkl qwertyuiop")
        assert isinstance(result, dict)
        assert len(result["results"]) >= 1  # falls back to default agent
