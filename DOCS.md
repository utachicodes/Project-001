# Mafalia AI Agent System - Documentation

## Overview
Mafalia AI is a multi-agent business intelligence platform designed for the Mafalia ecosystem. It features 10 specialized AI agents that provide actionable insights across various business verticals: POS, Finance, Operations, and Marketing.

## 10 Specialized AI Agents

| Agent | Vertical | Superpowers |
|-------|----------|-------------|
| **Zara** | Revenue | Pricing optimization, Profit margin analysis, Upsell detection |
| **Kofi** | Operations | Bottleneck detection, Staff scheduling, Hotel PMS orchestration |
| **Amara** | Customers | Churn prediction, Loyalty design, Segmentation |
| **Idris** | Inventory | Stockout forecasting, Waste reduction, Auto-reordering |
| **Nala** | Marketing | Campaign generation, Social strategy, ROI tracking |
| **Tariq** | Finance | Cash flow oracle, Credit scoring, Automated accounting |
| **Sana** | Data | Trend prediction, Anomaly detection, Carbon footprint |
| **Ravi** | Tech | Security auditing, API integration, Hardware fleet |
| **Luna** | Growth | Growth loops, Funnel surgery, Experiment design |
| **Omar** | Partners | Deal architecture, Supplier scouting, Ecosystem mapping |

---

## Interfaces

### 1. Desktop App (Mafalia Code)
The flagship desktop interface built with Electron and React.
- **Location:** `mafalia_code/`
- **Usage:**
  - `cd mafalia_code && npm install`
  - `python mafalia_code/bridge_api.py` (Starts the backend bridge)
  - `npm run dev` (Starts the desktop app)

### 2. Web Dashboard
A clean, real-time monitoring interface.
- **Access:** http://localhost:8000/dashboard (requires API server running)
- **Features:** KPI monitoring, Agent status, Live alerts.

### 3. REST API
FastAPI-powered backend for programmatic access.
- **Launch:** `python run_api.py`
- **Docs:** http://localhost:8000/docs

### 4. CLI
Interactive command-line interface.
- **Usage:** `python run_cli.py agents` or `python run_cli.py summary`

### 5. MCP (Model Context Protocol)
Connect Mafalia agents directly to Claude Desktop.
- **Usage:** `python run_mcp.py`
- **Config:** Add the configuration snippet found in the Dashboard or API `/mcp/config` to your Claude Desktop config file.

---

## Database & Data Files
The system uses a combination of CSV-based local data and optional Supabase cloud synchronization.
- **CSV Files:** Located in the root directory (e.g., `transactions_rows.csv`). These are automatically loaded by agents.
- **Cloud Sync:** Configurable in `mafalia_code/src/supabase.ts` for cross-device memory and session storage.

## Developer Guide
- **Tests:** Run `python3 -m pytest tests/` to verify logic and API stability.
- **Redesign:** UI styles are managed in `mafalia_code/src/index.css` (Desktop) and `dashboard/index.html` (Web).
