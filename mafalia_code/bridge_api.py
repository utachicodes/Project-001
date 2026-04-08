# -*- coding: utf-8 -*-
"""
Mafalia Code -- Python Bridge API
====================================
FastAPI server that the Electron app calls to execute agent tools.
This bridges the TypeScript frontend to the Python agent backend.
"""

import os
import sys
import json
from typing import Dict, Any, Optional
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mafalia_agents.agents import get_agent, list_agents, ALL_AGENTS
from mafalia_agents.orchestrator import MafaliaOrchestrator

app = FastAPI(title="Mafalia Code Bridge API", version="1.0.0")

# CORS for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Electron local file access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global orchestrator instance
_orchestrator: Optional[MafaliaOrchestrator] = None
DATA_DIR = os.environ.get("MAFALIA_DATA_DIR", ".")


def get_orchestrator() -> MafaliaOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = MafaliaOrchestrator(DATA_DIR)
    return _orchestrator


# ── Request/Response Models ────────────────────────────────────────────

class AskAgentRequest(BaseModel):
    agent: str
    message: str


class OrchestrateRequest(BaseModel):
    request: str
    max_agents: int = 3


class ConfigRequest(BaseModel):
    provider: str
    model: str
    api_key: str
    base_url: Optional[str] = None
    data_dir: str = "."


# ── API Endpoints ────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "agents": 10}


@app.get("/agents")
def get_all_agents():
    """List all 10 agents with their profiles."""
    return list_agents()


@app.post("/agents/ask")
def ask_agent(req: AskAgentRequest):
    """Ask a specific agent a question."""
    try:
        agent = get_agent(req.agent, DATA_DIR)
        result = agent.process(req.message)
        profile = agent.profile
        return {
            "agent": profile.name,
            "tag": profile.tag,
            "title": profile.title,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/orchestrate")
def orchestrate(req: OrchestrateRequest):
    """Orchestrate a request across multiple agents."""
    try:
        orch = get_orchestrator()
        result = orch.orchestrate(req.request, max_agents=req.max_agents)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/summary")
def business_summary():
    """Get full business summary from all agents."""
    try:
        orch = get_orchestrator()
        result = orch.full_business_summary()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/metrics")
def get_metrics():
    """Get live business metrics."""
    try:
        orch = get_orchestrator()
        result = orch.get_key_metrics()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/config")
def save_config(req: ConfigRequest):
    """Save configuration (returns success, actual config stored by Electron)."""
    return {"saved": True}


# ── Main ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9777)
