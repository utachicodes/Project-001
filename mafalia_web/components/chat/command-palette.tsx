"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  Trash2,
  Globe,
  ArrowRight,
  Crown,
  Link2,
  UserPlus,
  BookOpen,
  Wand2,
  Palette,
  Bot,
  Compass,
  Repeat,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { translations, type Language } from "@/lib/i18n";

interface Command {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "agents" | "business" | "actions" | "web" | "ecosystem" | "general";
}

const COMMANDS: Command[] = [
  { id: "/summary", label: "Business Summary", description: "Full health check across all domains", icon: BarChart3, category: "business" },
  { id: "/metrics", label: "Live Metrics", description: "Real-time KPI dashboard", icon: TrendingUp, category: "business" },
  { id: "/agents", label: "List Agents", description: "All 11 agents and their superpowers", icon: Users, category: "business" },
  { id: "/ask", label: "Ask Agent", description: "/ask <agent> <question>", icon: MessageSquare, category: "agents" },
  { id: "/analyze", label: "Analyze", description: "Deep analysis (revenue, customers, inventory…)", icon: BarChart3, category: "actions" },
  { id: "/predict", label: "Predict", description: "Forecast future (revenue, churn, cashflow…)", icon: TrendingUp, category: "actions" },
  { id: "/create", label: "Create", description: "Generate content (campaign, code, plan…)", icon: Wand2, category: "actions" },
  { id: "/design", label: "Design", description: "Creative brief (social post, flyer, ad…)", icon: Palette, category: "actions" },
  { id: "/automate", label: "Automate", description: "Build workflow (operations, restocking, api)", icon: Repeat, category: "actions" },
  { id: "/research", label: "Research", description: "Market intelligence (trends, competitors…)", icon: Compass, category: "actions" },
  { id: "/scrape", label: "Scrape URL", description: "Scrape a webpage and save to your workspace", icon: Link2, category: "web" },
  { id: "/search", label: "Web Search", description: "Search the web for a topic", icon: Globe, category: "web" },
  { id: "/connect", label: "Add Connection", description: "Save a business connection", icon: UserPlus, category: "web" },
  { id: "/connections", label: "View Connections", description: "List saved business connections", icon: BookOpen, category: "web" },
  { id: "/boss", label: "Boss Dashboard", description: "Open agent ecosystem with boss oversight", icon: Crown, category: "ecosystem" },
  { id: "/rooms", label: "Agent Rooms", description: "Show all agent room assignments", icon: Bot, category: "ecosystem" },
  { id: "/config", label: "Settings", description: "Configure AI provider and model", icon: Settings, category: "general" },
  { id: "/clear", label: "Clear Chat", description: "Start a fresh conversation", icon: Trash2, category: "general" },
  { id: "/help", label: "Help", description: "Show all available commands", icon: Terminal, category: "general" },
];

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business Intelligence",
  agents: "AI Agents",
  actions: "Actions",
  web: "Web & Data",
  ecosystem: "Agent Ecosystem",
  general: "General",
};

const NEEDS_ARGS = new Set([
  "/ask", "/scrape", "/search", "/connect",
  "/analyze", "/predict", "/create", "/design", "/automate", "/research",
]);

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (command: string, needsArgs: boolean) => void;
  language: Language;
}

export function CommandPalette({ isOpen, onClose, onSelect, language }: CommandPaletteProps) {
  const t = translations[language || "en"];
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!query) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [query]);

  const grouped = React.useMemo(() => {
    const g: Record<string, Command[]> = {};
    filtered.forEach((c) => {
      (g[c.category] ??= []).push(c);
    });
    return g;
  }, [filtered]);

  const flatList = React.useMemo(() => Object.values(grouped).flat(), [grouped]);

  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  React.useEffect(() => setSelectedIndex(0), [query]);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current
        .querySelector(`[data-index="${selectedIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleSelect = (cmd: Command) => {
    onSelect(cmd.id, NEEDS_ARGS.has(cmd.id));
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (flatList[selectedIndex]) handleSelect(flatList[selectedIndex]);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  let itemIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", damping: 26, stiffness: 420 }}
            className="fixed top-[14%] left-1/2 -translate-x-1/2 w-full max-w-[540px] z-50 px-4"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-card border border-border">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="size-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.searchCommands}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-[14px] font-medium outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <Kbd>esc</Kbd>
              </div>

              <div ref={listRef} className="max-h-[380px] overflow-y-auto py-2 scrollbar-thin">
                {flatList.length === 0 && (
                  <div className="px-4 py-10 text-center text-muted-foreground text-[13px]">
                    {t.noCommands}
                  </div>
                )}
                {Object.entries(grouped).map(([cat, cmds]) => (
                  <div key={cat}>
                    <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                    </div>
                    {cmds.map((cmd) => {
                      itemIndex++;
                      const idx = itemIndex;
                      const isSelected = idx === selectedIndex;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          data-index={idx}
                          onClick={() => handleSelect(cmd)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-l-[3px] ${
                            isSelected
                              ? "bg-accent border-l-primary"
                              : "border-l-transparent hover:bg-accent/50"
                          }`}
                        >
                          <div className="size-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary border border-border">
                            <Icon className="size-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13.5px] font-semibold text-foreground">
                                {cmd.label}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-muted-foreground/70 uppercase">
                                {cmd.id}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-muted-foreground truncate mt-0.5">
                              {cmd.description}
                            </p>
                          </div>
                          {isSelected && <ArrowRight className="size-3.5 text-muted-foreground" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 flex items-center gap-3 text-[10px] text-muted-foreground border-t border-border">
                <span className="flex items-center gap-1">
                  <Kbd>↑↓</Kbd>navigate
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>↵</Kbd>select
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>esc</Kbd>close
                </span>
                <span className="ml-auto">{filtered.length} commands</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
