# -*- coding: utf-8 -*-
"""
Mafalia FastAPI Server Launcher
================================
Run: python run_api.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("  MAFALIA AI AGENT API")
    print("=" * 60)
    print("  10 agents: Zara | Kofi | Amara | Idris | Nala")
    print("             Tariq | Sana | Ravi | Luna | Omar")
    print()
    print("  API:       http://localhost:8000")
    print("  Docs:      http://localhost:8000/docs")
    print("  Dashboard: http://localhost:8000/dashboard")
    print("=" * 60)
    print()

    uvicorn.run(
        "mafalia_api.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
