# -*- coding: utf-8 -*-
"""
Mafalia CLI - Agent Command Line Interface
==========================================
Interactive command-line interface for all 10 Mafalia AI agents.

Usage:
    python run_cli.py                         # Interactive mode
    python run_cli.py ask zara "revenue"      # Ask a specific agent
    python run_cli.py orchestrate "question"  # Auto-route to best agent(s)
    python run_cli.py agents                  # List all agents
    python run_cli.py summary                 # Full business summary
    python run_cli.py skills zara             # List agent skills
    python run_cli.py knowledge search "kpi"  # Search knowledge base
"""

import os
import sys
import json
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.columns import Columns
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.syntax import Syntax
from rich import box

app = typer.Typer(
    name="mafalia",
    help="Mafalia AI Agents -- 10 specialized business intelligence agents",
    add_completion=False,
)

console = Console()

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

AGENT_COLORS = {
    "zara": "bright_yellow",
    "kofi": "bright_cyan",
    "amara": "bright_magenta",
    "idris": "bright_green",
    "nala": "orange3",
    "tariq": "medium_purple3",
    "sana": "bright_white",
    "ravi": "bright_red",
    "luna": "medium_orchid3",
    "omar": "spring_green3",
}

AGENT_TAGS = {
    "zara": "[REV]", "kofi": "[OPS]", "amara": "[CUS]", "idris": "[INV]",
    "nala": "[MKT]", "tariq": "[FIN]", "sana": "[DAT]", "ravi": "[TEC]",
    "luna": "[GRO]", "omar": "[PAR]",
}


def _print_header():
    console.print()
    console.print(Panel.fit(
        "[bold bright_green]MAFALIA AI AGENTS[/bold bright_green]\n"
        "[dim]10 specialized business intelligence agents[/dim]",
        border_style="bright_green",
    ))
    console.print()


def _print_agent_response(agent_name: str, result: dict):
    tag = AGENT_TAGS.get(agent_name, "[AGT]")
    color = AGENT_COLORS.get(agent_name, "white")

    def _format_value(v, indent=0):
        pad = "  " * indent
        if isinstance(v, dict):
            lines = []
            for k, val in v.items():
                lines.append(f"{pad}[bold]{k}[/bold]: {_format_value(val, indent+1)}")
            return "\n".join(lines)
        elif isinstance(v, list):
            if not v:
                return "[dim](empty)[/dim]"
            items = []
            for item in v[:8]:
                if isinstance(item, dict):
                    sub = " | ".join(f"[bold]{k}[/bold]: {val}" for k, val in list(item.items())[:4])
                    items.append(f"{pad}  • {sub}")
                else:
                    items.append(f"{pad}  • {item}")
            if len(v) > 8:
                items.append(f"{pad}  [dim]... +{len(v)-8} more[/dim]")
            return "\n" + "\n".join(items)
        else:
            return str(v)

    content = _format_value(result)
    console.print(Panel(
        content,
        title=f"[bold {color}]{emoji} {agent_name.upper()}[/bold {color}]",
        border_style=color,
        expand=False,
    ))


# ─────────────────────────────────────────────────────────────────────────────
# COMMANDS
# ─────────────────────────────────────────────────────────────────────────────

@app.command()
def agents():
    """List all 10 Mafalia AI agents with their superpowers."""
    _print_header()
    from mafalia_agents.agents import list_agents
    agent_list = list_agents()

    table = Table(title="Mafalia AI Agents", box=box.ROUNDED, border_style="bright_green")
    table.add_column("Agent", style="bold", width=10)
    table.add_column("Title", width=22)
    table.add_column("Superpowers", width=50)
    table.add_column("Expertise", width=40)

    for a in agent_list:
        name = a["name"]
        color = AGENT_COLORS.get(name.lower(), "white")
        tag = AGENT_TAGS.get(name.lower(), "[AGT]")
        table.add_row(
            f"[{color}]{tag} {name}[/{color}]",
            f"[dim]{a['title']}[/dim]",
            "[dim]" + " · ".join(a["superpowers"][:3]) + "[/dim]",
            "[dim]" + ", ".join(a["expertise"][:3]) + "[/dim]",
        )

    console.print(table)
    console.print(f"\n[dim]Use: [bold]mafalia ask <agent> <message>[/bold] to query an agent[/dim]\n")


@app.command()
def ask(
    agent_name: str = typer.Argument(..., help="Agent name: zara/kofi/amara/idris/nala/tariq/sana/ravi/luna/omar"),
    message: str = typer.Argument(..., help="Message or question for the agent"),
):
    """Ask a specific agent a question."""
    from mafalia_agents.agents import get_agent

    with Progress(SpinnerColumn(), TextColumn(f"[bold]{AGENT_TAGS.get(agent_name.lower(),'[AGT]')} {agent_name.capitalize()} is thinking..."),
                  transient=True) as progress:
        progress.add_task("", total=None)
        try:
            agent = get_agent(agent_name.lower(), DATA_DIR)
            result = agent.process(message)
        except ValueError as e:
            console.print(f"[red]Error: {e}[/red]")
            raise typer.Exit(1)

    _print_agent_response(agent_name.lower(), result)


@app.command()
def orchestrate(
    request: str = typer.Argument(..., help="Business question to route to best agents"),
    max_agents: int = typer.Option(3, "--max", "-n", help="Max number of agents to involve"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
):
    """Auto-route a request to the most relevant agents."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator

    with Progress(SpinnerColumn(), TextColumn("[bold bright_green]Orchestrating across agents..."),
                  transient=True) as progress:
        progress.add_task("", total=None)
        orch = MafaliaOrchestrator(DATA_DIR)
        result = orch.orchestrate(request, max_agents=max_agents)

    if json_output:
        console.print(Syntax(json.dumps(result, indent=2, ensure_ascii=False), "json", theme="monokai"))
        return

    console.print()
    console.print(Panel.fit(
        f"[bold bright_white]Request:[/bold bright_white] {request}\n"
        f"[dim]Agents consulted: {result['agents_consulted']} | "
        f"Time: {result['execution_time']}[/dim]",
        title="[bold bright_green]Orchestration Result[/bold bright_green]",
        border_style="bright_green",
    ))

    for r in result.get("results", []):
        _print_agent_response(r["agent"], r["response"])


@app.command()
def summary():
    """Run a full business health check using all 10 agents."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator

    with Progress(SpinnerColumn(), TextColumn("[bold bright_green]Running full business health check (10 agents)..."),
                  transient=True) as progress:
        progress.add_task("", total=None)
        orch = MafaliaOrchestrator(DATA_DIR)
        result = orch.full_business_summary()

    console.print()
    console.print(Panel.fit(
        f"[bold]Agents Active:[/bold] {result['agents_active']}/10\n"
        f"[bold]Execution Time:[/bold] {result['execution_time']}\n"
        f"[bold]Generated:[/bold] {result['generated_at'][:19]}",
        title="[bold bright_green]Full Business Summary[/bold bright_green]",
        border_style="bright_green",
    ))

    alerts = result.get("cross_agent_alerts", [])
    if alerts:
        console.print()
        console.print("[bold]Alerts:[/bold]")
        for alert in alerts:
            severity_color = {"high": "red", "medium": "yellow", "low": "green"}.get(alert["severity"], "white")
            console.print(f"  [{severity_color}]{alert['message']}[/{severity_color}]  [dim]→ {alert['action']}[/dim]")

    opps = result.get("top_opportunities", [])
    if opps:
        console.print()
        console.print("[bold]Top Opportunities:[/bold]")
        for opp in opps:
            console.print(f"  [bright_green]• {opp['opportunity']}[/bright_green] [dim]({opp['impact']})[/dim]")

    console.print()
    console.print("[dim]Use [bold]mafalia ask <agent> <topic>[/bold] to drill deeper into any area.[/dim]\n")


@app.command()
def skills(
    agent_name: Optional[str] = typer.Argument(None, help="Agent name (optional, shows all if omitted)"),
):
    """Show agent skill catalog."""
    from mafalia_agents.skills import get_all_skills, get_skills_for_agent, skills_summary

    if agent_name:
        skill_list = get_skills_for_agent(agent_name.lower())
        if not skill_list:
            console.print(f"[red]Agent '{agent_name}' not found.[/red]")
            raise typer.Exit(1)

        color = AGENT_COLORS.get(agent_name.lower(), "white")
        tag = AGENT_TAGS.get(agent_name.lower(), "[AGT]")

        table = Table(title=f"{tag} {agent_name.capitalize()} Skills", box=box.ROUNDED, border_style=color)
        table.add_column("ID", style="dim", width=10)
        table.add_column("Skill", width=28)
        table.add_column("Category", width=16)
        table.add_column("Difficulty", width=10)
        table.add_column("Time", width=8)
        table.add_column("Example", width=40)

        diff_colors = {"easy": "bright_green", "medium": "yellow", "hard": "red"}
        for s in skill_list:
            dc = diff_colors.get(s.difficulty, "white")
            table.add_row(
                s.id, s.name, s.category.value,
                f"[{dc}]{s.difficulty}[/{dc}]",
                s.estimated_time,
                s.examples[0] if s.examples else "",
            )
        console.print(table)
    else:
        smry = skills_summary()
        console.print()
        console.print(Panel(
            f"[bold]Total Skills:[/bold] {smry['total_skills']}\n"
            f"[bold]Agents:[/bold] {smry['agents']}\n\n"
            + "\n".join(f"  [bold]{a}[/bold]: {c} skills" for a, c in smry["skills_per_agent"].items()),
            title="[bold bright_green]Skill Catalog[/bold bright_green]",
            border_style="bright_green",
        ))


@app.command()
def knowledge(
    action: str = typer.Argument(..., help="Action: search / list / add / stats"),
    query: Optional[str] = typer.Argument(None, help="Search query or title"),
    category: Optional[str] = typer.Option(None, "--category", "-c", help="Filter by category"),
):
    """Manage the Mafalia knowledge base."""
    from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase
    kb = MafaliaKnowledgeBase(DATA_DIR)

    if action == "search":
        if not query:
            console.print("[red]Provide a search query.[/red]")
            raise typer.Exit(1)
        results = kb.search(query, category=category)
        console.print()
        console.print(f"[bold]Knowledge Base Search:[/bold] [bright_cyan]{query}[/bright_cyan]")
        if not results:
            console.print("[dim]No results found.[/dim]")
        for r in results:
            console.print(Panel(
                r["content"][:400] + ("..." if len(r["content"]) > 400 else ""),
                title=f"[bold]{r['title']}[/bold]  [dim]{r['category']} | relevance: {r['relevance']}[/dim]",
                border_style="bright_cyan",
            ))

    elif action == "list":
        overview = kb.get_all_categories()
        table = Table(title="Knowledge Base", box=box.ROUNDED, border_style="bright_cyan")
        table.add_column("Category", width=16)
        table.add_column("Entries", width=10)
        table.add_column("Topics", width=60)
        for cat, entries in overview["entries_by_category"].items():
            topics = " · ".join(e["title"] for e in entries[:3])
            table.add_row(cat, str(len(entries)), f"[dim]{topics}[/dim]")
        console.print(table)

    elif action == "stats":
        stats = kb.stats()
        console.print(Panel(
            "\n".join(f"  [bold]{k}[/bold]: {v}" for k, v in stats.items()),
            title="[bold bright_cyan]Knowledge Base Stats[/bold bright_cyan]",
            border_style="bright_cyan",
        ))

    elif action == "add":
        console.print("[dim]Interactive knowledge entry creation[/dim]")
        title = query or typer.prompt("Title")
        content = typer.prompt("Content")
        cat = category or typer.prompt("Category (restaurant/finance/marketing/operations/technology)")
        tags_raw = typer.prompt("Tags (comma-separated)", default="")
        tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
        entry = kb.add_entry(title=title, content=content, category=cat, tags=tags)
        console.print(f"[bright_green]Added: {entry['id']} -- {entry['title']}[/bright_green]")


@app.command()
def profile(
    agent_name: str = typer.Argument(..., help="Agent name"),
):
    """Show the detailed profile and prompt of an agent."""
    from mafalia_agents.agents import get_agent
    from mafalia_agents.prompts import get_system_prompt

    try:
        agent = get_agent(agent_name.lower(), DATA_DIR)
    except ValueError as e:
        console.print(f"[red]{e}[/red]")
        raise typer.Exit(1)

    p = agent.profile
    color = AGENT_COLORS.get(agent_name.lower(), "white")
    tag = AGENT_TAGS.get(agent_name.lower(), "[AGT]")

    console.print()
    console.print(Panel(
        f"[bold {color}]{tag} {p.name} -- {p.title}[/bold {color}]\n\n"
        f"[bold]Personality:[/bold] {p.personality.value}\n"
        f"[bold]Voice Style:[/bold] {p.voice_style}\n\n"
        f"[bold]Description:[/bold]\n{p.description}\n\n"
        f"[bold]Superpowers:[/bold]\n" +
        "\n".join(f"  - {sp}" for sp in p.superpowers) + "\n\n"
        f"[bold]Expertise Areas:[/bold] " + ", ".join(p.expertise_areas),
        title=f"[bold {color}]Agent Profile[/bold {color}]",
        border_style=color,
    ))

    prompt = get_system_prompt(agent_name.lower())
    show_prompt = typer.confirm("Show system prompt?", default=False)
    if show_prompt:
        console.print(Panel(
            prompt,
            title="[dim]System Prompt[/dim]",
            border_style="dim",
        ))


@app.command()
def metrics():
    """Get live key business metrics from all agents."""
    from mafalia_agents.orchestrator import MafaliaOrchestrator

    with Progress(SpinnerColumn(), TextColumn("[bold]Fetching metrics..."), transient=True) as p:
        p.add_task("", total=None)
        orch = MafaliaOrchestrator(DATA_DIR)
        result = orch.get_key_metrics()

    console.print()
    panels = []
    for domain, data in result.items():
        if domain == "generated_at":
            continue
        color = {"revenue": "yellow", "customers": "magenta", "operations": "cyan",
                 "inventory": "green", "finance": "medium_purple3"}.get(domain, "white")
        content = "\n".join(f"[bold]{k}[/bold]: {v}" for k, v in data.items() if not isinstance(v, dict))
        panels.append(Panel(content, title=f"[{color}]{domain.upper()}[/{color}]", border_style=color, expand=True))

    if panels:
        console.print(Columns(panels))
    console.print(f"\n[dim]Generated: {result.get('generated_at','')[:19]}[/dim]\n")


@app.command()
def chat(
    agent_name: str = typer.Argument(..., help="Agent to chat with"),
):
    """Start an interactive chat session with an agent."""
    from mafalia_agents.agents import get_agent

    try:
        agent = get_agent(agent_name.lower(), DATA_DIR)
    except ValueError as e:
        console.print(f"[red]{e}[/red]")
        raise typer.Exit(1)

    p = agent.profile
    color = AGENT_COLORS.get(agent_name.lower(), "white")

    console.print()
    tag = AGENT_TAGS.get(agent_name.lower(), "[AGT]")
    console.print(Panel.fit(
        f"[bold {color}]{tag} Chat with {p.name} -- {p.title}[/bold {color}]\n"
        f"[dim]{p.description}[/dim]\n"
        f"[dim]Type 'exit' or Ctrl+C to quit[/dim]",
        border_style=color,
    ))

    while True:
        try:
            user_input = typer.prompt(f"\n[You]")
        except (KeyboardInterrupt, typer.Abort):
            console.print(f"\n[{color}]Goodbye![/{color}]\n")
            break

        if user_input.strip().lower() in ("exit", "quit", "bye"):
            console.print(f"[{color}]Goodbye![/{color}]\n")
            break

        with Progress(SpinnerColumn(), TextColumn(f"[dim]{p.name} is thinking...[/dim]"),
                      transient=True) as prog:
            prog.add_task("", total=None)
            result = agent.process(user_input)

        _print_agent_response(agent_name.lower(), result)


@app.command()
def mcp_config():
    """Show Claude Desktop MCP configuration for Mafalia."""
    config = {
        "mcpServers": {
            "mafalia": {
                "command": "python",
                "args": [os.path.join(DATA_DIR, "run_mcp.py")],
                "description": "Mafalia AI Agents - 10 specialized business intelligence agents",
            }
        }
    }
    console.print()
    console.print(Panel(
        f"[dim]Add this to your Claude Desktop config file:[/dim]\n\n"
        f"[bold]Windows:[/bold] %APPDATA%\\Claude\\claude_desktop_config.json\n"
        f"[bold]Mac:[/bold] ~/Library/Application Support/Claude/claude_desktop_config.json\n\n"
        + Syntax(json.dumps(config, indent=2), "json", theme="monokai").highlight("json"),
        title="[bold bright_cyan]MCP Configuration[/bold bright_cyan]",
        border_style="bright_cyan",
    ))
    console.print(Syntax(json.dumps(config, indent=2), "json", theme="monokai"))


def main():
    app()


if __name__ == "__main__":
    main()
