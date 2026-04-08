# -*- coding: utf-8 -*-
"""
Tests for Mafalia FastAPI REST API
====================================
Endpoint tests using TestClient.
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from mafalia_api.api import app

client = TestClient(app)

AGENT_NAMES = ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"]


class TestHealthAndRoot:
    def test_health_endpoint(self):
        r = client.get("/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"
        assert data["agents"] == 10

    def test_root_returns_html(self):
        r = client.get("/")
        assert r.status_code == 200
        assert "Mafalia" in r.text


class TestAgentEndpoints:
    def test_list_agents(self):
        r = client.get("/agents")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 10

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_agent_profile(self, name):
        r = client.get(f"/agents/{name}")
        assert r.status_code == 200
        data = r.json()
        assert data["name"].lower() == name
        assert "tag" in data
        assert "superpowers" in data

    def test_agent_profile_invalid(self):
        r = client.get("/agents/nobody")
        assert r.status_code == 404

    def test_agent_message(self):
        r = client.post("/agents/message", json={
            "agent": "zara",
            "message": "revenue overview"
        })
        assert r.status_code == 200
        data = r.json()
        assert data["agent"] == "zara"
        assert "response" in data
        assert "tag" in data

    def test_agent_message_empty_rejected(self):
        r = client.post("/agents/message", json={
            "agent": "zara",
            "message": ""
        })
        assert r.status_code == 422  # validation error

    @pytest.mark.parametrize("name", AGENT_NAMES)
    def test_agent_skills(self, name):
        r = client.get(f"/agents/{name}/skills")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)


class TestOrchestrateEndpoint:
    def test_orchestrate(self):
        r = client.post("/orchestrate", json={
            "request": "How is revenue?"
        })
        assert r.status_code == 200
        data = r.json()
        assert "results" in data
        assert "agents_consulted" in data

    def test_orchestrate_empty_rejected(self):
        r = client.post("/orchestrate", json={
            "request": ""
        })
        assert r.status_code == 422


class TestSummaryEndpoint:
    def test_full_summary(self):
        r = client.get("/summary")
        assert r.status_code == 200
        data = r.json()
        assert "agents_active" in data
        assert "cross_agent_alerts" in data


class TestKnowledgeEndpoints:
    def test_knowledge_search(self):
        r = client.post("/knowledge/search", json={
            "query": "revenue"
        })
        assert r.status_code == 200

    def test_knowledge_stats(self):
        r = client.get("/knowledge/stats")
        assert r.status_code == 200


class TestMetricsEndpoint:
    def test_metrics(self):
        r = client.get("/metrics")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)
