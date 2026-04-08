# -*- coding: utf-8 -*-
"""
Mafalia FastAPI REST Server
============================
Production-grade REST API for the Mafalia AI Agent ecosystem.
Replaces the Flask coach_api.py with a modern, async FastAPI server.

Endpoints:
  - /agents         : Agent management
  - /orchestrate    : Multi-agent orchestration
  - /knowledge      : Knowledge base
  - /skills         : Agent skill catalog
  - /prompts        : Prompt templates
  - /metrics        : Business metrics
  - /health         : Health check
  - /dashboard      : Serve web dashboard

Usage:
    uvicorn mafalia_api.api:app --host 0.0.0.0 --port 8000 --reload
    # or
    python run_api.py
"""

import os
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from mafalia_api.models import (
    AgentMessageRequest, AgentMessageResponse,
    OrchestrateRequest, KnowledgeSearchRequest, KnowledgeAddRequest,
    AgentMemorySetRequest, HealthResponse, AgentProfileResponse,
)

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(
    title="Mafalia AI Agent API",
    description=(
        "REST API for the Mafalia AI Agent ecosystem.\n\n"
        "10 named AI agents (Zara, Kofi, Amara, Idris, Nala, Tariq, Sana, Ravi, Luna, Omar) "
        "with full orchestration, knowledge base, and MCP server support."
    ),
    version="1.0.0",
    contact={"name": "Mafalia", "url": "https://mafalia.com"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DASHBOARD_DIR = os.path.join(DATA_DIR, "dashboard")
if os.path.exists(DASHBOARD_DIR):
    app.mount("/static", StaticFiles(directory=DASHBOARD_DIR), name="static")


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "mafalia-agent-api",
        "version": "1.0.0",
        "agents": 10,
        "data_dir": DATA_DIR,
    }


@app.get("/", response_class=HTMLResponse, tags=["System"])
async def root():
    """Redirect to dashboard or show API info."""
    dashboard_path = os.path.join(DASHBOARD_DIR, "index.html")
    if os.path.exists(dashboard_path):
        with open(dashboard_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="""
    <html><body style="font-family:monospace;padding:40px;background:#0a0a0a;color:#00ff88">
    <h1>Mafalia AI Agent API</h1>
    <p>10 named AI agents ready. <a href="/docs" style="color:#ff6b35">API Docs</a></p>
    <ul>
    <li>[REV] Zara - Revenue Strategist</li><li>[OPS] Kofi - Operations Commander</li>
    <li>[CUS] Amara - Customer Champion</li><li>[INV] Idris - Inventory Guardian</li>
    <li>[MKT] Nala - Marketing Maven</li><li>[FIN] Tariq - Finance Wizard</li>
    <li>[DAT] Sana - Data Scientist</li><li>[TEC] Ravi - Tech Architect</li>
    <li>[GRO] Luna - Growth Hacker</li><li>[PAR] Omar - Partnership Connector</li>
    </ul></body></html>
    """)


# ─────────────────────────────────────────────────────────────────────────────
# AGENTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/agents", tags=["Agents"])
async def list_all_agents():
    """List all 10 Mafalia AI agents with profiles."""
    from mafalia_agents.agents import list_agents
    agents = list_agents()
    return {"agents": agents, "count": len(agents)}


@app.get("/agents/{agent_name}", tags=["Agents"])
async def get_agent_profile(agent_name: str):
    """Get the detailed profile of a specific agent."""
    try:
        from mafalia_agents.agents import get_agent
        agent = get_agent(agent_name.lower(), DATA_DIR)
        p = agent.profile
        return {
            "name": p.name,
            "title": p.title,
            "personality": p.personality.value,
            "description": p.description,
            "tag": p.tag,
            "color": p.color,
            "voice_style": p.voice_style,
            "superpowers": p.superpowers,
            "expertise_areas": p.expertise_areas,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/agents/message", tags=["Agents"])
async def send_agent_message(request: AgentMessageRequest):
    """Send a message to a specific agent and get a response."""
    from mafalia_agents.agents import get_agent
    agent = get_agent(request.agent.value, DATA_DIR)
    result = agent.process(request.message)
    return {
        "agent": request.agent.value,
        "tag": agent.profile.tag,
        "title": agent.profile.title,
        "message": request.message,
        "response": result,
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/agents/{agent_name}/skills", tags=["Agents"])
async def get_agent_skills(agent_name: str):
    """Get all skills for a specific agent."""
    from mafalia_agents.skills import get_skills_for_agent
    skills = get_skills_for_agent(agent_name.lower())
    if not skills:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    return {
        "agent": agent_name.lower(),
        "skills": [
            {
                "id": s.id, "name": s.name, "description": s.description,
                "category": s.category.value, "difficulty": s.difficulty,
                "estimated_time": s.estimated_time, "examples": s.examples,
            }
            for s in skills
        ],
    }


@app.get("/agents/{agent_name}/prompt", tags=["Agents"])
async def get_agent_prompt(agent_name: str):
    """Get the system prompt for a specific agent."""
    from mafalia_agents.prompts import get_system_prompt, get_few_shot_examples
    prompt = get_system_prompt(agent_name.lower())
    examples = get_few_shot_examples(agent_name.lower())
    return {
        "agent": agent_name.lower(),
        "system_prompt": prompt,
        "few_shot_examples": examples,
    }


@app.get("/agents/{agent_name}/memory", tags=["Agents"])
async def get_agent_memory(agent_name: str):
    """Get the memory state of a specific agent."""
    try:
        from mafalia_agents.agents import get_agent
        agent = get_agent(agent_name.lower(), DATA_DIR)
        return {
            "agent": agent_name.lower(),
            "memory": agent.memory,
            "task_history_count": len(agent.task_history),
            "recent_tasks": agent.task_history[-5:],
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# AGENT-SPECIFIC ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/agents/zara/revenue", tags=["Zara - Revenue"])
async def zara_revenue():
    """Zara: Full revenue analysis."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("zara", DATA_DIR)
    return agent._analyze_revenue()


@app.get("/agents/zara/pricing", tags=["Zara - Revenue"])
async def zara_pricing():
    """Zara: Price optimization recommendations."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("zara", DATA_DIR)
    return agent._optimize_pricing()


@app.get("/agents/zara/upsell", tags=["Zara - Revenue"])
async def zara_upsell():
    """Zara: Upsell and bundle opportunities."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("zara", DATA_DIR)
    return agent._find_upsell_opportunities()


@app.get("/agents/kofi/operations", tags=["Kofi - Operations"])
async def kofi_operations():
    """Kofi: Order flow analysis."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("kofi", DATA_DIR)
    return agent._analyze_order_flow()


@app.get("/agents/kofi/bottlenecks", tags=["Kofi - Operations"])
async def kofi_bottlenecks():
    """Kofi: Bottleneck detection."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("kofi", DATA_DIR)
    return agent._detect_bottlenecks()


@app.get("/agents/kofi/efficiency", tags=["Kofi - Operations"])
async def kofi_efficiency():
    """Kofi: Efficiency score."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("kofi", DATA_DIR)
    return agent._efficiency_score()


@app.get("/agents/amara/customers", tags=["Amara - Customers"])
async def amara_customers():
    """Amara: Customer overview."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("amara", DATA_DIR)
    return agent._analyze_customers()


@app.get("/agents/amara/churn", tags=["Amara - Customers"])
async def amara_churn():
    """Amara: Churn prediction."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("amara", DATA_DIR)
    return agent._predict_churn()


@app.get("/agents/amara/segments", tags=["Amara - Customers"])
async def amara_segments():
    """Amara: Customer segmentation."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("amara", DATA_DIR)
    return agent._segment_customers()


@app.get("/agents/idris/stock", tags=["Idris - Inventory"])
async def idris_stock():
    """Idris: Current stock levels."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("idris", DATA_DIR)
    return agent._current_stock()


@app.get("/agents/idris/reorder", tags=["Idris - Inventory"])
async def idris_reorder():
    """Idris: Reorder suggestions."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("idris", DATA_DIR)
    return agent._reorder_suggestions()


@app.get("/agents/idris/waste", tags=["Idris - Inventory"])
async def idris_waste():
    """Idris: Waste analysis."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("idris", DATA_DIR)
    return agent._waste_analysis()


@app.get("/agents/nala/campaigns", tags=["Nala - Marketing"])
async def nala_campaigns():
    """Nala: Campaign ideas."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("nala", DATA_DIR)
    return agent._campaign_ideas()


@app.get("/agents/nala/social", tags=["Nala - Marketing"])
async def nala_social():
    """Nala: Social media strategy."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("nala", DATA_DIR)
    return agent._social_strategy()


@app.get("/agents/tariq/cashflow", tags=["Tariq - Finance"])
async def tariq_cashflow():
    """Tariq: Cash flow analysis."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("tariq", DATA_DIR)
    return agent._cash_flow()


@app.get("/agents/tariq/health", tags=["Tariq - Finance"])
async def tariq_health():
    """Tariq: Financial health score."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("tariq", DATA_DIR)
    return agent._financial_health()


@app.get("/agents/sana/predictions", tags=["Sana - Data Science"])
async def sana_predictions():
    """Sana: 7-day sales forecast."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("sana", DATA_DIR)
    return agent._predict_sales()


@app.get("/agents/sana/anomalies", tags=["Sana - Data Science"])
async def sana_anomalies():
    """Sana: Anomaly detection."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("sana", DATA_DIR)
    return agent._detect_anomalies()


@app.get("/agents/luna/growth", tags=["Luna - Growth"])
async def luna_growth():
    """Luna: Growth strategies."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("luna", DATA_DIR)
    return agent._growth_strategies()


@app.get("/agents/omar/partnerships", tags=["Omar - Partnerships"])
async def omar_partnerships():
    """Omar: Partnership opportunities."""
    from mafalia_agents.agents import get_agent
    agent = get_agent("omar", DATA_DIR)
    return agent._partnership_opportunities()


# ─────────────────────────────────────────────────────────────────────────────
# ORCHESTRATION
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/orchestrate", tags=["Orchestration"])
async def orchestrate(request: OrchestrateRequest):
    """Route a request to the most relevant agents automatically."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator
    orch = MafaliaOrchestrator(DATA_DIR)
    return orch.orchestrate(request.request, max_agents=request.max_agents)


@app.get("/orchestrate/summary", tags=["Orchestration"])
async def full_business_summary():
    """Run a full business health check using all 10 agents simultaneously."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator
    orch = MafaliaOrchestrator(DATA_DIR)
    return orch.full_business_summary()


@app.get("/orchestrate/metrics", tags=["Orchestration"])
async def key_metrics():
    """Get key business metrics snapshot from all agents."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator
    orch = MafaliaOrchestrator(DATA_DIR)
    return orch.get_key_metrics()


@app.get("/orchestrate/capabilities", tags=["Orchestration"])
async def agent_capabilities():
    """List all agent capabilities for the orchestrator routing map."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator
    orch = MafaliaOrchestrator(DATA_DIR)
    return orch.list_agent_capabilities()


# ─────────────────────────────────────────────────────────────────────────────
# KNOWLEDGE BASE
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/knowledge", tags=["Knowledge Base"])
async def knowledge_overview():
    """Get overview of all knowledge base categories."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    kb = MafaliaKnowledgeBase(DATA_DIR)
    return kb.get_all_categories()


@app.post("/knowledge/search", tags=["Knowledge Base"])
async def search_knowledge(request: KnowledgeSearchRequest):
    """Search the knowledge base by query and optional category."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    kb = MafaliaKnowledgeBase(DATA_DIR)
    results = kb.search(request.query, category=request.category, top_k=request.top_k)
    return {"query": request.query, "category": request.category, "results": results}


@app.get("/knowledge/category/{category}", tags=["Knowledge Base"])
async def get_by_category(category: str):
    """Get all knowledge entries in a category."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    kb = MafaliaKnowledgeBase(DATA_DIR)
    entries = kb.get_by_category(category)
    return {"category": category, "entries": entries, "count": len(entries)}


@app.get("/knowledge/{entry_id}", tags=["Knowledge Base"])
async def get_knowledge_entry(entry_id: str):
    """Get a specific knowledge entry by ID."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    kb = MafaliaKnowledgeBase(DATA_DIR)
    entry = kb.get_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Entry '{entry_id}' not found")
    return entry


@app.post("/knowledge", tags=["Knowledge Base"])
async def add_knowledge(request: KnowledgeAddRequest):
    """Add a new custom entry to the knowledge base."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    kb = MafaliaKnowledgeBase(DATA_DIR)
    entry = kb.add_entry(
        title=request.title,
        content=request.content,
        category=request.category,
        tags=request.tags,
        source=request.source,
    )
    return {"created": True, "entry": entry}


@app.get("/knowledge/stats/summary", tags=["Knowledge Base"])
async def knowledge_stats():
    """Get knowledge base statistics."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    kb = MafaliaKnowledgeBase(DATA_DIR)
    return kb.stats()


# ─────────────────────────────────────────────────────────────────────────────
# SKILLS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/skills", tags=["Skills"])
async def all_skills():
    """Get complete skill catalog for all 10 agents."""
    from mafalia_agents.skills import get_all_skills, skills_summary
    return {
        "summary": skills_summary(),
        "skills": get_all_skills(),
    }


@app.get("/skills/summary", tags=["Skills"])
async def skills_summary_endpoint():
    """Get a summary of all skills by category and difficulty."""
    from mafalia_agents.skills import skills_summary
    return skills_summary()


@app.get("/skills/{skill_id}", tags=["Skills"])
async def get_skill(skill_id: str):
    """Get a specific skill by ID (e.g., zara_01)."""
    from mafalia_agents.skills import get_skill_by_id
    skill = get_skill_by_id(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    return skill


@app.get("/skills/category/{category}", tags=["Skills"])
async def skills_by_category(category: str):
    """Get all skills in a specific category."""
    from mafalia_agents.skills import get_skills_by_category
    skills = get_skills_by_category(category)
    return {"category": category, "skills": skills}


# ─────────────────────────────────────────────────────────────────────────────
# PROMPTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/prompts", tags=["Prompts"])
async def all_prompts():
    """Get overview of all agent prompts."""
    from mafalia_agents.prompts import get_all_prompts
    return get_all_prompts()


@app.get("/prompts/{agent_name}", tags=["Prompts"])
async def get_agent_prompt_full(agent_name: str):
    """Get the full system prompt for an agent."""
    from mafalia_agents.prompts import get_system_prompt, get_few_shot_examples
    prompt = get_system_prompt(agent_name.lower())
    examples = get_few_shot_examples(agent_name.lower())
    return {
        "agent": agent_name.lower(),
        "system_prompt": prompt,
        "few_shot_examples": examples,
        "character_count": len(prompt),
    }


# ─────────────────────────────────────────────────────────────────────────────
# MCP INFO
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/mcp/tools", tags=["MCP"])
async def mcp_tools():
    """List all MCP tools exposed by the Mafalia server."""
    from mafalia_mcp.tools import MAFALIA_TOOLS
    return {"tools": MAFALIA_TOOLS, "count": len(MAFALIA_TOOLS)}


@app.get("/mcp/resources", tags=["MCP"])
async def mcp_resources():
    """List all MCP resources."""
    from mafalia_mcp.tools import MAFALIA_RESOURCES
    return {"resources": MAFALIA_RESOURCES}


@app.get("/mcp/prompts", tags=["MCP"])
async def mcp_prompts():
    """List all MCP prompt templates."""
    from mafalia_mcp.tools import MAFALIA_PROMPTS
    return {"prompts": MAFALIA_PROMPTS}


@app.get("/mcp/config", tags=["MCP"])
async def mcp_config():
    """Get Claude Desktop MCP configuration snippet."""
    return {
        "claude_desktop_config": {
            "mcpServers": {
                "mafalia": {
                    "command": "python",
                    "args": ["run_mcp.py"],
                    "description": "Mafalia AI Agents - 10 specialized business intelligence agents",
                }
            }
        },
        "instructions": "Add the above to your Claude Desktop claude_desktop_config.json file",
        "config_path_windows": "%APPDATA%\\Claude\\claude_desktop_config.json",
        "config_path_mac": "~/Library/Application Support/Claude/claude_desktop_config.json",
    }


# ─────────────────────────────────────────────────────────────────────────────
# MEMPALACE
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/palace/status", tags=["MemPalace"])
async def palace_status():
    """Get full MemPalace status — wings, rooms, drawers, tunnels, knowledge graph."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return palace.status()


@app.get("/palace/wings", tags=["MemPalace"])
async def palace_wings():
    """List all palace wings (one per agent)."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return {"wings": palace.list_wings()}


@app.get("/palace/taxonomy", tags=["MemPalace"])
async def palace_taxonomy():
    """Full palace taxonomy: wings → halls → rooms."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return palace.get_taxonomy()


@app.post("/palace/store", tags=["MemPalace"])
async def palace_store(agent: str, room: str, data: Dict[str, Any]):
    """Store data in an agent's palace wing (drawer + AAAK closet)."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return palace.store_agent_memory(agent, room, data)


@app.get("/palace/recall/{agent_name}", tags=["MemPalace"])
async def palace_recall(agent_name: str, room: Optional[str] = None, last_n: int = 5):
    """Recall an agent's palace context (AAAK closets + diary)."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return palace.recall_agent_context(agent_name, room=room, last_n=last_n)


@app.post("/palace/diary/{agent_name}", tags=["MemPalace"])
async def palace_diary_write(agent_name: str, entry: str):
    """Write an AAAK entry to an agent's diary."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return palace.agent_diary_write(agent_name, entry)


@app.get("/palace/diary/{agent_name}", tags=["MemPalace"])
async def palace_diary_read(agent_name: str, last_n: int = 10):
    """Read an agent's diary entries."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return {"agent": agent_name, "diary": palace.agent_diary_read(agent_name, last_n=last_n)}


@app.post("/palace/tunnel", tags=["MemPalace"])
async def palace_tunnel(from_agent: str, to_agent: str, topic: str, insight: str):
    """Create a cross-agent tunnel (shared insight between wings)."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return palace.store_cross_agent_insight(from_agent, to_agent, topic, insight)


@app.get("/palace/tunnels/{agent_name}", tags=["MemPalace"])
async def palace_tunnels(agent_name: str):
    """Find all tunnels connected to an agent."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return {"agent": agent_name, "tunnels": palace.find_tunnels(agent_name)}


@app.post("/palace/search", tags=["MemPalace"])
async def palace_search(query: str, agent: Optional[str] = None, room: Optional[str] = None):
    """Search the palace (wing+room scoping for 34% retrieval boost)."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return {"results": palace.search(query, agent_name=agent, room=room)}


@app.get("/palace/kg/entity/{subject}", tags=["MemPalace"])
async def palace_kg_query(subject: str):
    """Query knowledge graph for an entity."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return {"entity": subject, "triples": palace.kg.query_entity(subject)}


@app.get("/palace/kg/timeline/{subject}", tags=["MemPalace"])
async def palace_kg_timeline(subject: str):
    """Get chronological timeline for an entity."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return {"entity": subject, "timeline": palace.kg.timeline(subject)}


@app.get("/palace/kg/stats", tags=["MemPalace"])
async def palace_kg_stats():
    """Knowledge graph statistics."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(DATA_DIR)
    return palace.kg.stats()


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/dashboard", response_class=HTMLResponse, tags=["Dashboard"])
async def dashboard():
    """Serve the agent monitoring web dashboard."""
    dashboard_path = os.path.join(DASHBOARD_DIR, "index.html")
    if os.path.exists(dashboard_path):
        with open(dashboard_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Dashboard not found. Run the build to generate dashboard/index.html</h1>")
