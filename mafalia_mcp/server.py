# -*- coding: utf-8 -*-
"""
Mafalia MCP Server
==================
Model Context Protocol server for the Mafalia AI Agent ecosystem.
Exposes all 10 named agents as MCP tools accessible to any MCP client (Claude, etc).

Usage:
    python -m mafalia_mcp.server
    # or
    python run_mcp.py
"""

import asyncio
import json
import sys
import os
from typing import Any, Sequence

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import mcp.types as types
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False

from mafalia_mcp.tools import MAFALIA_TOOLS, MAFALIA_RESOURCES, MAFALIA_PROMPTS
from mafalia_mcp.executor import execute_tool, get_resource_content, render_prompt

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(DATA_DIR)


def create_mcp_server():
    """Create and configure the Mafalia MCP Server."""
    if not MCP_AVAILABLE:
        raise ImportError(
            "MCP SDK not installed. Run: pip install mcp"
        )

    server = Server("mafalia-mcp")

    @server.list_tools()
    async def list_tools() -> list[types.Tool]:
        return [
            types.Tool(
                name=t["name"],
                description=t["description"],
                inputSchema=t["inputSchema"],
            )
            for t in MAFALIA_TOOLS
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
        result = await execute_tool(name, arguments, data_dir=PROJECT_DIR)
        return [types.TextContent(type="text", text=json.dumps(result, ensure_ascii=False, indent=2))]

    @server.list_resources()
    async def list_resources() -> list[types.Resource]:
        return [
            types.Resource(
                uri=r["uri"],
                name=r["name"],
                description=r["description"],
                mimeType=r.get("mimeType", "application/json"),
            )
            for r in MAFALIA_RESOURCES
        ]

    @server.read_resource()
    async def read_resource(uri: str) -> str:
        content = await get_resource_content(uri, data_dir=PROJECT_DIR)
        return json.dumps(content, ensure_ascii=False, indent=2)

    @server.list_prompts()
    async def list_prompts() -> list[types.Prompt]:
        return [
            types.Prompt(
                name=p["name"],
                description=p["description"],
                arguments=[
                    types.PromptArgument(
                        name=a["name"],
                        description=a["description"],
                        required=a.get("required", False),
                    )
                    for a in p.get("arguments", [])
                ],
            )
            for p in MAFALIA_PROMPTS
        ]

    @server.get_prompt()
    async def get_prompt(name: str, arguments: dict | None = None) -> types.GetPromptResult:
        prompt_text = await render_prompt(name, arguments or {}, data_dir=PROJECT_DIR)
        return types.GetPromptResult(
            description=f"Mafalia prompt: {name}",
            messages=[
                types.PromptMessage(
                    role="user",
                    content=types.TextContent(type="text", text=prompt_text),
                )
            ],
        )

    return server


async def run_server():
    """Run the MCP server over stdio."""
    server = create_mcp_server()
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


def main():
    """Entry point for the Mafalia MCP server."""
    print("Mafalia MCP Server starting...", file=sys.stderr)
    print("Exposing 10 AI agents via Model Context Protocol", file=sys.stderr)
    print("Tools: " + ", ".join(t["name"] for t in MAFALIA_TOOLS), file=sys.stderr)
    asyncio.run(run_server())


if __name__ == "__main__":
    main()
