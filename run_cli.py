# -*- coding: utf-8 -*-
"""
Mafalia CLI Launcher
=====================
Interactive command-line interface for all 10 Mafalia AI agents.

Usage:
    python run_cli.py                              # Show help
    python run_cli.py agents                       # List all agents
    python run_cli.py ask zara "revenue"           # Ask Zara about revenue
    python run_cli.py orchestrate "grow revenue"   # Auto-route question
    python run_cli.py summary                      # Full business health check
    python run_cli.py chat zara                    # Start interactive chat
    python run_cli.py skills zara                  # Show Zara's skills
    python run_cli.py knowledge search "kpi"       # Search knowledge base
    python run_cli.py metrics                      # Live business metrics
    python run_cli.py profile zara                 # Show agent profile
    python run_cli.py mcp-config                   # Show MCP setup
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    from mafalia_cli.cli import main
    main()
