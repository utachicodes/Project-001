<div align="center">

# Mafalia AI Agent System

**10 specialized AI agents covering 20 products across 4 verticals**
**POS &middot; Finance/RH &middot; Hotel/Ops &middot; Equipment**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MCP](https://img.shields.io/badge/MCP-Anthropic-191919?logo=anthropic&logoColor=white)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## About

Mafalia AI is a multi-agent business intelligence platform for the **Mafalia ecosystem** — serving restaurants, retailers, hotels, and service businesses across West Africa. It exposes **10 named agents** through five interfaces: **Desktop App (Mafalia Code)**, MCP server, REST API, CLI, and web dashboard.

> **Note on model usage:** The agents are deterministic and rule-based. They process requests via keyword routing and return structured analytics from business data. No LLM API is called internally. Mafalia Code connects to any LLM provider (OpenAI, Anthropic, Google, OpenRouter) so users pick the model they want.

---

## Mafalia Code (Desktop App)

The flagship interface. A modern **Electron + React + TypeScript** desktop application with a beautiful dark UI inspired by Claude CoWork.

**Features:**
- **Beautiful Chat Interface** - Modern dark theme with color-coded agent responses
- **10 Agent Sidebar** - Click any agent for instant domain briefing
- **Quick Actions** - One-click Business Summary, Live Metrics, New Chat
- **Slash Commands** - `/summary`, `/metrics`, `/agents`, `/ask`, `/config`, `/help`
- **Multi-Provider LLM** - Connect OpenAI, Anthropic (Claude), Google (Gemini), OpenRouter, Ollama (local), or custom endpoints
- **Configuration Validation** - Automatic validation of API keys and Ollama connectivity on startup
- **Setup Wizard** - First-run configuration for API keys and settings
- **Real Business Data** - Powered by your 10 Mafalia agents with actual CSV data
- **Cloud Sync (Supabase)** - Optional cloud backup for chat sessions and agent memory
- **Environment Support** - Load API keys and config from `.env` files

**Architecture:**
- **Frontend:** Electron + React + TypeScript + TailwindCSS + Vite
- **Backend:** Python FastAPI bridge (`mafalia_code/bridge_api.py`) serves agent data
- **Build:** electron-builder creates standalone `.exe` installer

### Quick Start

```bash
# 1. Install Node dependencies
cd mafalia_code
npm install

# 2. Start Python bridge API (in another terminal)
python mafalia_code/bridge_api.py

# 3. Run Electron app in dev mode
npm run dev

# 4. Build production .exe
npm run package
# Output: release/MafaliaCode Setup.exe
```

### Configuration

Mafalia Code supports multiple LLM providers with automatic configuration validation:

**Supported Providers:**
- **OpenAI** - GPT-4o, GPT-4o-mini, GPT-4-turbo, o1-preview, o1-mini
- **Anthropic (Claude)** - claude-sonnet-4, claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus
- **Google (Gemini)** - gemini-2.5-pro, gemini-2.0-flash, gemini-1.5-pro
- **OpenRouter** - Access to 100+ models via single API key
- **Ollama (Local)** - llama3.2, llama3.1, mistral, gemma2, qwen2.5, phi3, deepseek-coder
- **Custom** - Any OpenAI-compatible endpoint

**Configuration Validation:**
- Automatic validation on startup checks API keys and Ollama connectivity
- Clear error messages guide you to fix configuration issues
- API key format validation (e.g., OpenAI keys must start with `sk-`)
- Ollama server connectivity check at `http://localhost:11434/v1`

**Setup Options:**
1. **API Key** - Enter your provider's API key in the Settings panel
2. **Environment Variable** - Set `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, or `OPENROUTER_API_KEY`
3. **.env File** - Store keys in `mafalia_code/.env` for automatic loading
4. **Ollama** - Run `ollama serve` locally, select Ollama provider in settings

**API Endpoint:**
- `GET /config/validate` - Check current configuration status

### Project Structure

```
mafalia_code/
├── electron/          # Electron main & preload scripts
├── src/
│   ├── components/    # React components (Sidebar, ChatArea, SetupWizard)
│   ├── App.tsx        # Main app component
│   ├── api.ts         # Python bridge API client
│   └── types.ts       # TypeScript type definitions
├── bridge_api.py      # Python FastAPI server for agent data
├── package.json       # Node dependencies & build config
└── BUILD.md          # Detailed build instructions
```

---

## Agents

<table>
<tr>
<td width="50%">

### `Zara` — Revenue Strategist `[REV]`
X-Ray Revenue &middot; Price Pulse &middot; Upsell Sniper &middot; Margin Sentinel &middot; Retail Revenue Lens

### `Kofi` — Operations Commander `[OPS]`
Bottleneck Radar &middot; Clock Commander &middot; Hotel Nerve Center &middot; Housekeeping Pulse &middot; Fleet Sync

### `Amara` — Customer Champion `[CUS]`
Churn Radar &middot; Loyalty Architect &middot; Sentiment Sonar &middot; Lifetime Value Engine &middot; Persona Builder

### `Idris` — Inventory Guardian `[INV]`
Stockout Prophet &middot; Waste Terminator &middot; Auto-Reorder Brain &middot; Supplier Scorecard &middot; Shelf Life Tracker

### `Nala` — Marketing Maven `[MKT]`
Campaign Forge &middot; A/B Lab &middot; Content Clockwork &middot; ROI Spotlight &middot; Audience Laser

</td>
<td width="50%">

### `Tariq` — Finance Wizard `[FIN]`
Cash Flow Oracle &middot; Credit Score Engine &middot; Payment Nexus &middot; Salary Card Ops &middot; Auto-Ledger

### `Sana` — Data Scientist `[DAT]`
Trend Seer &middot; Anomaly Hunter &middot; **Code Review** &middot; Carbon Gauge &middot; Insight Distiller

### `Ravi` — Tech Architect `[TEC]`
**Security Review** &middot; **Code Review** &middot; API Weaver &middot; Hardware Quartermaster &middot; Perf Tuner

### `Luna` — Growth Hacker `[GRO]`
Growth Loop Architect &middot; Funnel Surgeon &middot; Experiment Engine &middot; Referral Igniter &middot; Retention Alchemist

### `Omar` — Partnership Connector `[PAR]`
Deal Architect &middot; Network Mapper &middot; Supplier Scout &middot; Negotiation Engine &middot; Alliance Builder

</td>
</tr>
</table>

---

## Product Coverage

The system covers **Mafalia's 20 products** across 4 verticals:

| Vertical | Products | Primary Agents |
|----------|----------|---------------|
| **POS** | Restaurant POS, Detaillant, Campagnes Marketing | Zara, Nala |
| **Finance / RH** | Credit Scoring IA, API Paiement, Carte Mafalia, Comptabilite | Tariq |
| **Hotel / Ops** | Hotel PMS, Housekeeping, Transport, Fournisseurs, Carbone Mesure | Kofi, Sana, Idris |
| **Equipment** | Telephone POS, Terminaux, Tablettes & Kiosques, Imprimantes, PMS API | Ravi |

---

## Project Structure

```
mafalia_agents/           Core agent logic
  agents.py                 10 agent implementations (BaseMafaliaAgent)
  orchestrator.py           Smart routing + multi-agent coordination
  skills.py                 65+ structured skill definitions
  prompts.py                System prompts + few-shot examples

mafalia_knowledge/        Knowledge & Memory
  knowledge_base.py         30+ entries across 6 categories
  memory.py                 Per-agent short/long-term memory
  mempalace_integration.py  MemPalace backend (AAAK, tunnels, KG)

mafalia_api/              REST API
  api.py                    40+ FastAPI endpoints
  models.py                 Pydantic request/response models

mafalia_mcp/              Model Context Protocol
  server.py                 MCP server (stdio transport)
  tools.py                  23 MCP tool definitions
  executor.py               Tool execution + palace handlers

mafalia_cli/              Command Line Interface
  cli.py                    Typer + Rich interactive CLI

dashboard/                Web UI
  index.html                Live dashboard (Tailwind + Chart.js)

run_api.py                Launch FastAPI server
run_cli.py                Launch CLI
run_mcp.py                Launch MCP server
```

---

## Quick Start

### 1. Install

```bash
pip install -r requirements.txt
```

### 2. API Server

```bash
python run_api.py
```

| Endpoint | URL |
|----------|-----|
| **API** | http://localhost:8000 |
| **Docs** | http://localhost:8000/docs |
| **Dashboard** | http://localhost:8000/dashboard |

### 3. CLI

```bash
python run_cli.py agents                              # List agents
python run_cli.py ask zara "analyze our revenue"      # Ask an agent
python run_cli.py orchestrate "grow revenue"           # Auto-route
python run_cli.py summary                              # Full health check
python run_cli.py chat amara                           # Interactive chat
python run_cli.py knowledge search "food cost"         # Search KB
python run_cli.py metrics                              # Live metrics
```

### 4. MCP (Claude Desktop)

```bash
python run_mcp.py
```

Add to your Claude Desktop config:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mafalia": {
      "command": "python",
      "args": ["/path/to/projet_mafalia/run_mcp.py"]
    }
  }
}
```

---

## API Reference

<details>
<summary><strong>Agents</strong> — Core agent endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/agents` | List all 10 agents |
| `GET` | `/agents/{name}` | Agent profile |
| `POST` | `/agents/message` | Send message to agent |
| `GET` | `/agents/{name}/skills` | Agent skills |
| `GET` | `/agents/{name}/prompt` | System prompt |
| `GET` | `/agents/{name}/memory` | Memory state |

</details>

<details>
<summary><strong>Agent-Specific</strong> — Direct analytics endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/agents/zara/revenue` | Revenue analysis |
| `GET` | `/agents/zara/pricing` | Price optimization |
| `GET` | `/agents/zara/upsell` | Bundle opportunities |
| `GET` | `/agents/kofi/bottlenecks` | Bottleneck detection |
| `GET` | `/agents/kofi/efficiency` | Efficiency score |
| `GET` | `/agents/amara/customers` | Customer overview |
| `GET` | `/agents/amara/churn` | Churn prediction |
| `GET` | `/agents/amara/segments` | Segmentation |
| `GET` | `/agents/idris/stock` | Stock levels |
| `GET` | `/agents/idris/reorder` | Reorder suggestions |
| `GET` | `/agents/idris/waste` | Waste analysis |
| `GET` | `/agents/nala/campaigns` | Campaign ideas |
| `GET` | `/agents/tariq/cashflow` | Cash flow |
| `GET` | `/agents/tariq/health` | Financial health |
| `GET` | `/agents/sana/predictions` | Sales forecast |
| `GET` | `/agents/sana/anomalies` | Anomaly detection |
| `GET` | `/agents/luna/growth` | Growth strategies |
| `GET` | `/agents/omar/partnerships` | Partnerships |

</details>

<details>
<summary><strong>Orchestration</strong> — Multi-agent coordination</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orchestrate` | Auto-route to best agents |
| `GET` | `/orchestrate/summary` | Full business health check |
| `GET` | `/orchestrate/metrics` | Key metrics snapshot |

</details>

<details>
<summary><strong>Knowledge Base</strong> — Domain knowledge</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/knowledge` | All categories |
| `POST` | `/knowledge/search` | Search by query |
| `GET` | `/knowledge/{id}` | Get entry by ID |
| `POST` | `/knowledge` | Add custom entry |
| `GET` | `/knowledge/stats/summary` | KB statistics |

</details>

<details>
<summary><strong>MemPalace</strong> — AI memory system</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/palace/status` | Full palace status |
| `GET` | `/palace/wings` | List all wings |
| `GET` | `/palace/taxonomy` | Wings / halls / rooms tree |
| `POST` | `/palace/store` | Store data in agent wing |
| `GET` | `/palace/recall/{agent}` | Recall agent context |
| `POST` | `/palace/diary/{agent}` | Write diary entry |
| `GET` | `/palace/diary/{agent}` | Read diary entries |
| `POST` | `/palace/tunnel` | Create cross-agent tunnel |
| `GET` | `/palace/tunnels/{agent}` | Find agent tunnels |
| `POST` | `/palace/search` | Search palace |
| `GET` | `/palace/kg/entity/{subj}` | Query KG entity |
| `GET` | `/palace/kg/timeline/{subj}` | Entity timeline |
| `GET` | `/palace/kg/stats` | KG statistics |

</details>

---

## MCP Tools

**23 tools** exposed via Model Context Protocol:

<details>
<summary><strong>Agent Tools</strong> (17)</summary>

| Tool | Description |
|------|-------------|
| `ask_agent` | Send message to any named agent |
| `orchestrate_agents` | Auto-route complex requests |
| `list_agents` | List all agents with profiles |
| `get_agent_profile` | Detailed agent profile |
| `analyze_revenue` | Zara: revenue analysis |
| `analyze_operations` | Kofi: operations analysis |
| `analyze_customers` | Amara: customer analysis |
| `analyze_inventory` | Idris: inventory analysis |
| `get_marketing_strategy` | Nala: marketing strategy |
| `analyze_finances` | Tariq: financial analysis |
| `get_data_insights` | Sana: data insights |
| `get_tech_recommendations` | Ravi: tech recommendations |
| `get_growth_strategies` | Luna: growth strategies |
| `get_partnership_opportunities` | Omar: partnerships |
| `search_knowledge_base` | Search knowledge base |
| `get_business_summary` | Full business summary |
| `get_agent_memory` | Agent memory state |

</details>

<details>
<summary><strong>MemPalace Tools</strong> (6)</summary>

| Tool | Description |
|------|-------------|
| `palace_status` | Full palace status -- wings, rooms, drawers, tunnels, KG |
| `palace_search` | Search with wing+room scoping (34% retrieval boost) |
| `palace_diary_write` | Write AAAK entry to agent diary |
| `palace_diary_read` | Read last N diary entries |
| `palace_tunnel` | Create cross-agent insight tunnel |
| `palace_kg_query` | Query temporal knowledge graph |

</details>

---

## Memory System

Each agent maintains layered memory:

| Layer | Scope | Persistence |
|-------|-------|-------------|
| **Short-term** | Session | In-memory |
| **Long-term** | Cross-session | JSON on disk |
| **Conversation** | Last 100 turns | In-memory |
| **Global** | Cross-agent shared | Shared dict |
| **MemPalace** | Full palace backend | SQLite + AAAK files |

Powered by [MemPalace](https://github.com/milla-jovovich/mempalace) -- palace structure with AAAK compression (30x, zero loss), cross-agent tunnels, and a temporal knowledge graph.

```
palace/
  wing_{agent}/
    halls/       Facts, events, discoveries, preferences, advice
    rooms/       Domain-specific closets (AAAK) + drawers (raw)
    diary.aaak   Persistent agent diary
  tunnels/       Cross-agent insight links
  knowledge_graph.db   Temporal entity-relationship triples
```

---

## Data Files

| File | Used by |
|------|---------|
| `transactions_rows.csv` | Zara, Tariq, Sana |
| `produits_rows.csv` | Zara, Idris |
| `produits_commandes_rows.csv` | Zara, Amara |
| `clients_rows.csv` | Amara |
| `commandes_rows.csv` | Kofi |
| `entrees_stock_rows.csv` | Idris |
| `sorties_stock_rows.csv` | Idris |
| `promotions_rows.csv` | Nala |
| `informations_employees_rows.csv` | Kofi |
| `categories_rows.csv` | Multiple |
| `menus_rows.csv` | Multiple |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Language** | Python 3.10+ |
| **API** | FastAPI + Uvicorn |
| **Protocol** | MCP SDK (Anthropic) |
| **Memory** | MemPalace (AAAK + KG) |
| **CLI** | Typer + Rich |
| **Validation** | Pydantic v2 |
| **Data** | Pandas + NumPy |
| **Dashboard** | TailwindCSS + Chart.js |

---

## Adding a New Agent

1. Subclass `BaseMafaliaAgent` in `mafalia_agents/agents.py`
2. Implement `_get_profile()` and `process()`
3. Add to `ALL_AGENTS` registry
4. Add routing keywords in `orchestrator.py`
5. Add skills in `skills.py`
6. Add system prompt in `prompts.py`
7. Register MCP tool in `tools.py`

---

## License

MIT -- [Mafalia.com](https://mafalia.com)

---

<div align="center">
<sub>Built for African businesses by Mafalia</sub>
</div>
