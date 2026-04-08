# -*- coding: utf-8 -*-
"""
Mafalia Code -- Python Bridge API
====================================
FastAPI server that the Electron app calls to execute agent tools.
This bridges the TypeScript frontend to the Python agent backend.
"""

import os
import sys
import json
import re
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mafalia_agents.agents import get_agent, list_agents, ALL_AGENTS
from mafalia_agents.orchestrator import MafaliaOrchestrator
from mafalia_code.config import load_config, validate_config

try:
    from mafalia_knowledge.graphify_integration import get_graphify, MafaliaGraphify
    HAS_GRAPHIFY = True
except ImportError:
    HAS_GRAPHIFY = False

app = FastAPI(title="Mafalia Code Bridge API", version="1.0.0")

# CORS for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Electron local file access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global orchestrator instance
_orchestrator: Optional[MafaliaOrchestrator] = None
DATA_DIR = os.environ.get("MAFALIA_DATA_DIR", ".")


@app.on_event("startup")
def startup_event():
    """Validate configuration on startup and log warnings."""
    cfg = load_config()
    cfg["data_dir"] = DATA_DIR
    validation = validate_config(cfg)
    
    if not validation["valid"]:
        print("=" * 60)
        print("  CONFIGURATION WARNING")
        print("=" * 60)
        print(f"  {validation['message']}")
        print("=" * 60)
        print("  Agents will not work until configuration is fixed.")
        print("  Use the Settings panel in the Electron app to configure.")
        print("=" * 60)
    else:
        print(f"✓ Configuration valid: {validation['provider']} with model {validation['model']}")


def get_orchestrator() -> MafaliaOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = MafaliaOrchestrator(DATA_DIR)
    return _orchestrator


# ── Request/Response Models ────────────────────────────────────────────

class AskAgentRequest(BaseModel):
    agent: str
    message: str


class OrchestrateRequest(BaseModel):
    request: str
    max_agents: int = 3


class ConfigRequest(BaseModel):
    provider: str
    model: str
    api_key: str
    base_url: Optional[str] = None
    data_dir: str = "."


class FileReadRequest(BaseModel):
    path: str


class FileWriteRequest(BaseModel):
    path: str
    content: str


class ScrapeRequest(BaseModel):
    url: str
    extract_links: bool = False
    extract_emails: bool = False


class MultiScrapeRequest(BaseModel):
    urls: List[str]
    extract_links: bool = False


class FileActionRequest(BaseModel):
    src: str
    dest: Optional[str] = None


class GraphQueryRequest(BaseModel):
    question: str
    budget: int = 2000
    dfs: bool = False


class GraphBuildRequest(BaseModel):
    path: Optional[str] = None
    mode: str = "default"
    update: bool = False


class GraphExplainRequest(BaseModel):
    concept: str


class GraphPathRequest(BaseModel):
    source: str
    target: str


# ── API Endpoints ────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "agents": 10, "desktop_access": True}


@app.get("/agents")
def get_all_agents():
    """List all 10 agents with their profiles."""
    return list_agents()


@app.post("/agents/ask")
def ask_agent(req: AskAgentRequest):
    """Ask a specific agent a question."""
    # Validate config first
    cfg = load_config()
    cfg["data_dir"] = DATA_DIR
    validation = validate_config(cfg)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation["message"])
    
    try:
        agent = get_agent(req.agent, DATA_DIR)
        result = agent.process(req.message)
        profile = agent.profile
        return {
            "agent": profile.name,
            "tag": profile.tag,
            "title": profile.title,
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/orchestrate")
def orchestrate(req: OrchestrateRequest):
    """Orchestrate a request across multiple agents."""
    # Validate config first
    cfg = load_config()
    cfg["data_dir"] = DATA_DIR
    validation = validate_config(cfg)
    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation["message"])
    
    try:
        orch = get_orchestrator()
        result = orch.orchestrate(req.request, max_agents=req.max_agents)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/summary")
def business_summary():
    """Get full business summary from all agents."""
    try:
        orch = get_orchestrator()
        result = orch.full_business_summary()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/metrics")
def get_metrics():
    """Get live business metrics."""
    try:
        orch = get_orchestrator()
        result = orch.get_key_metrics()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/config")
def save_config(req: ConfigRequest):
    """Save configuration (returns success, actual config stored by Electron)."""
    return {"saved": True}


@app.get("/config/validate")
def validate_current_config():
    """Validate current configuration and return status."""
    cfg = load_config()
    # Override with data_dir from environment
    cfg["data_dir"] = DATA_DIR
    validation = validate_config(cfg)
    return validation


# ── Desktop Access Endpoints ──────────────────────────────────────────

@app.get("/desktop/info")
def desktop_info():
    """Get system and desktop information."""
    import platform
    home = os.path.expanduser("~")
    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "hostname": platform.node(),
        "home_dir": home,
        "desktop_dir": os.path.join(home, "Desktop"),
        "documents_dir": os.path.join(home, "Documents"),
        "downloads_dir": os.path.join(home, "Downloads"),
        "data_dir": DATA_DIR,
        "cwd": os.getcwd(),
        "python_version": platform.python_version(),
    }


@app.get("/desktop/browse")
def browse_directory(path: str = ""):
    """Browse a directory on the desktop. Defaults to home dir."""
    target = path or os.path.expanduser("~")
    try:
        if not os.path.isdir(target):
            raise HTTPException(status_code=400, detail=f"Not a directory: {target}")
        entries = []
        for entry in os.scandir(target):
            try:
                stat = entry.stat()
                entries.append({
                    "name": entry.name,
                    "path": entry.path,
                    "is_directory": entry.is_dir(),
                    "is_file": entry.is_file(),
                    "size": stat.st_size if entry.is_file() else 0,
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "ext": os.path.splitext(entry.name)[1].lower() if entry.is_file() else "",
                })
            except (PermissionError, OSError):
                pass
        entries.sort(key=lambda e: (not e["is_directory"], e["name"].lower()))
        return {"path": target, "entries": entries}
    except PermissionError:
        raise HTTPException(status_code=403, detail=f"Permission denied: {target}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/desktop/read")
def read_file(req: FileReadRequest):
    """Read a file from the desktop."""
    try:
        if not os.path.isfile(req.path):
            raise HTTPException(status_code=404, detail=f"File not found: {req.path}")
        size = os.path.getsize(req.path)
        if size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File too large: {size} bytes (max 10MB)")
        with open(req.path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
        return {"path": req.path, "content": content, "size": size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/desktop/write")
def write_file(req: FileWriteRequest):
    """Write content to a file."""
    try:
        parent = os.path.dirname(req.path)
        if parent and not os.path.exists(parent):
            os.makedirs(parent, exist_ok=True)
        with open(req.path, "w", encoding="utf-8") as f:
            f.write(req.content)
        return {"success": True, "path": req.path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/desktop/csv-preview")
def csv_preview(path: str, rows: int = 20):
    """Preview a CSV file with pandas for quick analysis."""
    try:
        if not os.path.isfile(path):
            raise HTTPException(status_code=404, detail=f"File not found: {path}")
        import pandas as pd
        df = pd.read_csv(path, nrows=rows)
        return {
            "path": path,
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "shape": list(df.shape),
            "preview": df.to_dict(orient="records"),
            "total_rows": sum(1 for _ in open(path, encoding="utf-8", errors="replace")) - 1,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/desktop/find-csvs")
def find_csv_files(path: str = ""):
    """Find all CSV files in a directory (recursive)."""
    target = path or os.path.expanduser("~")
    csv_files = []
    try:
        for root, dirs, files in os.walk(target):
            # Skip hidden dirs
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            for f in files:
                if f.lower().endswith('.csv'):
                    fpath = os.path.join(root, f)
                    try:
                        size = os.path.getsize(fpath)
                        csv_files.append({
                            "name": f,
                            "path": fpath,
                            "size": size,
                            "size_human": f"{size / 1024:.1f} KB" if size < 1024 * 1024 else f"{size / (1024*1024):.1f} MB",
                        })
                    except OSError:
                        pass
        return {"path": target, "csv_files": csv_files, "count": len(csv_files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Graphify Knowledge Graph Endpoints ────────────────────────────────

@app.get("/graph/status")
def graph_status():
    """Check if graphifyy is available and if a graph exists."""
    if not HAS_GRAPHIFY:
        return {"available": False, "error": "graphifyy not installed. Run: pip install graphifyy && graphify install"}
    gf = get_graphify(DATA_DIR)
    return {
        "available": True,
        "built": gf.is_built(),
        "age": gf.graph_age(),
        "output_dir": str(gf.output_dir),
        "data_dir": str(gf.data_dir),
        "stats": gf._get_graph_stats() if gf.is_built() else {},
    }


@app.post("/graph/build")
def graph_build(req: GraphBuildRequest):
    """Build or update the knowledge graph from data directory."""
    if not HAS_GRAPHIFY:
        raise HTTPException(status_code=400, detail="graphifyy not installed")
    target = req.path or DATA_DIR
    gf = get_graphify(target)
    result = gf.build(mode=req.mode, update=req.update)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@app.post("/graph/build-csvs")
def graph_build_csvs():
    """Build a graph focused on CSV data files."""
    if not HAS_GRAPHIFY:
        raise HTTPException(status_code=400, detail="graphifyy not installed")
    gf = get_graphify(DATA_DIR)
    result = gf.build_from_csvs()
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@app.post("/graph/query")
def graph_query(req: GraphQueryRequest):
    """Query the knowledge graph with a natural language question."""
    if not HAS_GRAPHIFY:
        raise HTTPException(status_code=400, detail="graphifyy not installed")
    gf = get_graphify(DATA_DIR)
    result = gf.query(req.question, budget=req.budget, dfs=req.dfs)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/graph/explain")
def graph_explain(req: GraphExplainRequest):
    """Explain a specific concept in the knowledge graph."""
    if not HAS_GRAPHIFY:
        raise HTTPException(status_code=400, detail="graphifyy not installed")
    gf = get_graphify(DATA_DIR)
    result = gf.explain(req.concept)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/graph/path")
def graph_path(req: GraphPathRequest):
    """Find relationship path between two concepts."""
    if not HAS_GRAPHIFY:
        raise HTTPException(status_code=400, detail="graphifyy not installed")
    gf = get_graphify(DATA_DIR)
    result = gf.find_path(req.source, req.target)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.get("/graph/report")
def graph_report():
    """Get the full GRAPH_REPORT.md - god nodes, surprising connections, suggested questions."""
    if not HAS_GRAPHIFY:
        raise HTTPException(status_code=400, detail="graphifyy not installed")
    gf = get_graphify(DATA_DIR)
    result = gf.get_report()
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.get("/graph/html")
def graph_html():
    """Get path to the interactive graph HTML visualization."""
    if not HAS_GRAPHIFY:
        raise HTTPException(status_code=400, detail="graphifyy not installed")
    gf = get_graphify(DATA_DIR)
    html_path = gf.get_html_path()
    if not html_path:
        raise HTTPException(status_code=404, detail="No graph visualization found. Run /graph/build first.")
    return {"path": html_path}


@app.get("/graph/context/{agent_tag}")
def graph_agent_context(agent_tag: str, query: str = ""):
    """Get graph-derived context for a specific agent."""
    if not HAS_GRAPHIFY:
        return {"context": ""}
    gf = get_graphify(DATA_DIR)
    context = gf.get_agent_context(f"[{agent_tag.upper()}]", query)
    return {"agent_tag": agent_tag, "context": context}


# ── Web Scraping ──────────────────────────────────────────────────────

def _scrape_url(url: str, extract_links: bool = False, extract_emails: bool = False) -> dict:
    """Scrape a URL and return structured content."""
    import urllib.request
    import urllib.error
    from html.parser import HTMLParser

    class TextExtractor(HTMLParser):
        def __init__(self):
            super().__init__()
            self.text_parts = []
            self.links = []
            self.title = ""
            self._in_title = False
            self._skip_tags = {'script', 'style', 'noscript', 'svg', 'path'}
            self._skip_depth = 0

        def handle_starttag(self, tag, attrs):
            if tag in self._skip_tags:
                self._skip_depth += 1
            if tag == 'title':
                self._in_title = True
            if tag == 'a' and extract_links:
                href = dict(attrs).get('href', '')
                if href and href.startswith(('http://', 'https://')):
                    self.links.append(href)
            if tag in ('p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'li', 'tr'):
                self.text_parts.append('\n')

        def handle_endtag(self, tag):
            if tag in self._skip_tags and self._skip_depth > 0:
                self._skip_depth -= 1
            if tag == 'title':
                self._in_title = False

        def handle_data(self, data):
            if self._skip_depth > 0:
                return
            text = data.strip()
            if not text:
                return
            if self._in_title:
                self.title = text
            self.text_parts.append(text)

    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
            # Try UTF-8 first, fall back to latin-1
            try:
                html = raw.decode('utf-8')
            except UnicodeDecodeError:
                html = raw.decode('latin-1', errors='replace')

        parser = TextExtractor()
        parser.feed(html)

        content = '\n'.join(parser.text_parts)
        # Clean up whitespace
        content = re.sub(r'\n{3,}', '\n\n', content).strip()

        emails = []
        if extract_emails:
            emails = list(set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', html)))

        words = content.split()
        # Truncate to ~8000 words to avoid huge payloads
        if len(words) > 8000:
            content = ' '.join(words[:8000]) + f'\n\n[Truncated: {len(words)} total words]'

        return {
            "url": url,
            "title": parser.title or urlparse(url).netloc,
            "content": content,
            "word_count": len(words),
            "links": parser.links[:100] if extract_links else [],
            "emails": emails,
            "status": "scraped",
        }
    except Exception as e:
        return {
            "url": url,
            "title": "",
            "content": "",
            "word_count": 0,
            "links": [],
            "emails": [],
            "status": "failed",
            "error": str(e),
        }


@app.post("/scrape")
def scrape_url(req: ScrapeRequest):
    """Scrape a single URL and return structured text content."""
    result = _scrape_url(req.url, req.extract_links, req.extract_emails)
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result.get("error", "Scrape failed"))
    return result


@app.post("/scrape/multi")
def scrape_multiple(req: MultiScrapeRequest):
    """Scrape multiple URLs in sequence."""
    results = []
    for url in req.urls[:10]:  # Max 10 at a time
        results.append(_scrape_url(url, req.extract_links))
    return {
        "results": results,
        "total": len(results),
        "success": sum(1 for r in results if r["status"] == "scraped"),
        "failed": sum(1 for r in results if r["status"] == "failed"),
    }


@app.get("/scrape/search")
def scrape_search(query: str):
    """Search Google for a query and return top results' URLs."""
    import urllib.request
    import urllib.parse
    try:
        search_url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&num=5"
        req = urllib.request.Request(search_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='replace')
        # Extract URLs from Google results
        urls = re.findall(r'href="/url\?q=(https?://[^&"]+)', html)
        # Filter out Google's own URLs
        filtered = [u for u in urls if 'google.com' not in u and 'youtube.com' not in u][:5]
        return {"query": query, "urls": filtered}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Main ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9777)
