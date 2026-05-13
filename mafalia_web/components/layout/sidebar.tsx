"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Plus,
  History,
  Trash2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Search,
  Wand2,
  Globe,
  DollarSign,
  Cog,
  Heart,
  Package,
  Megaphone,
  PiggyBank,
  BarChart2,
  Wrench,
  Rocket,
  Handshake,
  LogOut,
  RefreshCw,
  Bell,
  Lightbulb,
  TrendingDown,
  Loader2,
  Zap,
  ShieldAlert,
  Target,
  Layers,
  Users,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { Agent, ChatSession } from "@/lib/types";
import type { KpiData, AlertItem } from "@/lib/metrics-fetch";
import { EMPTY_KPI } from "@/lib/metrics-fetch";
import { Language, translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const AGENT_ICONS: Record<string, LucideIcon> = {
  zara: DollarSign,
  kofi: Cog,
  amara: Heart,
  idris: Package,
  nala: Megaphone,
  tariq: PiggyBank,
  sana: BarChart2,
  ravi: Wrench,
  luna: Rocket,
  omar: Handshake,
};

// Which command to run when a KPI card is clicked
const KPI_COMMANDS: Record<keyof KpiData, string> = {
  revenue: "/analyze revenue",
  clients: "/analyze customers",
  orders: "/analyze operations",
  stock: "/analyze inventory",
};

const getKpiLabels = (lang: Language): Record<keyof KpiData, string> => {
  const t = translations[lang];
  return {
    revenue: t.revenue,
    clients: t.revPulse, // or custom
    orders: t.efficiency,
    stock: t.riskLevel,
  };
};

const DAILY_TIPS = [
  "Use /predict revenue to forecast next 30-day revenue with your current data.",
  "Try /analyze customers to identify your highest-value client segments.",
  "Run /create campaign to have Nala draft a targeted marketing campaign.",
  "Use /ask idris reorder to check which products need restocking now.",
];

interface SidebarProps {
  agents: Agent[];
  status: string;
  userEmail?: string;
  chatHistory: ChatSession[];
  currentChatId: string;
  kpiData: KpiData | null;
  alerts: AlertItem[];
  loadingMetrics: boolean;
  language: Language;
  onAgentClick: (agentId: string) => void;
  onKpiClick: (cmd: string) => void;
  onSettingsClick: () => void;
  onPrivacyClick: () => void;
  onCommandPaletteOpen: () => void;
  onQuickAction: (action: "summary" | "metrics" | "create" | "research") => void;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRefreshMetrics: () => void;
  onSignOut: () => void;
}

export function Sidebar({
  agents,
  status,
  userEmail,
  chatHistory,
  currentChatId,
  kpiData,
  alerts,
  loadingMetrics,
  onAgentClick,
  onKpiClick,
  onSettingsClick,
  onPrivacyClick,
  onCommandPaletteOpen,
  onQuickAction,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onRefreshMetrics,
  onSignOut,
  language,
}: SidebarProps) {
  const t = translations[language || "en"];
  const [showHistory, setShowHistory] = React.useState(false);
  const [showTools, setShowTools] = React.useState(true);
  const [showAgents, setShowAgents] = React.useState(true);
  const [time, setTime] = React.useState("");
  const [tipIndex] = React.useState(() => Math.floor(Math.random() * DAILY_TIPS.length));

  React.useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const kpi = kpiData ?? EMPTY_KPI;
  const kpiKeys = Object.keys(KPI_COMMANDS) as (keyof KpiData)[];

  return (
    <aside className="w-[300px] min-w-[300px] h-full flex flex-col bg-background border-r border-border overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-border">
        <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/mafalia-logo.png"
              alt="Mafalia"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      {/* ── Business Pulse ── */}
      <div className="px-4 py-3 border-b border-border">
        <div className="grid grid-cols-2 gap-2">
          {kpiKeys.map((key) => {
            const m = kpi[key];
            const labels = getKpiLabels(language);
            return (
              <button
                key={key}
                onClick={() => onKpiClick(KPI_COMMANDS[key])}
                className="rounded-lg border border-border bg-secondary/30 px-2 py-1.5 hover:bg-secondary hover:border-primary/30 transition-all text-left"
              >
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                  {labels[key]}
                </p>
                <p className="text-[13px] font-bold text-foreground tabular-nums">{m.value}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Actions ── */}
      <div className="px-4 py-3 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-[13px] bg-primary shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          <span>{t.newSession}</span>
        </button>
        <button
          onClick={onCommandPaletteOpen}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-accent text-muted-foreground transition-colors border border-border/80"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left text-[12px] font-medium">{t.searchPlaceholder}</span>
          <kbd className="inline-flex h-5 px-1.5 items-center rounded border border-border bg-background font-mono text-[10px]">
            /
          </kbd>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin px-2 space-y-4 pt-2">
        {/* Deep Tools */}
        <div className="space-y-1">
          <button
            onClick={() => setShowTools(!showTools)}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Zap className="size-3" />
              <span>{t.specialOperations}</span>
            </div>
            <motion.div animate={{ rotate: showTools ? 90 : 0 }}>
              <ChevronRight className="size-3" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showTools && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-0.5"
              >
                <QuickBtn icon={ShieldAlert} label={t.bizHealth} onClick={() => onQuickAction("summary")} />
                <QuickBtn icon={Target} label={t.revPulse} onClick={() => onQuickAction("metrics")} />
                <QuickBtn icon={Layers} label={t.campForge} onClick={() => onQuickAction("create")} />
                <QuickBtn icon={Globe} label={t.marketIntel} onClick={() => onQuickAction("research")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Agents */}
        <div className="space-y-1">
          <button
            onClick={() => setShowAgents(!showAgents)}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Users className="size-3" />
              <span>{t.intelligenceSquad}</span>
            </div>
            <motion.div animate={{ rotate: showAgents ? 90 : 0 }}>
              <ChevronRight className="size-3" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showAgents && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-0.5"
              >
                {agents.map((agent) => {
                  const Icon = AGENT_ICONS[agent.id];
                  return (
                    <button
                      key={agent.id}
                      onClick={() => onAgentClick(agent.id)}
                      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <div className="size-6 rounded-md flex items-center justify-center flex-shrink-0 bg-secondary group-hover:bg-background border border-border/50">
                        {Icon ? (
                          <Icon className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground">
                            {agent.tag.slice(1, 4)}
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {agent.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sessions */}
        <div className="space-y-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <History className="size-3.5" />
              <span>{t.sessions}</span>
              {chatHistory.length > 0 && (
                <span className="ml-1 text-[9px] px-1 py-0 rounded-full bg-secondary border border-border">
                  {chatHistory.length}
                </span>
              )}
            </div>
            <motion.div animate={{ rotate: showHistory ? 90 : 0 }}>
              <ChevronRight className="size-3" />
            </motion.div>
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-0.5"
              >
                {chatHistory.map((chat) => {
                  const active = currentChatId === chat.id;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => onLoadChat(chat.id)}
                      className={cn(
                        "group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                        active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="text-[11.5px] truncate font-medium">{chat.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 p-1 rounded transition-all",
                          active ? "hover:bg-white/20" : "hover:bg-destructive/10 hover:text-destructive",
                        )}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Live Alerts ── */}
      <div className="px-4 py-2.5 border-t border-border bg-secondary/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Bell className="size-3 text-muted-foreground" />
            <p className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest">
              {t.liveAlerts}
            </p>
          </div>
          {loadingMetrics && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
        </div>
        <div className="space-y-1.5">
          {alerts.slice(0, 2).map((alert, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={cn("mt-1 size-1 rounded-full flex-shrink-0", alert.type === "warning" ? "bg-amber-400" : "bg-emerald-400")} />
              <p className="text-[10px] text-muted-foreground leading-tight">{alert.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-2.5 pt-2 border-t border-border/60 flex items-start gap-1.5">
          <Lightbulb className="size-3 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[9.5px] text-muted-foreground leading-tight italic">
            {DAILY_TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-border bg-secondary/20">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
              {userEmail?.[0]?.toUpperCase()}
            </div>
            <span className="text-[10.5px] font-bold text-muted-foreground truncate max-w-[100px]">
              {userEmail?.split("@")[0]}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={onRefreshMetrics} disabled={loadingMetrics} className="p-1 rounded text-muted-foreground hover:text-foreground">
              <RefreshCw className={cn("size-3", loadingMetrics && "animate-spin")} />
            </button>
            <button onClick={onSettingsClick} className="p-1 rounded text-muted-foreground hover:text-foreground">
              <Settings className="size-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onPrivacyClick} className="flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold bg-secondary hover:bg-background border border-border text-muted-foreground">
            <ShieldCheck className="size-3" />
            <span>{t.privacy}</span>
          </button>
          <button onClick={onSignOut} className="flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/20">
            <LogOut className="size-3" />
            <span>{t.signOut}</span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-1 rounded-full",
                status.toLowerCase().includes("ready") ? "bg-emerald-500 animate-pulse-soft" : "bg-muted-foreground/40",
              )}
            />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">{status}</span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/60">{time}</span>
        </div>
      </div>
    </aside>
  );
}

function QuickBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-secondary transition-colors group"
    >
      <div className="size-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/8 border border-primary/15 group-hover:bg-primary/12 transition-colors">
        <Icon className="size-3 text-primary" />
      </div>
      <span className="text-[12px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </button>
  );
}

function FooterBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10.5px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary border border-border hover:border-border transition-colors"
    >
      <Icon className="size-3" />
      <span>{label}</span>
    </button>
  );
}
