# Mafalia AI Agents Package
# Use lazy imports to avoid loading CSV data at package import time.
# Import directly from mafalia_agents.agents for class-level access.

__all__ = [
    "ALL_AGENTS", "get_agent", "list_agents",
    "Zara", "Kofi", "Amara", "Idris", "Nala",
    "Tariq", "Sana", "Ravi", "Luna", "Omar",
]

def __getattr__(name):
    if name in __all__:
        from mafalia_agents import agents as _agents
        return getattr(_agents, name)
    raise AttributeError(f"module 'mafalia_agents' has no attribute {name!r}")
