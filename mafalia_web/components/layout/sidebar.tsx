"use client";
import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Plus,
  History,
  Trash2,
  ShieldCheck,
  ChevronRight,
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
  type LucideIcon,
} from "lucide-react";
import type { Agent, ChatSession } from "@/lib/types";
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

interface SidebarProps {
  agents: Agent[];
  status: string;
  userEmail?: string;
  chatHistory: ChatSession[];
  currentChatId: string;
  onAgentClick: (agentId: string) => void;
  onSettingsClick: () => void;
  onPrivacyClick: () => void;
  onCommandPaletteOpen: () => void;
  onQuickAction: (action: "summary" | "metrics" | "create" | "research") => void;
  onNewChat: () => void;
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onSignOut: () => void;
}

export function Sidebar({
  agents,
  status,
  userEmail,
  chatHistory,
  currentChatId,
  onAgentClick,
  onSettingsClick,
  onPrivacyClick,
  onCommandPaletteOpen,
  onQuickAction,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  onSignOut,
}: SidebarProps) {
  const [showHistory, setShowHistory] = React.useState(false);

  return (
    <aside className="w-60 min-w-60 h-full flex flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className="relative w-9 h-9 flex items-center justify-center">
          <Image
            src="/mafalia-logo.png"
            alt="Mafalia"
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-[15px] font-bold tracking-tight leading-none">Mafalia</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.18em] mt-1">
            Intelligence
          </p>
        </div>
        <ThemeToggle className="ml-auto" />
      </div>

      {/* Search */}
      <div className="px-3 mb-3">
        <button
          onClick={onCommandPaletteOpen}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-secondary hover:bg-accent text-muted-foreground transition-colors border border-border/60"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left text-[12px] font-medium">Search commands…</span>
          <kbd className="inline-flex h-5 px-1.5 items-center rounded border border-border bg-background font-mono text-[10px]">
            /
          </kbd>
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 mb-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-red-800 to-red-600 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          <span>New Session</span>
        </button>
      </div>

      <SectionDivider />

      {/* Quick Actions */}
      <div className="px-3 mb-2">
        <SectionLabel>Deep Tools</SectionLabel>
        <div className="space-y-0.5">
          <QuickBtn icon={BarChart3} label="Business Health" onClick={() => onQuickAction("summary")} />
          <QuickBtn icon={TrendingUp} label="Revenue Metrics" onClick={() => onQuickAction("metrics")} />
          <QuickBtn icon={Wand2} label="Campaign Forge" onClick={() => onQuickAction("create")} />
          <QuickBtn icon={Globe} label="Market Intel" onClick={() => onQuickAction("research")} />
        </div>
      </div>

      <SectionDivider />

      {/* Agents */}
      <div className="flex items-center justify-between px-5 mb-2">
        <SectionLabel className="mb-0">Agents</SectionLabel>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {agents.length} online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
        <div className="space-y-0.5">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.id];
            return (
              <button
                key={agent.id}
                onClick={() => onAgentClick(agent.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent transition-colors group"
              >
                <div className="size-7 rounded-md flex items-center justify-center flex-shrink-0 bg-secondary border border-border/60 group-hover:bg-card">
                  {Icon ? (
                    <Icon className="size-3.5 text-muted-foreground" />
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {agent.tag.slice(1, 4)}
                    </span>
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-foreground truncate">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wide font-medium">
                    {agent.title}
                  </p>
                </div>
                <span className="text-[8.5px] font-mono font-bold px-1 py-0.5 rounded bg-secondary text-muted-foreground">
                  {agent.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat History */}
      <div className="px-3 py-2 border-t border-border">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full flex items-center justify-between px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Sessions</span>
            {chatHistory.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary border border-border">
                {chatHistory.length}
              </span>
            )}
          </div>
          <motion.div animate={{ rotate: showHistory ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="size-3" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-40 overflow-y-auto space-y-0.5 pt-1 scrollbar-thin">
                {chatHistory.length === 0 ? (
                  <p className="text-[10.5px] text-muted-foreground px-3 py-2 italic">
                    No previous sessions
                  </p>
                ) : (
                  chatHistory.map((chat) => {
                    const active = currentChatId === chat.id;
                    return (
                      <div
                        key={chat.id}
                        onClick={() => onLoadChat(chat.id)}
                        className={cn(
                          "group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare className="size-3 flex-shrink-0" />
                          <span className="text-[11.5px] truncate font-medium">{chat.title}</span>
                          {active && (
                            <span className="size-1.5 rounded-full bg-white animate-pulse-soft" />
                          )}
                        </div>
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
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-secondary/30">
        <div className="flex gap-1.5 mb-2">
          <FooterBtn icon={ShieldCheck} label="Privacy" onClick={onPrivacyClick} />
          <FooterBtn icon={Settings} label="Settings" onClick={onSettingsClick} />
        </div>
        <div className="flex items-center gap-2 px-1 mb-2">
          <span
            className={cn(
              "size-1.5 rounded-full flex-shrink-0",
              status.toLowerCase().includes("connected")
                ? "bg-emerald-500 animate-pulse-soft"
                : "bg-muted-foreground/40",
            )}
          />
          <span className="text-[10px] font-medium text-muted-foreground truncate">{status}</span>
        </div>
        {userEmail && (
          <div className="flex items-center gap-2 px-1 pt-2 border-t border-border">
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
              {userEmail[0]?.toUpperCase()}
            </div>
            <span className="text-[10.5px] font-medium text-muted-foreground truncate flex-1">
              {userEmail}
            </span>
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <LogOut className="size-3" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function SectionDivider() {
  return <div className="mx-5 my-3 h-px bg-border" />;
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-2",
        className,
      )}
    >
      {children}
    </p>
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
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent transition-colors group"
    >
      <div className="size-7 rounded-md flex items-center justify-center flex-shrink-0 bg-secondary border border-border/60 group-hover:bg-card">
        <Icon className="size-3.5 text-primary" />
      </div>
      <span className="text-[12.5px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
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
      className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-[10.5px] font-bold text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-colors"
    >
      <Icon className="size-3" />
      <span>{label}</span>
    </button>
  );
}
