# -*- coding: utf-8 -*-
"""
Mafalia Code -- Tool Executor
================================
Bridges LLM tool calls to real Mafalia agent data.
When the LLM calls ask_agent, orchestrate, etc., this module
runs the actual agent logic and returns real business data.
"""

import os
import sys
import json
from typing import Dict, Any

# Ensure project root is on path
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from mafalia_agents.agents import get_agent, list_agents, ALL_AGENTS
from mafalia_agents.orchestrator import MafaliaOrchestrator


class MafaliaToolExecutor:
    """Executes tool calls from the LLM using real Mafalia agents."""

    def __init__(self, data_dir: str = "."):
        self.data_dir = data_dir
        self._orchestrator = None

    @property
    def orchestrator(self):
        if self._orchestrator is None:
            self._orchestrator = MafaliaOrchestrator(self.data_dir)
        return self._orchestrator

    def execute(self, name: str, arguments: Dict[str, Any]) -> str:
        """Execute a tool call and return JSON string result."""
        try:
            if name == "ask_agent":
                return self._ask_agent(arguments)
            elif name == "orchestrate":
                return self._orchestrate(arguments)
            elif name == "business_summary":
                return self._business_summary()
            elif name == "search_knowledge":
                return self._search_knowledge(arguments)
            elif name == "get_metrics":
                return self._get_metrics()
            else:
                return json.dumps({"error": f"Unknown tool: {name}"})
        except Exception as e:
            return json.dumps({"error": str(e)})

    def _ask_agent(self, args: Dict) -> str:
        agent_name = args.get("agent", "zara")
        message = args.get("message", "overview")
        agent = get_agent(agent_name, self.data_dir)
        result = agent.process(message)
        profile = agent.profile
        return json.dumps({
            "agent": profile.name,
            "tag": profile.tag,
            "title": profile.title,
            "data": result,
        }, default=str, ensure_ascii=False)

    def _orchestrate(self, args: Dict) -> str:
        request = args.get("request", "")
        max_agents = args.get("max_agents", 3)
        result = self.orchestrator.orchestrate(request, max_agents=max_agents)
        return json.dumps(result, default=str, ensure_ascii=False)

    def _business_summary(self) -> str:
        result = self.orchestrator.full_business_summary()
        return json.dumps(result, default=str, ensure_ascii=False)

    def _search_knowledge(self, args: Dict) -> str:
        query = args.get("query", "")
        category = args.get("category")
        try:
            from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
            kb = MafaliaKnowledgeBase(self.data_dir)
            if category:
                results = kb.search(query, category=category)
            else:
                results = kb.search(query)
            return json.dumps(results, default=str, ensure_ascii=False)
        except Exception as e:
            return json.dumps({"error": f"Knowledge base: {e}"})

    def _get_metrics(self) -> str:
        result = self.orchestrator.get_key_metrics()
        return json.dumps(result, default=str, ensure_ascii=False)
