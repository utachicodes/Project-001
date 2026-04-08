# -*- coding: utf-8 -*-
"""
Mafalia MCP Executor
=====================
Handles tool execution, resource reading, and prompt rendering for the MCP server.
"""

import json
import os
import sys
from typing import Any, Dict, Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def execute_tool(name: str, arguments: Dict[str, Any], data_dir: str = ".") -> Dict:
    """Execute an MCP tool and return the result."""
    try:
        if name == "ask_agent":
            return await _tool_ask_agent(arguments, data_dir)
        elif name == "orchestrate_agents":
            return await _tool_orchestrate(arguments, data_dir)
        elif name == "list_agents":
            return await _tool_list_agents(data_dir)
        elif name == "get_agent_profile":
            return await _tool_get_profile(arguments, data_dir)
        elif name == "analyze_revenue":
            return await _tool_agent_action("zara", arguments.get("focus", "revenue"), data_dir)
        elif name == "analyze_operations":
            return await _tool_agent_action("kofi", arguments.get("focus", "orders"), data_dir)
        elif name == "analyze_customers":
            return await _tool_agent_action("amara", arguments.get("focus", "overview"), data_dir)
        elif name == "analyze_inventory":
            return await _tool_agent_action("idris", arguments.get("focus", "stock"), data_dir)
        elif name == "get_marketing_strategy":
            return await _tool_agent_action("nala", arguments.get("focus", "campaigns"), data_dir)
        elif name == "analyze_finances":
            return await _tool_agent_action("tariq", arguments.get("focus", "health"), data_dir)
        elif name == "get_data_insights":
            return await _tool_agent_action("sana", arguments.get("focus", "insights"), data_dir)
        elif name == "get_tech_recommendations":
            return await _tool_agent_action("ravi", arguments.get("focus", "stack"), data_dir)
        elif name == "get_growth_strategies":
            return await _tool_agent_action("luna", arguments.get("focus", "growth"), data_dir)
        elif name == "get_partnership_opportunities":
            return await _tool_agent_action("omar", arguments.get("focus", "partnerships"), data_dir)
        elif name == "search_knowledge_base":
            return await _tool_search_knowledge(arguments, data_dir)
        elif name == "get_business_summary":
            return await _tool_business_summary(data_dir)
        elif name == "get_agent_memory":
            return await _tool_get_memory(arguments, data_dir)
        elif name == "palace_status":
            return await _tool_palace_status(data_dir)
        elif name == "palace_search":
            return await _tool_palace_search(arguments, data_dir)
        elif name == "palace_diary_write":
            return await _tool_palace_diary_write(arguments, data_dir)
        elif name == "palace_diary_read":
            return await _tool_palace_diary_read(arguments, data_dir)
        elif name == "palace_tunnel":
            return await _tool_palace_tunnel(arguments, data_dir)
        elif name == "palace_kg_query":
            return await _tool_palace_kg_query(arguments, data_dir)
        else:
            return {"error": f"Unknown tool: {name}"}
    except Exception as e:
        return {"error": str(e), "tool": name}


async def _tool_ask_agent(arguments: Dict, data_dir: str) -> Dict:
    """Route a message to a specific agent."""
    from mafalia_agents.agents import get_agent
    agent_name = arguments.get("agent_name", "").lower()
    message = arguments.get("message", "")
    if not agent_name or not message:
        return {"error": "Both agent_name and message are required"}
    agent = get_agent(agent_name, data_dir)
    result = agent.process(message)
    return {
        "agent": agent_name,
        "agent_tag": agent.profile.tag,
        "agent_title": agent.profile.title,
        "message": message,
        "response": result,
    }


async def _tool_orchestrate(arguments: Dict, data_dir: str) -> Dict:
    """Orchestrate a request across multiple agents."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator
    request = arguments.get("request", "")
    max_agents = arguments.get("max_agents", 3)
    if not request:
        return {"error": "Request is required"}
    orchestrator = MafaliaOrchestrator(data_dir)
    return orchestrator.orchestrate(request, max_agents=max_agents)


async def _tool_list_agents(data_dir: str) -> Dict:
    """List all available agents."""
    from mafalia_agents.agents import list_agents
    agents = list_agents()
    return {"agents": agents, "count": len(agents)}


async def _tool_get_profile(arguments: Dict, data_dir: str) -> Dict:
    """Get detailed profile of a specific agent."""
    from mafalia_agents.agents import get_agent
    agent_name = arguments.get("agent_name", "").lower()
    if not agent_name:
        return {"error": "agent_name is required"}
    agent = get_agent(agent_name, data_dir)
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


async def _tool_agent_action(agent_name: str, focus: str, data_dir: str) -> Dict:
    """Execute a specific agent action based on focus."""
    from mafalia_agents.agents import get_agent
    agent = get_agent(agent_name, data_dir)
    result = agent.process(focus)
    return {
        "agent": agent_name,
        "focus": focus,
        "result": result,
    }


async def _tool_search_knowledge(arguments: Dict, data_dir: str) -> Dict:
    """Search the knowledge base."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    query = arguments.get("query", "")
    category = arguments.get("category", "all")
    kb = MafaliaKnowledgeBase(data_dir)
    results = kb.search(query, category=category if category != "all" else None)
    return {"query": query, "category": category, "results": results}


async def _tool_business_summary(data_dir: str) -> Dict:
    """Get a full business summary from multiple agents."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator
    orchestrator = MafaliaOrchestrator(data_dir)
    return orchestrator.full_business_summary()


async def _tool_get_memory(arguments: Dict, data_dir: str) -> Dict:
    """Get agent memory."""
    from mafalia_agents.agents import get_agent
    agent_name = arguments.get("agent_name", "").lower()
    if not agent_name:
        return {"error": "agent_name is required"}
    agent = get_agent(agent_name, data_dir)
    return {
        "agent": agent_name,
        "memory": agent.memory,
        "task_history_count": len(agent.task_history),
        "recent_tasks": agent.task_history[-5:] if agent.task_history else [],
    }


async def _tool_palace_status(data_dir: str) -> Dict:
    """Get full MemPalace status."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(data_dir)
    return palace.status()


async def _tool_palace_search(arguments: Dict, data_dir: str) -> Dict:
    """Search the MemPalace."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(data_dir)
    query = arguments.get("query", "")
    agent_name = arguments.get("agent_name")
    room = arguments.get("room")
    return {"results": palace.search(query, agent_name=agent_name, room=room)}


async def _tool_palace_diary_write(arguments: Dict, data_dir: str) -> Dict:
    """Write to an agent's MemPalace diary."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(data_dir)
    agent_name = arguments.get("agent_name", "")
    entry = arguments.get("entry", "")
    if not agent_name or not entry:
        return {"error": "Both agent_name and entry are required"}
    return palace.agent_diary_write(agent_name, entry)


async def _tool_palace_diary_read(arguments: Dict, data_dir: str) -> Dict:
    """Read an agent's MemPalace diary."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(data_dir)
    agent_name = arguments.get("agent_name", "")
    last_n = arguments.get("last_n", 10)
    if not agent_name:
        return {"error": "agent_name is required"}
    return {"agent": agent_name, "diary": palace.agent_diary_read(agent_name, last_n=last_n)}


async def _tool_palace_tunnel(arguments: Dict, data_dir: str) -> Dict:
    """Create a cross-agent tunnel."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(data_dir)
    from_agent = arguments.get("from_agent", "")
    to_agent = arguments.get("to_agent", "")
    topic = arguments.get("topic", "")
    insight = arguments.get("insight", "")
    if not all([from_agent, to_agent, topic, insight]):
        return {"error": "from_agent, to_agent, topic, and insight are all required"}
    return palace.store_cross_agent_insight(from_agent, to_agent, topic, insight)


async def _tool_palace_kg_query(arguments: Dict, data_dir: str) -> Dict:
    """Query the knowledge graph."""
    from mafalia_knowledge.mempalace_integration import MafaliaPalace
    palace = MafaliaPalace(data_dir)
    entity = arguments.get("entity", "")
    if not entity:
        return {"error": "entity is required"}
    return {"entity": entity, "triples": palace.kg.query_entity(entity)}


async def get_resource_content(uri: str, data_dir: str = ".") -> Any:
    """Read a Mafalia resource by URI."""
    if uri == "mafalia://agents":
        from mafalia_agents.agents import list_agents, AGENT_PROFILES
        return {
            "agents": list_agents(),
            "total": len(list_agents()),
        }
    elif uri == "mafalia://knowledge":
        from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
        kb = MafaliaKnowledgeBase(data_dir)
        return kb.get_all_categories()
    elif uri == "mafalia://metrics":
        from mafalia_agents.orchestrator import MafaliaOrchestrator
        orch = MafaliaOrchestrator(data_dir)
        return orch.get_key_metrics()
    elif uri == "mafalia://data/transactions":
        import pandas as pd
        path = os.path.join(data_dir, "transactions_rows.csv")
        if os.path.exists(path):
            df = pd.read_csv(path)
            return df.head(100).to_dict("records")
        return {"error": "transactions_rows.csv not found"}
    elif uri == "mafalia://data/customers":
        import pandas as pd
        path = os.path.join(data_dir, "clients_rows.csv")
        if os.path.exists(path):
            df = pd.read_csv(path)
            return df.head(100).to_dict("records")
        return {"error": "clients_rows.csv not found"}
    elif uri == "mafalia://palace":
        from mafalia_knowledge.mempalace_integration import MafaliaPalace
        palace = MafaliaPalace(data_dir)
        return palace.status()
    else:
        return {"error": f"Unknown resource URI: {uri}"}


async def render_prompt(name: str, arguments: Dict, data_dir: str = ".") -> str:
    """Render a named MCP prompt template."""
    if name == "business_health_check":
        focus = arguments.get("focus_area", "all areas")
        return f"""You are a business intelligence AI with access to 10 specialized Mafalia agents.

Perform a COMPLETE business health check for the restaurant business, focusing on: {focus}

Use the following agents in sequence:
1. [REV] Zara (Revenue Strategist) - analyze total revenue, trends, pricing opportunities
2. [OPS] Kofi (Operations Commander) - identify operational bottlenecks and efficiency scores
3. [CUS] Amara (Customer Champion) - segment customers, identify churn risks
4. [INV] Idris (Inventory Guardian) - check stock levels and reorder needs
5. [MKT] Nala (Marketing Maven) - suggest top 3 marketing campaigns
6. [FIN] Tariq (Finance Wizard) - calculate financial health score
7. [DAT] Sana (Data Scientist) - find key patterns and anomalies
8. [TEC] Ravi (Tech Architect) - assess tech stack and automation opportunities
9. [GRO] Luna (Growth Hacker) - identify top growth levers
10. [PAR] Omar (Partnership Connector) - recommend partnership opportunities

Format the output as a structured report with:
- Executive Summary (3-5 bullet points)
- Critical Issues (if any)
- Top 5 Opportunities
- Recommended Next Steps (prioritized)

Start the analysis now using the available tools."""

    elif name == "revenue_optimization":
        return """You are Zara and Tariq, working together to maximize restaurant revenue.

Activate both agents to:
1. [REV] Zara: Analyze current revenue patterns, identify pricing opportunities, find upsell moments
2. [FIN] Tariq: Calculate financial health, project cash flow, recommend budget allocation

Combine insights to produce a Revenue Optimization Report with:
- Current Revenue Status
- Top 3 Pricing Adjustments
- Bundle/Upsell Opportunities
- 30-day Revenue Projection
- Financial Health Score

Use the analyze_revenue and analyze_finances tools."""

    elif name == "customer_retention_strategy":
        timeframe = arguments.get("timeframe", "30 days")
        return f"""You are Amara and Luna, the customer retention dream team.

Create a customer retention strategy for the next {timeframe}.

1. [CUS] Amara: Run full customer analysis - segments, churn risk, loyalty data, CLV
2. [GRO] Luna: Design retention experiments, win-back campaigns, growth loops

Deliver a Retention Strategy Report with:
- At-risk customer count and profiles
- Loyalty tier distribution
- 3 retention campaigns (ready to launch)
- Predicted retention improvement: __%
- Quick wins vs long-term plays

Use analyze_customers and get_growth_strategies tools."""

    elif name == "inventory_optimization":
        return """You are Idris, the Inventory Guardian, protecting against waste and stockouts.

Run a complete inventory optimization:
1. Check all current stock levels (critical/low/normal)
2. Generate purchase orders for items below threshold
3. Identify waste patterns and root causes
4. Flag items expiring within 7 days
5. Score each supplier

Deliver an Inventory Action Report with:
- Stock Status Dashboard
- Urgent Purchase Orders (prioritized)
- Waste Reduction Actions
- Expiry Alert List
- Supplier Scorecard

Use the analyze_inventory tool."""

    elif name == "growth_plan":
        budget = arguments.get("budget", "unspecified budget")
        return f"""You are Luna, Nala, and Omar - the Growth Trinity.

Design a full growth plan with {budget} budget.

1. [GRO] Luna: Map the growth funnel, design 3 experiments, identify viral loops
2. [MKT] Nala: Create 90-day content calendar, design top campaigns
3. [PAR] Omar: Find partnership opportunities, identify supplier savings

Deliver a Growth Plan with:
- Growth Model Canvas
- Top 5 Experiments to Run
- Marketing Calendar (this month)
- Partnership Pipeline
- Expected Growth: +__% in 90 days
- Budget Allocation Recommendation

Use get_growth_strategies, get_marketing_strategy, and get_partnership_opportunities tools."""

    else:
        return f"Execute the Mafalia AI agent task: {name}\n\nArguments: {json.dumps(arguments, indent=2)}"
