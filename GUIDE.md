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

The system consists of three layers:
1.  **Frontend (Electron/React)**: Premium UI matching `mafalia.com`, built with TypeScript and Tailwind.
2.  **Bridge API (FastAPI)**: Connects the frontend to the local file system and agents. Runs on port `9777`.
3.  **Agents (Python)**: 10 specialized agents (`Zara`, `Kofi`, etc.) that process deterministic business rules and CSV data.

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
2.  **Agent Discovery**: Run `/agents` in the app to verify all 10 agents are online.
3.  **Data Pulse**: Run `/metrics` to verify CSV data is being parsed correctly.
4.  **UI Audit**: Verify that the logo, HSL colors, and hover states match the premium Mafalia design language.

---
*Created by Antigravity AI for Mafalia.*
