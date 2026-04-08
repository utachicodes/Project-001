# -*- coding: utf-8 -*-
"""
Mafalia MCP Server Launcher
=============================
Model Context Protocol server — connect to Claude Desktop or any MCP client.

Run: python run_mcp.py

Add to Claude Desktop config (~/.config/Claude/claude_desktop_config.json):
{
  "mcpServers": {
    "mafalia": {
      "command": "python",
      "args": ["/path/to/run_mcp.py"]
    }
  }
}
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    try:
        from mafalia_mcp.server import main
        main()
    except ImportError as e:
        print(f"ERROR: MCP SDK not installed. Run: pip install mcp", file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
        sys.exit(1)
