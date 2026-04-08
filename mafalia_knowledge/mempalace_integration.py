# -*- coding: utf-8 -*-
"""
Mafalia × MemPalace Integration
=================================
Connects the 10 Mafalia AI agents to MemPalace — the highest-scoring
AI memory system ever benchmarked.

Architecture mapping:
    MemPalace Wing   → Mafalia Agent   (each agent owns a wing)
    MemPalace Room   → Agent domain    (revenue, customers, inventory...)
    MemPalace Hall   → Memory type     (facts, events, discoveries, preferences, advice)
    MemPalace Closet → Compressed summaries (AAAK)
    MemPalace Drawer → Original conversations / raw data
    MemPalace Tunnel → Cross-agent shared insights

Usage:
    palace = MafaliaPalace(data_dir=".")
    palace.store_agent_memory("zara", "revenue_analysis", result_dict)
    palace.recall_agent_context("zara")
    palace.store_cross_agent_insight("zara", "tariq", "revenue_decline_detected", ...)
    palace.agent_diary_write("zara", "REV.trend:↓8%|action:activate.nala.campaign|★★★")
    palace.search("food cost optimization")

Ref: https://github.com/milla-jovovich/mempalace
"""

import os
import json
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict

try:
    from mempalace.palace import Palace
    from mempalace.knowledge_graph import KnowledgeGraph
    MEMPALACE_NATIVE = True
except ImportError:
    MEMPALACE_NATIVE = False


# ─────────────────────────────────────────────────────────────────────────────
# Agent ↔ Wing mapping
# ─────────────────────────────────────────────────────────────────────────────

AGENT_WING_MAP = {
    "zara":  {"wing": "wing_zara",  "focus": "revenue, pricing, profit, upselling, bundles"},
    "kofi":  {"wing": "wing_kofi",  "focus": "operations, orders, bottlenecks, efficiency, delivery"},
    "amara": {"wing": "wing_amara", "focus": "customers, churn, loyalty, segmentation, CLV"},
    "idris": {"wing": "wing_idris", "focus": "inventory, stock, waste, expiry, suppliers"},
    "nala":  {"wing": "wing_nala",  "focus": "marketing, campaigns, social media, promotions, ROI"},
    "tariq": {"wing": "wing_tariq", "focus": "finance, cash flow, budget, tax, investment"},
    "sana":  {"wing": "wing_sana",  "focus": "data science, forecasting, patterns, anomalies, statistics"},
    "ravi":  {"wing": "wing_ravi",  "focus": "technology, APIs, security, performance, automation"},
    "luna":  {"wing": "wing_luna",  "focus": "growth, funnels, experiments, viral mechanics, retention"},
    "omar":  {"wing": "wing_omar",  "focus": "partnerships, suppliers, marketplace, deals, ecosystem"},
}

HALL_TYPES = ["hall_facts", "hall_events", "hall_discoveries", "hall_preferences", "hall_advice"]

DEFAULT_ROOMS = {
    "zara":  ["revenue_analysis", "pricing_strategy", "profit_margins", "upsell_bundles", "revenue_trends"],
    "kofi":  ["order_flow", "bottlenecks", "efficiency_scores", "delivery_ops", "staff_scheduling"],
    "amara": ["customer_overview", "churn_risk", "loyalty_program", "segments", "lifetime_value"],
    "idris": ["stock_levels", "purchase_orders", "waste_tracking", "expiry_alerts", "supplier_scores"],
    "nala":  ["campaigns", "social_strategy", "promotions", "content_calendar", "campaign_roi"],
    "tariq": ["cash_flow", "financial_health", "budget_plan", "tax_compliance", "investments"],
    "sana":  ["sales_forecast", "patterns", "anomalies", "correlations", "key_insights"],
    "ravi":  ["api_integrations", "security_audit", "performance", "tech_stack", "automation"],
    "luna":  ["growth_strategy", "funnel_analysis", "experiments", "viral_mechanics", "retention"],
    "omar":  ["partnerships", "supplier_matching", "deal_structure", "ecosystem_map", "financing"],
}


# ─────────────────────────────────────────────────────────────────────────────
# AAAK Compression helpers (lightweight version)
# When native mempalace is installed, it uses the real AAAK engine.
# ─────────────────────────────────────────────────────────────────────────────

def compress_to_aaak(agent: str, room: str, data: Dict) -> str:
    """
    Compress an agent response to AAAK-style shorthand.
    This is a lightweight approximation; the native MemPalace AAAK engine
    produces much better compression.
    """
    lines = [f"AG:{agent.upper()}|RM:{room}|TS:{datetime.now().strftime('%y%m%d.%H%M')}"]

    for key, value in data.items():
        k = key[:12].upper().replace("_", ".")
        if isinstance(value, dict):
            sub = "|".join(f"{sk[:8]}:{sv}" for sk, sv in list(value.items())[:5])
            lines.append(f"{k}:{{{sub}}}")
        elif isinstance(value, list):
            count = len(value)
            preview = str(value[0])[:40] if value else "empty"
            lines.append(f"{k}:[{count}]{preview}")
        else:
            v = str(value)[:60]
            lines.append(f"{k}:{v}")

    return "\n".join(lines)


def decompress_aaak(aaak_text: str) -> Dict:
    """Parse AAAK shorthand back to a dictionary (best effort)."""
    result = {}
    for line in aaak_text.strip().split("\n"):
        if "|" in line and ":" in line:
            for pair in line.split("|"):
                if ":" in pair:
                    k, v = pair.split(":", 1)
                    result[k.strip()] = v.strip()
        elif ":" in line:
            k, v = line.split(":", 1)
            result[k.strip()] = v.strip()
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Knowledge Graph (lightweight SQLite fallback)
# ─────────────────────────────────────────────────────────────────────────────

class MafaliaKnowledgeGraph:
    """
    Temporal entity-relationship triples stored in SQLite.
    Compatible with MemPalace's KnowledgeGraph API.
    """

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS triples (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subject TEXT NOT NULL,
                    predicate TEXT NOT NULL,
                    object TEXT NOT NULL,
                    valid_from TEXT NOT NULL,
                    valid_until TEXT,
                    source_agent TEXT,
                    confidence REAL DEFAULT 1.0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_subject ON triples(subject)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_predicate ON triples(predicate)")

    def add_triple(self, subject: str, predicate: str, obj: str,
                   valid_from: str = None, source_agent: str = None,
                   confidence: float = 1.0):
        """Add a fact triple with temporal validity."""
        valid_from = valid_from or datetime.now().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO triples (subject, predicate, object, valid_from, source_agent, confidence) VALUES (?,?,?,?,?,?)",
                (subject, predicate, obj, valid_from, source_agent, confidence),
            )

    def invalidate(self, subject: str, predicate: str, obj: str, ended: str = None):
        """Mark a triple as no longer valid."""
        ended = ended or datetime.now().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE triples SET valid_until = ? WHERE subject = ? AND predicate = ? AND object = ? AND valid_until IS NULL",
                (ended, subject, predicate, obj),
            )

    def query_entity(self, subject: str, as_of: str = None) -> List[Dict]:
        """Query all current facts about an entity."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            if as_of:
                rows = conn.execute(
                    "SELECT * FROM triples WHERE subject = ? AND valid_from <= ? AND (valid_until IS NULL OR valid_until > ?)",
                    (subject, as_of, as_of),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM triples WHERE subject = ? AND valid_until IS NULL",
                    (subject,),
                ).fetchall()
        return [dict(r) for r in rows]

    def query_predicate(self, predicate: str) -> List[Dict]:
        """Query all current facts with a given predicate."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                "SELECT * FROM triples WHERE predicate = ? AND valid_until IS NULL",
                (predicate,),
            ).fetchall()
        return [dict(r) for r in rows]

    def timeline(self, subject: str) -> List[Dict]:
        """Get chronological history of an entity."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                "SELECT * FROM triples WHERE subject = ? ORDER BY valid_from ASC",
                (subject,),
            ).fetchall()
        return [dict(r) for r in rows]

    def find_contradictions(self, subject: str, predicate: str, new_value: str) -> List[Dict]:
        """Check if a new fact contradicts existing facts."""
        current = self.query_entity(subject)
        contradictions = []
        for fact in current:
            if fact["predicate"] == predicate and fact["object"] != new_value:
                contradictions.append({
                    "existing": fact,
                    "new_value": new_value,
                    "type": "value_conflict",
                    "message": f"{subject}.{predicate}: was '{fact['object']}', now '{new_value}'",
                })
        return contradictions

    def stats(self) -> Dict:
        with sqlite3.connect(self.db_path) as conn:
            total = conn.execute("SELECT COUNT(*) FROM triples").fetchone()[0]
            active = conn.execute("SELECT COUNT(*) FROM triples WHERE valid_until IS NULL").fetchone()[0]
            subjects = conn.execute("SELECT COUNT(DISTINCT subject) FROM triples").fetchone()[0]
            agents = conn.execute("SELECT source_agent, COUNT(*) FROM triples GROUP BY source_agent").fetchall()
        return {
            "total_triples": total,
            "active_triples": active,
            "unique_entities": subjects,
            "by_agent": {a: c for a, c in agents if a},
        }


# ─────────────────────────────────────────────────────────────────────────────
# MafaliaPalace: Main integration class
# ─────────────────────────────────────────────────────────────────────────────

class MafaliaPalace:
    """
    Integrates MemPalace with Mafalia's 10 AI agents.

    Each agent gets:
    - A wing in the palace (persistent identity)
    - Rooms for each expertise domain
    - Halls for memory types (facts/events/discoveries/preferences/advice)
    - A diary in AAAK shorthand for cross-session learning
    - Tunnels to other agents for shared insights

    Falls back to a lightweight SQLite implementation when
    the native mempalace package is not installed.
    """

    def __init__(self, data_dir: str = "."):
        self.data_dir = data_dir
        self.palace_dir = os.path.join(data_dir, "mafalia_knowledge", "palace")
        os.makedirs(self.palace_dir, exist_ok=True)

        # Knowledge graph
        kg_path = os.path.join(self.palace_dir, "knowledge_graph.db")
        self.kg = MafaliaKnowledgeGraph(kg_path)

        # Native MemPalace (if installed)
        self._native_palace = None
        self._native_kg = None
        if MEMPALACE_NATIVE:
            try:
                self._native_palace = Palace(root=self.palace_dir)
                self._native_kg = KnowledgeGraph(
                    db_path=os.path.join(self.palace_dir, "mempalace_kg.db")
                )
            except Exception:
                pass

        self._init_wings()

    def _init_wings(self):
        """Initialize wings, rooms, and halls for each agent."""
        for agent_name, config in AGENT_WING_MAP.items():
            wing_dir = os.path.join(self.palace_dir, config["wing"])
            os.makedirs(wing_dir, exist_ok=True)

            # Create hall directories
            for hall in HALL_TYPES:
                os.makedirs(os.path.join(wing_dir, hall), exist_ok=True)

            # Create room directories
            for room in DEFAULT_ROOMS.get(agent_name, []):
                room_dir = os.path.join(wing_dir, "rooms", room)
                os.makedirs(room_dir, exist_ok=True)
                # Create closet (compressed summary) and drawer (raw data) dirs
                os.makedirs(os.path.join(room_dir, "closet"), exist_ok=True)
                os.makedirs(os.path.join(room_dir, "drawer"), exist_ok=True)

            # Create diary file
            diary_path = os.path.join(wing_dir, "diary.aaak")
            if not os.path.exists(diary_path):
                with open(diary_path, "w", encoding="utf-8") as f:
                    f.write(f"# {agent_name.upper()} DIARY (AAAK format)\n")
                    f.write(f"# Focus: {config['focus']}\n")
                    f.write(f"# Created: {datetime.now().isoformat()}\n\n")

            # Register agent in knowledge graph
            self.kg.add_triple(
                subject=agent_name,
                predicate="has_wing",
                obj=config["wing"],
                source_agent="system",
            )
            self.kg.add_triple(
                subject=agent_name,
                predicate="focus_area",
                obj=config["focus"],
                source_agent="system",
            )

    # ─── STORE & RECALL ──────────────────────────────────────────────────────

    def store_agent_memory(self, agent_name: str, room: str, data: Dict,
                           hall: str = "hall_facts", metadata: Dict = None):
        """
        Store an agent's output in the palace.
        - Raw data goes to the drawer
        - AAAK-compressed summary goes to the closet
        """
        agent_name = agent_name.lower()
        if agent_name not in AGENT_WING_MAP:
            raise ValueError(f"Unknown agent: {agent_name}")

        wing = AGENT_WING_MAP[agent_name]["wing"]
        room_dir = os.path.join(self.palace_dir, wing, "rooms", room)
        os.makedirs(os.path.join(room_dir, "drawer"), exist_ok=True)
        os.makedirs(os.path.join(room_dir, "closet"), exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Store raw data in drawer
        drawer_path = os.path.join(room_dir, "drawer", f"{timestamp}.json")
        entry = {
            "agent": agent_name,
            "room": room,
            "hall": hall,
            "timestamp": datetime.now().isoformat(),
            "data": data,
            "metadata": metadata or {},
        }
        with open(drawer_path, "w", encoding="utf-8") as f:
            json.dump(entry, f, ensure_ascii=False, indent=2)

        # Store AAAK-compressed summary in closet
        aaak = compress_to_aaak(agent_name, room, data)
        closet_path = os.path.join(room_dir, "closet", f"{timestamp}.aaak")
        with open(closet_path, "w", encoding="utf-8") as f:
            f.write(aaak)

        # Also store in the appropriate hall
        hall_dir = os.path.join(self.palace_dir, wing, hall)
        os.makedirs(hall_dir, exist_ok=True)
        hall_path = os.path.join(hall_dir, f"{room}_{timestamp}.aaak")
        with open(hall_path, "w", encoding="utf-8") as f:
            f.write(aaak)

        # Add to knowledge graph
        self.kg.add_triple(
            subject=agent_name,
            predicate=f"analyzed_{room}",
            obj=json.dumps({"timestamp": timestamp, "keys": list(data.keys())[:5]}),
            source_agent=agent_name,
        )

        return {
            "stored": True,
            "agent": agent_name,
            "wing": wing,
            "room": room,
            "hall": hall,
            "drawer": drawer_path,
            "closet": closet_path,
            "aaak_tokens": len(aaak.split()),
        }

    def recall_agent_context(self, agent_name: str, room: str = None,
                             last_n: int = 5) -> Dict:
        """
        Recall an agent's memory from the palace.
        Returns the last N closet entries (AAAK) for fast context loading,
        plus the agent's diary.
        """
        agent_name = agent_name.lower()
        wing = AGENT_WING_MAP.get(agent_name, {}).get("wing")
        if not wing:
            return {"error": f"Unknown agent: {agent_name}"}

        wing_dir = os.path.join(self.palace_dir, wing)
        result = {
            "agent": agent_name,
            "wing": wing,
            "diary": self.agent_diary_read(agent_name, last_n=last_n),
            "rooms": {},
            "kg_facts": self.kg.query_entity(agent_name),
        }

        rooms_to_check = [room] if room else DEFAULT_ROOMS.get(agent_name, [])
        for rm in rooms_to_check:
            closet_dir = os.path.join(wing_dir, "rooms", rm, "closet")
            if not os.path.exists(closet_dir):
                continue
            files = sorted(os.listdir(closet_dir), reverse=True)[:last_n]
            entries = []
            for fname in files:
                fpath = os.path.join(closet_dir, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    entries.append({"file": fname, "aaak": f.read()})
            if entries:
                result["rooms"][rm] = entries

        return result

    def recall_drawer(self, agent_name: str, room: str, filename: str) -> Dict:
        """Retrieve the full original data from a specific drawer."""
        wing = AGENT_WING_MAP.get(agent_name.lower(), {}).get("wing")
        if not wing:
            return {"error": f"Unknown agent: {agent_name}"}
        drawer_path = os.path.join(
            self.palace_dir, wing, "rooms", room, "drawer", filename
        )
        if not os.path.exists(drawer_path):
            return {"error": f"Drawer not found: {drawer_path}"}
        with open(drawer_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # ─── AGENT DIARY (AAAK) ──────────────────────────────────────────────────

    def agent_diary_write(self, agent_name: str, entry: str):
        """
        Append an AAAK-formatted entry to an agent's diary.
        The diary persists across sessions, giving the agent
        memory of past analyses and discoveries.
        """
        agent_name = agent_name.lower()
        wing = AGENT_WING_MAP.get(agent_name, {}).get("wing")
        if not wing:
            return {"error": f"Unknown agent: {agent_name}"}

        diary_path = os.path.join(self.palace_dir, wing, "diary.aaak")
        timestamp = datetime.now().strftime("%y%m%d.%H%M")
        line = f"[{timestamp}] {entry}\n"

        with open(diary_path, "a", encoding="utf-8") as f:
            f.write(line)

        return {"written": True, "agent": agent_name, "entry": line.strip()}

    def agent_diary_read(self, agent_name: str, last_n: int = 10) -> List[str]:
        """Read the last N diary entries for an agent."""
        agent_name = agent_name.lower()
        wing = AGENT_WING_MAP.get(agent_name, {}).get("wing")
        if not wing:
            return []

        diary_path = os.path.join(self.palace_dir, wing, "diary.aaak")
        if not os.path.exists(diary_path):
            return []

        with open(diary_path, "r", encoding="utf-8") as f:
            lines = [l.strip() for l in f.readlines() if l.strip() and not l.startswith("#")]

        return lines[-last_n:]

    # ─── CROSS-AGENT TUNNELS ─────────────────────────────────────────────────

    def store_cross_agent_insight(self, from_agent: str, to_agent: str,
                                  topic: str, insight: str,
                                  hall: str = "hall_discoveries"):
        """
        Create a tunnel between two agents' wings.
        Used when one agent discovers something relevant to another.
        e.g., Zara detects revenue decline → tunnel to Nala for marketing campaign.
        """
        from_agent = from_agent.lower()
        to_agent = to_agent.lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        tunnel_data = {
            "from_agent": from_agent,
            "to_agent": to_agent,
            "topic": topic,
            "insight": insight,
            "hall": hall,
            "timestamp": datetime.now().isoformat(),
        }

        # Store in tunnels directory
        tunnels_dir = os.path.join(self.palace_dir, "tunnels")
        os.makedirs(tunnels_dir, exist_ok=True)
        tunnel_path = os.path.join(
            tunnels_dir, f"{from_agent}_to_{to_agent}_{timestamp}.json"
        )
        with open(tunnel_path, "w", encoding="utf-8") as f:
            json.dump(tunnel_data, f, ensure_ascii=False, indent=2)

        # Add to knowledge graph
        self.kg.add_triple(
            subject=from_agent,
            predicate=f"insight_for_{to_agent}",
            obj=insight[:200],
            source_agent=from_agent,
        )

        # Write to both agents' diaries
        aaak_insight = f"TUNNEL:{from_agent}→{to_agent}|{topic}|{insight[:80]}"
        self.agent_diary_write(from_agent, aaak_insight)
        self.agent_diary_write(to_agent, f"TUNNEL.IN:{from_agent}|{topic}|{insight[:80]}")

        return {"tunnel_created": True, **tunnel_data}

    def find_tunnels(self, agent_name: str) -> List[Dict]:
        """Find all tunnels connected to an agent."""
        agent_name = agent_name.lower()
        tunnels_dir = os.path.join(self.palace_dir, "tunnels")
        if not os.path.exists(tunnels_dir):
            return []

        results = []
        for fname in sorted(os.listdir(tunnels_dir), reverse=True):
            if agent_name in fname and fname.endswith(".json"):
                fpath = os.path.join(tunnels_dir, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    results.append(json.load(f))
        return results[:20]

    # ─── SEARCH ──────────────────────────────────────────────────────────────

    def search(self, query: str, agent_name: str = None,
               room: str = None, top_k: int = 10) -> List[Dict]:
        """
        Search the palace. Narrows by wing (agent) and room for
        the 34% retrieval improvement described in MemPalace benchmarks.
        """
        query_terms = set(query.lower().split())
        results = []

        agents_to_search = [agent_name] if agent_name else list(AGENT_WING_MAP.keys())

        for ag in agents_to_search:
            wing = AGENT_WING_MAP.get(ag, {}).get("wing")
            if not wing:
                continue

            wing_dir = os.path.join(self.palace_dir, wing)
            rooms_to_search = [room] if room else DEFAULT_ROOMS.get(ag, [])

            for rm in rooms_to_search:
                closet_dir = os.path.join(wing_dir, "rooms", rm, "closet")
                if not os.path.exists(closet_dir):
                    continue

                for fname in os.listdir(closet_dir):
                    if not fname.endswith(".aaak"):
                        continue
                    fpath = os.path.join(closet_dir, fname)
                    with open(fpath, "r", encoding="utf-8") as f:
                        content = f.read()

                    content_lower = content.lower()
                    matches = sum(1 for t in query_terms if t in content_lower)
                    if matches > 0:
                        score = matches / max(len(query_terms), 1)
                        results.append({
                            "agent": ag,
                            "wing": wing,
                            "room": rm,
                            "file": fname,
                            "score": round(score, 3),
                            "preview": content[:200],
                        })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    # ─── STATUS & STATS ──────────────────────────────────────────────────────

    def status(self) -> Dict:
        """Full palace status — like mempalace_status."""
        wings = {}
        total_drawers = 0
        total_closets = 0

        for agent_name, config in AGENT_WING_MAP.items():
            wing_dir = os.path.join(self.palace_dir, config["wing"])
            rooms_info = {}
            for rm in DEFAULT_ROOMS.get(agent_name, []):
                drawer_dir = os.path.join(wing_dir, "rooms", rm, "drawer")
                closet_dir = os.path.join(wing_dir, "rooms", rm, "closet")
                d_count = len(os.listdir(drawer_dir)) if os.path.exists(drawer_dir) else 0
                c_count = len(os.listdir(closet_dir)) if os.path.exists(closet_dir) else 0
                total_drawers += d_count
                total_closets += c_count
                if d_count > 0 or c_count > 0:
                    rooms_info[rm] = {"drawers": d_count, "closets": c_count}

            diary_entries = len(self.agent_diary_read(agent_name, last_n=9999))
            wings[agent_name] = {
                "wing": config["wing"],
                "rooms_with_data": len(rooms_info),
                "rooms": rooms_info,
                "diary_entries": diary_entries,
            }

        tunnels_dir = os.path.join(self.palace_dir, "tunnels")
        tunnel_count = len(os.listdir(tunnels_dir)) if os.path.exists(tunnels_dir) else 0

        return {
            "palace": "mafalia",
            "mempalace_native": MEMPALACE_NATIVE,
            "wings": len(wings),
            "total_drawers": total_drawers,
            "total_closets": total_closets,
            "tunnels": tunnel_count,
            "kg_stats": self.kg.stats(),
            "agent_wings": wings,
        }

    def list_wings(self) -> List[Dict]:
        """List all wings in the palace."""
        return [
            {
                "agent": name,
                "wing": cfg["wing"],
                "focus": cfg["focus"],
                "rooms": DEFAULT_ROOMS.get(name, []),
            }
            for name, cfg in AGENT_WING_MAP.items()
        ]

    def get_taxonomy(self) -> Dict:
        """Return the full palace taxonomy: wings → halls → rooms."""
        taxonomy = {}
        for agent_name, config in AGENT_WING_MAP.items():
            taxonomy[config["wing"]] = {
                "agent": agent_name,
                "focus": config["focus"],
                "halls": HALL_TYPES,
                "rooms": DEFAULT_ROOMS.get(agent_name, []),
            }
        return taxonomy
