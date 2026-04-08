# -*- coding: utf-8 -*-
"""
Mafalia Code -- Desktop Application
======================================
A modern desktop GUI for Mafalia's 10 AI agents.
Built with customtkinter for a native, polished look.
Non-technical users can chat, get business insights, and manage operations.
"""

import os
import sys
import json
import threading
import tkinter as tk
from datetime import datetime
from typing import Optional

try:
    import customtkinter as ctk
except ImportError:
    print("Installing customtkinter...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "customtkinter"])
    import customtkinter as ctk

# Ensure project root is importable
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from mafalia_code.config import (
    load_config, save_config, PROVIDERS, DEFAULT_CONFIG,
)
from mafalia_code.llm import MafaliaLLM
from mafalia_code.tools import MafaliaToolExecutor

# ── Theme ───────────────────────────────────────────────────────────────

COLORS = {
    "bg": "#0D1117",
    "sidebar": "#161B22",
    "chat_bg": "#0D1117",
    "input_bg": "#1C2333",
    "input_border": "#30363D",
    "accent": "#FF6B35",
    "accent_hover": "#FF8C5A",
    "text": "#E6EDF3",
    "text_dim": "#8B949E",
    "user_bubble": "#1F3A5F",
    "ai_bubble": "#1A2332",
    "success": "#3FB950",
    "warning": "#D29922",
    "error": "#F85149",
    "agent_colors": {
        "zara": "#FF6B35", "kofi": "#2E86AB", "amara": "#A23B72",
        "idris": "#1B998B", "nala": "#F77F00", "tariq": "#6C5B7B",
        "sana": "#2D6A4F", "ravi": "#E63946", "luna": "#9B5DE5",
        "omar": "#06D6A0",
    },
}

AGENT_INFO = {
    "zara":  {"tag": "[REV]", "title": "Revenue Strategist",     "icon": "Z"},
    "kofi":  {"tag": "[OPS]", "title": "Operations Commander",   "icon": "K"},
    "amara": {"tag": "[CUS]", "title": "Customer Champion",      "icon": "A"},
    "idris": {"tag": "[INV]", "title": "Inventory Guardian",     "icon": "I"},
    "nala":  {"tag": "[MKT]", "title": "Marketing Maven",        "icon": "N"},
    "tariq": {"tag": "[FIN]", "title": "Finance Wizard",         "icon": "T"},
    "sana":  {"tag": "[DAT]", "title": "Data Scientist",         "icon": "S"},
    "ravi":  {"tag": "[TEC]", "title": "Tech Architect",         "icon": "R"},
    "luna":  {"tag": "[GRO]", "title": "Growth Hacker",          "icon": "L"},
    "omar":  {"tag": "[PAR]", "title": "Partnership Connector",  "icon": "O"},
}


# ═══════════════════════════════════════════════════════════════════════
# SETUP WIZARD (shown on first run)
# ═══════════════════════════════════════════════════════════════════════

class SetupWizard(ctk.CTkToplevel):
    """First-run wizard to configure API provider, key, and model."""

    def __init__(self, parent, callback):
        super().__init__(parent)
        self.callback = callback
        self.title("Mafalia Code -- Setup")
        self.geometry("520x580")
        self.resizable(False, False)
        self.configure(fg_color=COLORS["bg"])
        self.grab_set()

        # Header
        ctk.CTkLabel(self, text="Welcome to Mafalia Code",
                     font=ctk.CTkFont(size=22, weight="bold"),
                     text_color=COLORS["accent"]).pack(pady=(30, 5))
        ctk.CTkLabel(self, text="Connect any AI model to power your 10 business agents",
                     font=ctk.CTkFont(size=13), text_color=COLORS["text_dim"]).pack(pady=(0, 25))

        # Provider
        ctk.CTkLabel(self, text="AI Provider", font=ctk.CTkFont(size=14, weight="bold"),
                     text_color=COLORS["text"], anchor="w").pack(padx=40, anchor="w")
        self.provider_var = ctk.StringVar(value="openai")
        provider_names = [f"{k} -- {v['name']}" for k, v in PROVIDERS.items()]
        self.provider_menu = ctk.CTkOptionMenu(
            self, values=provider_names, variable=self.provider_var,
            width=440, height=38, fg_color=COLORS["input_bg"],
            button_color=COLORS["accent"], button_hover_color=COLORS["accent_hover"],
            command=self._on_provider_change,
        )
        self.provider_menu.pack(padx=40, pady=(5, 15))

        # API Key
        ctk.CTkLabel(self, text="API Key", font=ctk.CTkFont(size=14, weight="bold"),
                     text_color=COLORS["text"], anchor="w").pack(padx=40, anchor="w")
        self.key_entry = ctk.CTkEntry(
            self, width=440, height=38, placeholder_text="sk-... or your API key",
            fg_color=COLORS["input_bg"], border_color=COLORS["input_border"],
            text_color=COLORS["text"], show="*",
        )
        self.key_entry.pack(padx=40, pady=(5, 15))

        # Model
        ctk.CTkLabel(self, text="Model", font=ctk.CTkFont(size=14, weight="bold"),
                     text_color=COLORS["text"], anchor="w").pack(padx=40, anchor="w")
        self.model_var = ctk.StringVar(value="gpt-4o")
        self.model_menu = ctk.CTkOptionMenu(
            self, values=PROVIDERS["openai"]["models"], variable=self.model_var,
            width=440, height=38, fg_color=COLORS["input_bg"],
            button_color=COLORS["accent"], button_hover_color=COLORS["accent_hover"],
        )
        self.model_menu.pack(padx=40, pady=(5, 15))

        # Custom base URL (for custom provider)
        self.url_label = ctk.CTkLabel(self, text="Base URL (optional)",
                                       font=ctk.CTkFont(size=14, weight="bold"),
                                       text_color=COLORS["text"], anchor="w")
        self.url_entry = ctk.CTkEntry(
            self, width=440, height=38, placeholder_text="https://your-api.com/v1",
            fg_color=COLORS["input_bg"], border_color=COLORS["input_border"],
            text_color=COLORS["text"],
        )

        # Data directory
        ctk.CTkLabel(self, text="Business Data Folder", font=ctk.CTkFont(size=14, weight="bold"),
                     text_color=COLORS["text"], anchor="w").pack(padx=40, anchor="w")
        self.data_entry = ctk.CTkEntry(
            self, width=440, height=38,
            fg_color=COLORS["input_bg"], border_color=COLORS["input_border"],
            text_color=COLORS["text"],
        )
        self.data_entry.insert(0, _ROOT)
        self.data_entry.pack(padx=40, pady=(5, 25))

        # Start button
        ctk.CTkButton(
            self, text="Start Mafalia Code", width=440, height=45,
            font=ctk.CTkFont(size=15, weight="bold"),
            fg_color=COLORS["accent"], hover_color=COLORS["accent_hover"],
            command=self._save,
        ).pack(padx=40)

    def _on_provider_change(self, val: str):
        key = val.split(" -- ")[0].strip()
        if key in PROVIDERS and PROVIDERS[key]["models"]:
            self.model_menu.configure(values=PROVIDERS[key]["models"])
            self.model_var.set(PROVIDERS[key]["models"][0])
        if key == "custom":
            self.url_label.pack(padx=40, anchor="w", before=self.data_entry.master)
            self.url_entry.pack(padx=40, pady=(5, 15))
        else:
            self.url_label.pack_forget()
            self.url_entry.pack_forget()

    def _save(self):
        provider_raw = self.provider_var.get()
        provider_key = provider_raw.split(" -- ")[0].strip()
        cfg = {
            "provider": provider_key,
            "model": self.model_var.get(),
            "api_key": self.key_entry.get().strip(),
            "base_url": self.url_entry.get().strip() if provider_key == "custom" else "",
            "data_dir": self.data_entry.get().strip() or _ROOT,
            "max_tokens": 4096,
            "temperature": 0.4,
        }
        save_config(cfg)
        self.destroy()
        self.callback(cfg)


# ═══════════════════════════════════════════════════════════════════════
# MAIN APPLICATION
# ═══════════════════════════════════════════════════════════════════════

class MafaliaCodeApp(ctk.CTk):
    """The main Mafalia Code desktop application."""

    def __init__(self):
        super().__init__()
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.title("Mafalia Code")
        self.geometry("1100x720")
        self.minsize(900, 600)
        self.configure(fg_color=COLORS["bg"])

        self.llm: Optional[MafaliaLLM] = None
        self.tools: Optional[MafaliaToolExecutor] = None
        self.cfg = load_config()

        self._build_ui()

        if not self.cfg.get("api_key"):
            self.after(300, self._show_setup)
        else:
            self._init_backend(self.cfg)

    # ── UI Construction ─────────────────────────────────────────────────

    def _build_ui(self):
        # Main grid
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # ── Sidebar ──
        self.sidebar = ctk.CTkFrame(self, width=240, fg_color=COLORS["sidebar"], corner_radius=0)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_propagate(False)

        # Logo
        logo_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        logo_frame.pack(fill="x", padx=15, pady=(20, 5))
        ctk.CTkLabel(logo_frame, text="MAFALIA",
                     font=ctk.CTkFont(size=20, weight="bold"),
                     text_color=COLORS["accent"]).pack(anchor="w")
        ctk.CTkLabel(logo_frame, text="CODE",
                     font=ctk.CTkFont(size=20, weight="bold"),
                     text_color=COLORS["text"]).pack(anchor="w")
        ctk.CTkLabel(self.sidebar, text="Business Operations CoWork",
                     font=ctk.CTkFont(size=11), text_color=COLORS["text_dim"]).pack(padx=15, anchor="w", pady=(0, 15))

        # Divider
        ctk.CTkFrame(self.sidebar, height=1, fg_color=COLORS["input_border"]).pack(fill="x", padx=15, pady=5)

        # Quick actions
        ctk.CTkLabel(self.sidebar, text="QUICK ACTIONS",
                     font=ctk.CTkFont(size=11, weight="bold"),
                     text_color=COLORS["text_dim"]).pack(padx=15, anchor="w", pady=(10, 5))

        actions = [
            ("Business Summary", self._cmd_summary),
            ("Live Metrics", self._cmd_metrics),
            ("New Chat", self._cmd_clear),
        ]
        for label, cmd in actions:
            ctk.CTkButton(
                self.sidebar, text=label, height=32, anchor="w",
                fg_color="transparent", hover_color=COLORS["input_bg"],
                text_color=COLORS["text"], font=ctk.CTkFont(size=13),
                command=cmd,
            ).pack(fill="x", padx=10, pady=1)

        # Divider
        ctk.CTkFrame(self.sidebar, height=1, fg_color=COLORS["input_border"]).pack(fill="x", padx=15, pady=10)

        # Agents list
        ctk.CTkLabel(self.sidebar, text="AGENTS",
                     font=ctk.CTkFont(size=11, weight="bold"),
                     text_color=COLORS["text_dim"]).pack(padx=15, anchor="w", pady=(0, 5))

        self.agent_scroll = ctk.CTkScrollableFrame(self.sidebar, fg_color="transparent")
        self.agent_scroll.pack(fill="both", expand=True, padx=5)

        for name, info in AGENT_INFO.items():
            color = COLORS["agent_colors"][name]
            btn_frame = ctk.CTkFrame(self.agent_scroll, fg_color="transparent")
            btn_frame.pack(fill="x", pady=1)

            icon_lbl = ctk.CTkLabel(btn_frame, text=info["icon"], width=28, height=28,
                                     font=ctk.CTkFont(size=12, weight="bold"),
                                     fg_color=color, corner_radius=6, text_color="white")
            icon_lbl.pack(side="left", padx=(5, 8), pady=2)

            text_frame = ctk.CTkFrame(btn_frame, fg_color="transparent")
            text_frame.pack(side="left", fill="x")
            ctk.CTkLabel(text_frame, text=name.capitalize(),
                         font=ctk.CTkFont(size=12, weight="bold"),
                         text_color=COLORS["text"], anchor="w").pack(anchor="w")
            ctk.CTkLabel(text_frame, text=info["title"],
                         font=ctk.CTkFont(size=10),
                         text_color=COLORS["text_dim"], anchor="w").pack(anchor="w")

            btn_frame.bind("<Button-1>", lambda e, n=name: self._ask_agent_quick(n))
            for child in btn_frame.winfo_children():
                child.bind("<Button-1>", lambda e, n=name: self._ask_agent_quick(n))

        # Bottom: settings
        ctk.CTkButton(
            self.sidebar, text="Settings", height=32,
            fg_color="transparent", hover_color=COLORS["input_bg"],
            text_color=COLORS["text_dim"], font=ctk.CTkFont(size=12),
            command=self._show_setup,
        ).pack(fill="x", padx=10, pady=(5, 10), side="bottom")

        # Status label
        self.status_label = ctk.CTkLabel(
            self.sidebar, text="Not connected", font=ctk.CTkFont(size=10),
            text_color=COLORS["text_dim"],
        )
        self.status_label.pack(padx=15, pady=(0, 5), side="bottom", anchor="w")

        # ── Chat Area ──
        chat_container = ctk.CTkFrame(self, fg_color=COLORS["chat_bg"], corner_radius=0)
        chat_container.grid(row=0, column=1, sticky="nsew")
        chat_container.grid_rowconfigure(0, weight=1)
        chat_container.grid_columnconfigure(0, weight=1)

        # Chat messages scroll
        self.chat_scroll = ctk.CTkScrollableFrame(
            chat_container, fg_color=COLORS["chat_bg"], corner_radius=0,
        )
        self.chat_scroll.grid(row=0, column=0, sticky="nsew", padx=0, pady=0)

        # Welcome message
        self._add_welcome()

        # Input area
        input_frame = ctk.CTkFrame(chat_container, fg_color=COLORS["sidebar"], height=80, corner_radius=0)
        input_frame.grid(row=1, column=0, sticky="ew")
        input_frame.grid_columnconfigure(0, weight=1)

        self.input_box = ctk.CTkTextbox(
            input_frame, height=50, fg_color=COLORS["input_bg"],
            border_color=COLORS["input_border"], border_width=1,
            text_color=COLORS["text"], font=ctk.CTkFont(size=14),
            corner_radius=12, wrap="word",
        )
        self.input_box.grid(row=0, column=0, sticky="ew", padx=(15, 10), pady=15)
        self.input_box.bind("<Return>", self._on_enter)
        self.input_box.bind("<Shift-Return>", lambda e: None)  # allow newline

        self.send_btn = ctk.CTkButton(
            input_frame, text="Send", width=80, height=50,
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color=COLORS["accent"], hover_color=COLORS["accent_hover"],
            corner_radius=12, command=self._on_send,
        )
        self.send_btn.grid(row=0, column=1, padx=(0, 15), pady=15)

    # ── Welcome ─────────────────────────────────────────────────────────

    def _add_welcome(self):
        frame = ctk.CTkFrame(self.chat_scroll, fg_color="transparent")
        frame.pack(fill="x", padx=40, pady=(40, 10))

        ctk.CTkLabel(frame, text="Welcome to Mafalia Code",
                     font=ctk.CTkFont(size=24, weight="bold"),
                     text_color=COLORS["accent"]).pack(anchor="w")
        ctk.CTkLabel(frame, text="Your 10 AI agents are ready. Ask anything about your business.",
                     font=ctk.CTkFont(size=14), text_color=COLORS["text_dim"],
                     wraplength=600).pack(anchor="w", pady=(5, 20))

        # Suggestion chips
        suggestions = [
            "How is revenue this week?",
            "Check inventory levels",
            "Run a full business summary",
            "Which customers are at risk?",
            "Design a marketing campaign",
            "Show me the financial health",
        ]
        chips_frame = ctk.CTkFrame(frame, fg_color="transparent")
        chips_frame.pack(anchor="w")
        row_frame = None
        for i, s in enumerate(suggestions):
            if i % 3 == 0:
                row_frame = ctk.CTkFrame(chips_frame, fg_color="transparent")
                row_frame.pack(anchor="w", pady=3)
            ctk.CTkButton(
                row_frame, text=s, height=34,
                fg_color=COLORS["input_bg"], hover_color=COLORS["user_bubble"],
                text_color=COLORS["text"], font=ctk.CTkFont(size=12),
                corner_radius=17, border_width=1, border_color=COLORS["input_border"],
                command=lambda msg=s: self._send_message(msg),
            ).pack(side="left", padx=(0, 8))

    # ── Chat Bubbles ────────────────────────────────────────────────────

    def _add_user_msg(self, text: str):
        frame = ctk.CTkFrame(self.chat_scroll, fg_color="transparent")
        frame.pack(fill="x", padx=40, pady=(12, 2))

        header = ctk.CTkFrame(frame, fg_color="transparent")
        header.pack(anchor="e")
        ctk.CTkLabel(header, text="You", font=ctk.CTkFont(size=12, weight="bold"),
                     text_color=COLORS["text"]).pack(side="left")
        ctk.CTkLabel(header, text=f"  {datetime.now().strftime('%H:%M')}",
                     font=ctk.CTkFont(size=10), text_color=COLORS["text_dim"]).pack(side="left")

        bubble = ctk.CTkFrame(frame, fg_color=COLORS["user_bubble"], corner_radius=14)
        bubble.pack(anchor="e", pady=(3, 0))
        ctk.CTkLabel(bubble, text=text, font=ctk.CTkFont(size=13),
                     text_color=COLORS["text"], wraplength=500,
                     justify="left").pack(padx=16, pady=10)
        self._scroll_bottom()

    def _add_ai_msg(self, text: str, agent_tag: str = ""):
        frame = ctk.CTkFrame(self.chat_scroll, fg_color="transparent")
        frame.pack(fill="x", padx=40, pady=(12, 2))

        header = ctk.CTkFrame(frame, fg_color="transparent")
        header.pack(anchor="w")

        label_text = "Mafalia"
        label_color = COLORS["accent"]
        if agent_tag:
            label_text = f"Mafalia {agent_tag}"

        ctk.CTkLabel(header, text=label_text, font=ctk.CTkFont(size=12, weight="bold"),
                     text_color=label_color).pack(side="left")
        ctk.CTkLabel(header, text=f"  {datetime.now().strftime('%H:%M')}",
                     font=ctk.CTkFont(size=10), text_color=COLORS["text_dim"]).pack(side="left")

        bubble = ctk.CTkFrame(frame, fg_color=COLORS["ai_bubble"], corner_radius=14)
        bubble.pack(anchor="w", pady=(3, 0))
        ctk.CTkLabel(bubble, text=text, font=ctk.CTkFont(size=13),
                     text_color=COLORS["text"], wraplength=560,
                     justify="left").pack(padx=16, pady=10)
        self._scroll_bottom()

    def _add_status_msg(self, text: str, color: str = None):
        color = color or COLORS["text_dim"]
        frame = ctk.CTkFrame(self.chat_scroll, fg_color="transparent")
        frame.pack(fill="x", padx=40, pady=3)
        ctk.CTkLabel(frame, text=text, font=ctk.CTkFont(size=11, slant="italic"),
                     text_color=color).pack(anchor="w")
        self._scroll_bottom()

    def _scroll_bottom(self):
        self.chat_scroll._parent_canvas.yview_moveto(1.0)

    # ── Message Handling ────────────────────────────────────────────────

    def _on_enter(self, event):
        if not event.state & 1:  # Shift not held
            self._on_send()
            return "break"

    def _on_send(self):
        text = self.input_box.get("1.0", "end").strip()
        if not text:
            return
        self.input_box.delete("1.0", "end")
        self._send_message(text)

    def _send_message(self, text: str):
        if not self.llm:
            self._add_status_msg("Not connected. Click Settings to configure.", COLORS["error"])
            return

        # Handle slash commands
        if text.startswith("/"):
            self._handle_command(text)
            return

        self._add_user_msg(text)
        self.send_btn.configure(state="disabled", text="...")
        threading.Thread(target=self._process_llm, args=(text,), daemon=True).start()

    def _process_llm(self, text: str):
        """Run LLM call in background thread, handle tool calls."""
        try:
            self.after(0, lambda: self._add_status_msg("Thinking..."))
            response = self.llm.chat(text)

            # Tool call loop
            max_rounds = 5
            round_count = 0
            while response.get("tool_calls") and round_count < max_rounds:
                round_count += 1
                for tc in response["tool_calls"]:
                    name = tc["name"]
                    args = tc["arguments"]
                    self.after(0, lambda n=name: self._add_status_msg(f"Running {n}..."))
                    result = self.tools.execute(name, args)
                    response = self.llm.tool_result(tc["id"], name, result)

            final_text = response.get("text", "").strip()
            if final_text:
                self.after(0, lambda: self._add_ai_msg(final_text))
            else:
                self.after(0, lambda: self._add_ai_msg("Done. Check the data above."))

        except Exception as e:
            self.after(0, lambda: self._add_status_msg(f"Error: {e}", COLORS["error"]))
        finally:
            self.after(0, lambda: self.send_btn.configure(state="normal", text="Send"))

    # ── Slash Commands ──────────────────────────────────────────────────

    def _handle_command(self, text: str):
        parts = text.strip().split(maxsplit=1)
        cmd = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""

        if cmd == "/help":
            self._add_ai_msg(
                "Available commands:\n\n"
                "/summary    -- Full business health check\n"
                "/metrics    -- Live KPI dashboard\n"
                "/ask <agent> <question> -- Ask a specific agent\n"
                "/agents     -- List all 10 agents\n"
                "/clear      -- Clear chat\n"
                "/config     -- Open settings\n"
                "/cost       -- Show token usage\n"
                "/exit       -- Exit Mafalia Code"
            )
        elif cmd == "/summary":
            self._cmd_summary()
        elif cmd == "/metrics":
            self._cmd_metrics()
        elif cmd == "/agents":
            lines = []
            for name, info in AGENT_INFO.items():
                c = COLORS["agent_colors"][name]
                lines.append(f"{info['tag']} {name.capitalize()} -- {info['title']}")
            self._add_ai_msg("Your 10 Agents:\n\n" + "\n".join(lines))
        elif cmd == "/ask" and arg:
            agent_parts = arg.split(maxsplit=1)
            agent_name = agent_parts[0].lower()
            question = agent_parts[1] if len(agent_parts) > 1 else "overview"
            self._add_user_msg(f"/ask {agent_name} {question}")
            self._send_message(f"Ask {agent_name}: {question}")
        elif cmd == "/clear":
            self._cmd_clear()
        elif cmd == "/config":
            self._show_setup()
        elif cmd == "/cost":
            s = self.llm.tracker.summary() if self.llm else {"calls": 0, "total_tokens": 0}
            self._add_ai_msg(
                f"Token Usage:\n\n"
                f"API calls: {s['calls']}\n"
                f"Prompt tokens: {s.get('prompt_tokens', 0):,}\n"
                f"Completion tokens: {s.get('completion_tokens', 0):,}\n"
                f"Total tokens: {s.get('total_tokens', 0):,}"
            )
        elif cmd == "/exit":
            self.destroy()
        else:
            self._add_status_msg(f"Unknown command: {cmd}. Type /help", COLORS["warning"])

    # ── Quick Actions ───────────────────────────────────────────────────

    def _cmd_summary(self):
        self._send_message("Give me a full business summary across all agents")

    def _cmd_metrics(self):
        self._send_message("Show me the live business metrics and KPIs")

    def _cmd_clear(self):
        for widget in self.chat_scroll.winfo_children():
            widget.destroy()
        if self.llm:
            self.llm.reset()
        self._add_welcome()

    def _ask_agent_quick(self, agent_name: str):
        title = AGENT_INFO[agent_name]["title"]
        self._send_message(f"Ask {agent_name} for a quick overview of their domain")

    # ── Backend Init ────────────────────────────────────────────────────

    def _show_setup(self):
        SetupWizard(self, self._init_backend)

    def _init_backend(self, cfg: dict):
        self.cfg = cfg
        data_dir = cfg.get("data_dir", _ROOT)
        try:
            self.llm = MafaliaLLM(cfg)
            self.tools = MafaliaToolExecutor(data_dir)
            provider = cfg.get("provider", "?")
            model = cfg.get("model", "?")
            self.status_label.configure(
                text=f"Connected: {provider}/{model}",
                text_color=COLORS["success"],
            )
            self._add_status_msg(
                f"Connected to {PROVIDERS.get(provider, {}).get('name', provider)} using {model}",
                COLORS["success"],
            )
        except Exception as e:
            self.status_label.configure(text=f"Error: {e}", text_color=COLORS["error"])


# ═══════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════

def main():
    app = MafaliaCodeApp()
    app.mainloop()


if __name__ == "__main__":
    main()
