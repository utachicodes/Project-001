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
  Cpu,
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
  activeView: "overview" | "chat" | "files";
  onViewChange: (view: "overview" | "chat" | "files") => void;
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
  activeView,
  onViewChange,
  onAgentClick,
  onSettingsClick,
  onPrivacyClick,
  onCommandPaletteOpen,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onRefreshMetrics,
  onSignOut,
  language,
}: SidebarProps) {
  const t = translations[language || "en"];
  const [showAgents, setShowAgents] = React.useState(true);
  const [showHistory, setShowHistory] = React.useState(true);

  return (
    <aside className="w-[280px] min-w-[280px] h-full flex flex-col bg-background border-r border-border overflow-hidden select-none">
      {/* ── Brand ── */}
      <div className="px-6 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
            <Image
              src="/mafalia-logo.png"
              alt="Mafalia"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-foreground">Mafalia</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 space-y-8">
        
        {/* ── Operations Layer ── */}
        <div className="space-y-1">
          <p className="px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] opacity-60">
            Operations
          </p>
          <NavBtn 
            icon={Activity} 
            label={t.overview} 
            active={activeView === "overview"} 
            onClick={() => onViewChange("overview")} 
          />
          <NavBtn 
            icon={MessageSquare} 
            label={t.chat} 
            active={activeView === "chat"} 
            onClick={() => onViewChange("chat")} 
          />
          <NavBtn 
            icon={Package} 
            label={t.files} 
            active={activeView === "files"} 
            onClick={() => onViewChange("files")} 
          />
        </div>

        {/* ── Intelligence Core ── */}
        <div className="space-y-1">
          <button
            onClick={() => setShowAgents(!showAgents)}
            className="w-full flex items-center justify-between px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] opacity-60 hover:opacity-100 transition-opacity"
          >
            <span>Intelligence Core</span>
            <motion.div animate={{ rotate: showAgents ? 90 : 0 }}>
              <ChevronRight className="size-3" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {showAgents && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-0.5"
              >
                {agents.slice(0, 5).map((agent) => {
                  const Icon = AGENT_ICONS[agent.id];
                  return (
                    <button
                      key={agent.id}
                      onClick={() => onAgentClick(agent.id)}
                      className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-secondary transition-colors group"
                    >
                      <div className="size-5 rounded-md flex items-center justify-center bg-secondary group-hover:bg-primary/10 transition-colors">
                        {Icon ? <Icon className="size-3 text-muted-foreground group-hover:text-primary" /> : <Cpu className="size-3" />}
                      </div>
                      <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground">
                        {agent.name}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sessions History ── */}
        <div className="space-y-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-2 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] opacity-60 hover:opacity-100 transition-opacity"
          >
            <span>Sessions</span>
            <motion.div animate={{ rotate: showHistory ? 90 : 0 }}>
              <ChevronRight className="size-3" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1"
              >
                <button
                  onClick={onNewChat}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-colors mb-2"
                >
                  <Plus className="size-4" />
                  <span className="text-[13px] font-bold">New Session</span>
                </button>
                {chatHistory.slice(0, 5).map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onLoadChat(chat.id)}
                    className={cn(
                      "w-full group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all border-none outline-none focus:ring-2 focus:ring-primary/20",
                      currentChatId === chat.id ? "bg-secondary text-foreground" : "hover:bg-secondary/50 text-muted-foreground"
                    )}
                    aria-label={`Load chat ${chat.title}`}
                  >
                    <span className="text-[12.5px] truncate font-medium">{chat.title}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                      aria-label={`Delete chat ${chat.title}`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-border bg-secondary/10 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-[12px] font-bold text-primary">
              {userEmail?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-foreground leading-none">{userEmail?.split("@")[0]}</span>
              <span className="text-[10px] font-medium text-muted-foreground mt-1">Free Plan</span>
            </div>
          </div>
          <button onClick={onSettingsClick} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
            <Settings className="size-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={onSignOut} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-destructive/5 text-destructive text-[12px] font-bold hover:bg-destructive hover:text-white transition-all border border-destructive/10">
            <LogOut className="size-4" />
            <span>Sign Out</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

function NavBtn({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
        active ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("size-4.5 transition-transform", active ? "scale-110" : "group-hover:scale-105")} />
      <span className="text-[14px] font-bold">{label}</span>
    </button>
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
