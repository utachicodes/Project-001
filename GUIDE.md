# Mafalia Intelligence Platform — Operations Guide

Welcome to the **Mafalia Intelligence Platform**, a desktop-first command center for multi-agent business orchestration. This guide covers installation, operation, and testing.

## 1. Quick Start

### Prerequisites
- **Python 3.10+** (for the bridge API and agents)
- **Node.js 18+** (for the Electron frontend)
- **Git**

### Installation
1.  **Clone the Repository**:
    ```bash
    git clone <repo_url>
    cd Project-001
    ```
2.  **Setup Backend**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Setup Frontend**:
    ```bash
    cd mafalia_code
    npm install
    ```

### Running the Platform
1.  **Start Bridge API** (Terminal 1):
    ```bash
    python mafalia_code/bridge_api.py
    ```
2.  **Start Electron App** (Terminal 2):
    ```bash
    cd mafalia_code
    npm run dev
    ```

## 2. Platform Architecture

## ── System Overview ──────────────────────────────────────────────

Mafalia is an intelligence platform that orchestrates **11 specialized business agents**. It bridges a modern React/TypeScript frontend with a powerful Python/FastAPI backend to provide deep analytical insights from your local and cloud data.

### 🔑 Key Components
- **AI Core**: Powered by **OpenRouter** (Recommended: `z-ai/glm-4.5-air:free`).
- **Data Engine**: Processes CSV files (Revenue, Inventory, Customers) locally.
- **Design System**: Premium HSL-based tokens with official **Mafalia Branding**.

## 3. Core Features & Commands

Type `/` in the chat to see the command palette.

### Business Intelligence
- `/summary`: Generates a full health check of all business verticals.
- `/metrics`: Displays live KPIs (Revenue, Inventory, Customers).
- `/ask <agent> <question>`: Query a specific agent (e.g., `/ask zara analyze pricing`).

### Desktop & Data
- `/browse [path]`: View local directories.
- `/csvs`: Auto-detect and summarize all business data files in the workspace.
- `/scrape <url>`: Extract and analyze content from any webpage.

### Ecosystem
- `/boss`: View the high-level orchestration status.
- `/rooms`: See where each agent is currently operating.

## 4. Connectivity & Database

### Local Data (CSV)
The agents automatically load data from `*_rows.csv` files in the root directory.
- `transactions_rows.csv`: Sales and revenue data.
- `produits_rows.csv`: Product and inventory data.
- `clients_rows.csv`: Customer profiles.

### Cloud Sync (Supabase)
To enable cloud backup and multi-device sync, add your Supabase credentials to `.env`:
```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

## 5. Testing & Verification

### Automated Tests
Run the full suite of 220+ tests:
```bash
pytest
```

### Manual Verification Flow
1.  **Health Check**: Run `Invoke-RestMethod -Uri http://127.0.0.1:9777/health`.
2.  **Agent Discovery**: Run `/agents` in the app to verify all 11 agents are online.
3.  **Data Pulse**: Run `/metrics` to verify CSV data is being parsed correctly.
4.  **UI Audit**: Verify that the logo, HSL colors, and hover states match the premium Mafalia design language.

---
*Created by Antigravity AI for Mafalia.*
