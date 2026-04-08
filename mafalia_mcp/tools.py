# -*- coding: utf-8 -*-
"""
Mafalia MCP Tools
=================
Tool definitions for the Model Context Protocol server.
Each tool maps to an agent capability or data operation.
"""

import sys
import os
from typing import Any, Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


MAFALIA_TOOLS = [
    {
        "name": "ask_agent",
        "description": (
            "Send a message to a specific Mafalia named agent. "
            "Available agents: zara (revenue), kofi (operations), amara (customers), "
            "idris (inventory), nala (marketing), tariq (finance), sana (data science), "
            "ravi (tech), luna (growth), omar (partnerships)."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "agent_name": {
                    "type": "string",
                    "description": "Name of the agent to query (zara/kofi/amara/idris/nala/tariq/sana/ravi/luna/omar)",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
                "message": {
                    "type": "string",
                    "description": "The question or request to send to the agent",
                },
            },
            "required": ["agent_name", "message"],
        },
    },
    {
        "name": "orchestrate_agents",
        "description": (
            "Ask the Agent Orchestrator to route a complex request to the best agent(s). "
            "The orchestrator automatically selects the most relevant agent(s) and combines results."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "request": {
                    "type": "string",
                    "description": "The complex business question or task to orchestrate across agents",
                },
                "max_agents": {
                    "type": "integer",
                    "description": "Maximum number of agents to involve (default: 3)",
                    "default": 3,
                },
            },
            "required": ["request"],
        },
    },
    {
        "name": "list_agents",
        "description": "List all available Mafalia AI agents with their profiles, superpowers, and expertise areas.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "get_agent_profile",
        "description": "Get the detailed profile of a specific Mafalia agent.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "agent_name": {
                    "type": "string",
                    "description": "Name of the agent",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
            },
            "required": ["agent_name"],
        },
    },
    {
        "name": "analyze_revenue",
        "description": "Get a revenue analysis from Zara (Revenue Strategist). Includes total revenue, trends, best/worst days.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: revenue, pricing, profit, upsell, or trends",
                    "enum": ["revenue", "pricing", "profit", "upsell", "trends"],
                    "default": "revenue",
                },
            },
            "required": [],
        },
    },
    {
        "name": "analyze_operations",
        "description": "Get an operations analysis from Kofi (Operations Commander). Covers order flow, bottlenecks, efficiency.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: orders, bottlenecks, efficiency, delivery, or staff",
                    "enum": ["orders", "bottlenecks", "efficiency", "delivery", "staff"],
                    "default": "orders",
                },
            },
            "required": [],
        },
    },
    {
        "name": "analyze_customers",
        "description": "Get customer analysis from Amara (Customer Champion). Covers churn, loyalty, segmentation, CLV.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: overview, churn, loyalty, segments, or clv",
                    "enum": ["overview", "churn", "loyalty", "segments", "clv"],
                    "default": "overview",
                },
            },
            "required": [],
        },
    },
    {
        "name": "analyze_inventory",
        "description": "Get inventory analysis from Idris (Inventory Guardian). Covers stock levels, reorders, waste, expiry.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: stock, reorder, waste, expiry, or suppliers",
                    "enum": ["stock", "reorder", "waste", "expiry", "suppliers"],
                    "default": "stock",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_marketing_strategy",
        "description": "Get marketing strategies from Nala (Marketing Maven). Covers campaigns, social media, promotions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: campaigns, social, promotions, calendar, or roi",
                    "enum": ["campaigns", "social", "promotions", "calendar", "roi"],
                    "default": "campaigns",
                },
            },
            "required": [],
        },
    },
    {
        "name": "analyze_finances",
        "description": "Get financial analysis from Tariq (Finance Wizard). Covers cash flow, health score, budget, tax, investment.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: cashflow, health, budget, tax, or investment",
                    "enum": ["cashflow", "health", "budget", "tax", "investment"],
                    "default": "health",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_data_insights",
        "description": "Get data science insights from Sana (Data Scientist). Covers predictions, patterns, anomalies, correlations.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: predict, patterns, anomalies, correlations, or insights",
                    "enum": ["predict", "patterns", "anomalies", "correlations", "insights"],
                    "default": "insights",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_tech_recommendations",
        "description": "Get technology recommendations from Ravi (Tech Architect). Covers APIs, security, performance, stack, automation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: api, security, performance, stack, or automation",
                    "enum": ["api", "security", "performance", "stack", "automation"],
                    "default": "stack",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_growth_strategies",
        "description": "Get growth strategies from Luna (Growth Hacker). Covers growth loops, funnels, experiments, viral mechanics.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: growth, funnel, experiments, viral, or retention",
                    "enum": ["growth", "funnel", "experiments", "viral", "retention"],
                    "default": "growth",
                },
            },
            "required": [],
        },
    },
    {
        "name": "get_partnership_opportunities",
        "description": "Get partnership opportunities from Omar (Partnership Connector). Covers partners, suppliers, deals, ecosystem.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "Focus area: partnerships, suppliers, deals, ecosystem, or financing",
                    "enum": ["partnerships", "suppliers", "deals", "ecosystem", "financing"],
                    "default": "partnerships",
                },
            },
            "required": [],
        },
    },
    {
        "name": "search_knowledge_base",
        "description": "Search the Mafalia knowledge base for business information, best practices, and domain knowledge.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query to look up in the knowledge base",
                },
                "category": {
                    "type": "string",
                    "description": "Optional category to filter: restaurant, finance, marketing, operations, technology",
                    "enum": ["restaurant", "finance", "marketing", "operations", "technology", "all"],
                    "default": "all",
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_business_summary",
        "description": "Get a comprehensive business summary by activating multiple agents simultaneously. The ultimate business health check.",
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "get_agent_memory",
        "description": "Retrieve the memory/history of a specific agent including past tasks and stored context.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "agent_name": {
                    "type": "string",
                    "description": "Name of the agent",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
            },
            "required": ["agent_name"],
        },
    },
    {
        "name": "palace_status",
        "description": (
            "Get the full MemPalace status — wings, rooms, drawers, tunnels, "
            "knowledge graph stats. Shows memory structure for all 10 agents."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "palace_search",
        "description": (
            "Search the MemPalace for stored agent memories using wing+room scoping "
            "(34% retrieval improvement over flat search). Returns AAAK-compressed closet entries."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query",
                },
                "agent_name": {
                    "type": "string",
                    "description": "Optional: scope to a specific agent's wing",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
                "room": {
                    "type": "string",
                    "description": "Optional: scope to a specific room within the wing",
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "palace_diary_write",
        "description": (
            "Write an AAAK-formatted entry to an agent's persistent diary. "
            "The diary survives across sessions, giving agents long-term memory."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "agent_name": {
                    "type": "string",
                    "description": "Agent whose diary to write to",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
                "entry": {
                    "type": "string",
                    "description": "AAAK-formatted diary entry (e.g. 'REV.trend:+8%|top.item:thieb|action:raise.price|\u2605\u2605\u2605')",
                },
            },
            "required": ["agent_name", "entry"],
        },
    },
    {
        "name": "palace_diary_read",
        "description": "Read the last N diary entries from an agent's MemPalace diary.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "agent_name": {
                    "type": "string",
                    "description": "Agent whose diary to read",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
                "last_n": {
                    "type": "integer",
                    "description": "Number of recent entries to return (default: 10)",
                    "default": 10,
                },
            },
            "required": ["agent_name"],
        },
    },
    {
        "name": "palace_tunnel",
        "description": (
            "Create a cross-agent tunnel — a shared insight between two agents' wings. "
            "e.g. Zara detects revenue decline → tunnel to Nala for marketing campaign."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "from_agent": {
                    "type": "string",
                    "description": "Source agent",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
                "to_agent": {
                    "type": "string",
                    "description": "Destination agent",
                    "enum": ["zara", "kofi", "amara", "idris", "nala", "tariq", "sana", "ravi", "luna", "omar"],
                },
                "topic": {
                    "type": "string",
                    "description": "Topic of the shared insight",
                },
                "insight": {
                    "type": "string",
                    "description": "The insight content",
                },
            },
            "required": ["from_agent", "to_agent", "topic", "insight"],
        },
    },
    {
        "name": "palace_kg_query",
        "description": "Query the MemPalace knowledge graph for temporal facts about an entity (agent, product, customer, etc).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "entity": {
                    "type": "string",
                    "description": "Entity name to query (e.g. 'zara', 'thieboudienne', 'revenue')",
                },
            },
            "required": ["entity"],
        },
    },
]


MAFALIA_RESOURCES = [
    {
        "uri": "mafalia://agents",
        "name": "Mafalia AI Agents",
        "description": "All 10 named Mafalia AI agents with their profiles and superpowers",
        "mimeType": "application/json",
    },
    {
        "uri": "mafalia://knowledge",
        "name": "Mafalia Knowledge Base",
        "description": "Structured knowledge base with restaurant business best practices",
        "mimeType": "application/json",
    },
    {
        "uri": "mafalia://metrics",
        "name": "Business Metrics",
        "description": "Real-time business metrics from the Mafalia platform",
        "mimeType": "application/json",
    },
    {
        "uri": "mafalia://data/transactions",
        "name": "Transaction Data",
        "description": "Restaurant transaction records",
        "mimeType": "text/csv",
    },
    {
        "uri": "mafalia://data/customers",
        "name": "Customer Data",
        "description": "Customer profiles and behavior data",
        "mimeType": "text/csv",
    },
    {
        "uri": "mafalia://palace",
        "name": "MemPalace Status",
        "description": "Full MemPalace memory system status — wings, rooms, drawers, tunnels, knowledge graph",
        "mimeType": "application/json",
    },
]


MAFALIA_PROMPTS = [
    {
        "name": "business_health_check",
        "description": "Complete business health check prompt using all 10 agents",
        "arguments": [
            {
                "name": "focus_area",
                "description": "Specific area to focus on (optional)",
                "required": False,
            }
        ],
    },
    {
        "name": "revenue_optimization",
        "description": "Revenue optimization prompt using Zara and Tariq",
        "arguments": [],
    },
    {
        "name": "customer_retention_strategy",
        "description": "Customer retention strategy using Amara and Luna",
        "arguments": [
            {
                "name": "timeframe",
                "description": "Timeframe for retention strategy (e.g., 30 days, 90 days)",
                "required": False,
            }
        ],
    },
    {
        "name": "inventory_optimization",
        "description": "Inventory optimization prompt using Idris",
        "arguments": [],
    },
    {
        "name": "growth_plan",
        "description": "Full growth plan using Luna, Nala, and Omar",
        "arguments": [
            {
                "name": "budget",
                "description": "Available budget for growth initiatives",
                "required": False,
            }
        ],
    },
]
