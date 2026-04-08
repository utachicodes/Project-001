# -*- coding: utf-8 -*-
"""
Mafalia Agent Memory System
============================
Persistent and in-session memory for all Mafalia AI agents.
Enables agents to remember context, past interactions, and learned insights.
"""

import os
import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field, asdict


@dataclass
class MemoryEntry:
    key: str
    value: Any
    agent: str
    memory_type: str
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    access_count: int = 0
    tags: List[str] = field(default_factory=list)


@dataclass
class ConversationTurn:
    role: str
    content: str
    agent: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict = field(default_factory=dict)


class AgentMemory:
    """
    Per-agent memory store with persistence.
    Supports short-term (session) and long-term (persistent) memory.
    When MemPalace is available, also syncs to the palace (wings/rooms/drawers)
    for structured retrieval with AAAK compression and cross-agent tunnels.
    """

    def __init__(self, agent_name: str, data_dir: str = "."):
        self.agent_name = agent_name.lower()
        self.data_dir = data_dir
        self._short_term: Dict[str, MemoryEntry] = {}
        self._long_term: Dict[str, MemoryEntry] = {}
        self._conversations: List[ConversationTurn] = []
        self._palace = None
        self._init_palace()
        self._load_long_term()

    def _init_palace(self):
        """Connect to MafaliaPalace if available."""
        try:
            from mafalia_knowledge.mempalace_integration import MafaliaPalace
            self._palace = MafaliaPalace(self.data_dir)
        except Exception:
            self._palace = None

    # ─── SHORT-TERM MEMORY (session only) ────────────────────────────────────

    def remember(self, key: str, value: Any, tags: List[str] = None):
        """Store something in short-term memory."""
        entry = MemoryEntry(
            key=key,
            value=value,
            agent=self.agent_name,
            memory_type="short_term",
            tags=tags or [],
        )
        self._short_term[key] = entry

    def recall(self, key: str) -> Optional[Any]:
        """Recall from short-term memory first, then long-term."""
        if key in self._short_term:
            self._short_term[key].access_count += 1
            return self._short_term[key].value
        if key in self._long_term:
            self._long_term[key].access_count += 1
            return self._long_term[key].value
        return None

    def forget(self, key: str):
        """Remove from short-term memory."""
        self._short_term.pop(key, None)

    # ─── LONG-TERM MEMORY (persistent) ───────────────────────────────────────

    def memorize(self, key: str, value: Any, tags: List[str] = None):
        """Store in long-term persistent memory. Also syncs to MemPalace."""
        if key in self._long_term:
            entry = self._long_term[key]
            entry.value = value
            entry.updated_at = datetime.now().isoformat()
            entry.tags = tags or entry.tags
        else:
            self._long_term[key] = MemoryEntry(
                key=key,
                value=value,
                agent=self.agent_name,
                memory_type="long_term",
                tags=tags or [],
            )
        self._save_long_term()
        self._sync_to_palace(key, value, tags)

    def retrieve(self, key: str) -> Optional[Any]:
        """Retrieve from long-term memory."""
        if key in self._long_term:
            self._long_term[key].access_count += 1
            return self._long_term[key].value
        return None

    def search_memory(self, query: str) -> List[Dict]:
        """Search all memory by keyword. Also searches MemPalace if available."""
        results = []
        query_lower = query.lower()
        for store in [self._short_term, self._long_term]:
            for key, entry in store.items():
                if (query_lower in key.lower() or
                        query_lower in str(entry.value).lower() or
                        any(query_lower in tag for tag in entry.tags)):
                    results.append({
                        "key": key,
                        "value": entry.value,
                        "type": entry.memory_type,
                        "created_at": entry.created_at,
                        "tags": entry.tags,
                    })
        # Also search the palace
        if self._palace:
            try:
                palace_results = self._palace.search(
                    query, agent_name=self.agent_name, top_k=5
                )
                for pr in palace_results:
                    results.append({
                        "key": f"palace:{pr['room']}/{pr['file']}",
                        "value": pr["preview"],
                        "type": "palace_closet",
                        "created_at": pr["file"].replace(".aaak", ""),
                        "tags": [pr["room"], pr["wing"]],
                    })
            except Exception:
                pass
        return results

    # ─── CONVERSATION HISTORY ─────────────────────────────────────────────────

    def add_conversation(self, role: str, content: str, metadata: Dict = None):
        """Add a turn to conversation history."""
        turn = ConversationTurn(
            role=role,
            content=content,
            agent=self.agent_name,
            metadata=metadata or {},
        )
        self._conversations.append(turn)
        if len(self._conversations) > 100:
            self._conversations = self._conversations[-100:]

    def get_conversation_history(self, last_n: int = 10) -> List[Dict]:
        """Get last N conversation turns."""
        return [asdict(t) for t in self._conversations[-last_n:]]

    def clear_conversation(self):
        """Clear conversation history."""
        self._conversations = []

    # ─── PERSISTENCE ──────────────────────────────────────────────────────────

    def _get_memory_path(self) -> str:
        memory_dir = os.path.join(self.data_dir, "mafalia_knowledge", "agent_memories")
        os.makedirs(memory_dir, exist_ok=True)
        return os.path.join(memory_dir, f"{self.agent_name}_memory.json")

    def _save_long_term(self):
        path = self._get_memory_path()
        data = {
            "agent": self.agent_name,
            "saved_at": datetime.now().isoformat(),
            "entries": {k: asdict(v) for k, v in self._long_term.items()},
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _load_long_term(self):
        path = self._get_memory_path()
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for key, entry_data in data.get("entries", {}).items():
                    self._long_term[key] = MemoryEntry(**entry_data)
            except Exception:
                pass

    def _sync_to_palace(self, key: str, value: Any, tags: List[str] = None):
        """Sync a memorized entry to the MemPalace as a drawer + closet."""
        if not self._palace:
            return
        try:
            room = self._infer_room(key, tags)
            data = value if isinstance(value, dict) else {"value": value}
            self._palace.store_agent_memory(
                agent_name=self.agent_name,
                room=room,
                data=data,
                hall="hall_facts",
                metadata={"key": key, "tags": tags or []},
            )
        except Exception:
            pass

    def _infer_room(self, key: str, tags: List[str] = None) -> str:
        """Infer a palace room name from the memory key and tags."""
        from mafalia_knowledge.mempalace_integration import DEFAULT_ROOMS
        agent_rooms = DEFAULT_ROOMS.get(self.agent_name, [])
        key_lower = key.lower()
        for room in agent_rooms:
            if room.replace("_", " ") in key_lower or key_lower in room:
                return room
        if tags:
            for tag in tags:
                for room in agent_rooms:
                    if tag.lower() in room:
                        return room
        return agent_rooms[0] if agent_rooms else "general"

    def write_diary(self, entry: str):
        """Write an AAAK-formatted entry to the agent's MemPalace diary."""
        if self._palace:
            try:
                self._palace.agent_diary_write(self.agent_name, entry)
            except Exception:
                pass

    def read_diary(self, last_n: int = 10) -> List[str]:
        """Read the last N diary entries from MemPalace."""
        if self._palace:
            try:
                return self._palace.agent_diary_read(self.agent_name, last_n=last_n)
            except Exception:
                pass
        return []

    def palace_context(self, room: str = None, last_n: int = 5) -> Dict:
        """Load palace context (AAAK closets + diary) for fast agent priming."""
        if self._palace:
            try:
                return self._palace.recall_agent_context(
                    self.agent_name, room=room, last_n=last_n
                )
            except Exception:
                pass
        return {}

    def snapshot(self) -> Dict:
        """Get a full snapshot of the agent's memory state."""
        snap = {
            "agent": self.agent_name,
            "short_term_count": len(self._short_term),
            "long_term_count": len(self._long_term),
            "conversation_turns": len(self._conversations),
            "short_term_keys": list(self._short_term.keys()),
            "long_term_keys": list(self._long_term.keys()),
            "recent_conversation": self.get_conversation_history(5),
            "palace_connected": self._palace is not None,
        }
        if self._palace:
            snap["diary_entries"] = len(self.read_diary(last_n=9999))
        return snap


class GlobalMemory:
    """
    Shared memory accessible to all agents.
    Stores cross-agent insights and shared context.
    """

    def __init__(self, data_dir: str = "."):
        self.data_dir = data_dir
        self._shared: Dict[str, Any] = {}
        self._insights: List[Dict] = []
        self._load()

    def set(self, key: str, value: Any, source_agent: str = "system"):
        self._shared[key] = {
            "value": value,
            "source": source_agent,
            "updated_at": datetime.now().isoformat(),
        }
        self._save()

    def get(self, key: str) -> Optional[Any]:
        entry = self._shared.get(key)
        return entry["value"] if entry else None

    def add_insight(self, agent: str, insight: str, tags: List[str] = None):
        """Log a cross-agent insight."""
        self._insights.append({
            "agent": agent,
            "insight": insight,
            "tags": tags or [],
            "timestamp": datetime.now().isoformat(),
        })
        if len(self._insights) > 500:
            self._insights = self._insights[-500:]
        self._save()

    def get_insights(self, agent: str = None, last_n: int = 20) -> List[Dict]:
        if agent:
            filtered = [i for i in self._insights if i["agent"] == agent]
        else:
            filtered = self._insights
        return filtered[-last_n:]

    def _get_path(self) -> str:
        memory_dir = os.path.join(self.data_dir, "mafalia_knowledge", "agent_memories")
        os.makedirs(memory_dir, exist_ok=True)
        return os.path.join(memory_dir, "global_memory.json")

    def _save(self):
        path = self._get_path()
        data = {
            "saved_at": datetime.now().isoformat(),
            "shared": self._shared,
            "insights": self._insights[-200:],
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _load(self):
        path = self._get_path()
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self._shared = data.get("shared", {})
                self._insights = data.get("insights", [])
            except Exception:
                pass
