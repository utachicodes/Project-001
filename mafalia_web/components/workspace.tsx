"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { CommandPalette } from "@/components/chat/command-palette";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { PrivacyModal } from "@/components/modals/privacy-modal";
import { DEFAULT_AGENTS, ANALYZE_MAP, PREDICT_MAP, CREATE_MAP } from "@/lib/agents";
import {
  loadConfig,
  saveConfig as persistConfig,
  loadChatHistory,
  saveChatHistory,
  DEFAULT_CONFIG,
} from "@/lib/config-store";
import type { Config, Message, ChatSession } from "@/lib/types";
import type { KpiData, AlertItem } from "@/lib/metrics-fetch";
import { fetchLiveMetrics } from "@/lib/metrics-fetch";
import { llmClient } from "@/lib/llm-api";
import { createClient } from "@/lib/supabase/client";
import type { UploadedFile } from "@/lib/supabase/storage";
import { translations, type Language } from "@/lib/i18n";

interface WorkspaceProps {
  userId: string;
  userEmail: string;
}

const mkAssistantMsg = (content: string, agentTag = "[MAF]"): Message => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role: "assistant",
  content,
  agentTag,
  timestamp: new Date().toISOString(),
});

const welcomeMsg = (hasKey: boolean, lang: Language): Message => {
  const t = translations[lang];
  return mkAssistantMsg(
    hasKey
      ? ""
      : `${t.setupRequired}.\n\n• **OpenRouter** — Free tier at openrouter.ai\n• **Google Gemini** — Free API at aistudio.google.com\n• **Ollama** — Run locally`,
  );
};

import { PlatformOverview } from "@/components/dashboard/platform-overview";
import { FilesView } from "@/components/dashboard/files-view";

export function Workspace({ userId, userEmail }: WorkspaceProps) {
// ... existing state ...
  const router = useRouter();
  const [config, setConfig] = React.useState<Config>(DEFAULT_CONFIG);
  const [showSetup, setShowSetup] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showCmdPalette, setShowCmdPalette] = React.useState(false);
  const [pendingInput, setPendingInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [status, setStatus] = React.useState("Not connected");
  const [currentModel, setCurrentModel] = React.useState("");
  const [activeView, setActiveView] = React.useState<"overview" | "chat" | "files">("overview");
  const [chatHistory, setChatHistory] = React.useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = React.useState("");

  // ... rest of the component ...
  const [kpiData, setKpiData] = React.useState<KpiData | null>(null);
  const [sidebarAlerts, setSidebarAlerts] = React.useState<AlertItem[]>([]);
  const [loadingMetrics, setLoadingMetrics] = React.useState(false);
  const [recentFiles, setRecentFiles] = React.useState<any[]>([]);

  const initRef = React.useRef(false);

  const refreshFiles = React.useCallback(async () => {
    if (!userId) return;
    try {
      const { listUserFiles } = await import("@/lib/supabase/storage");
      const files = await listUserFiles(userId);
      setRecentFiles(files.map(f => ({
        id: f.id,
        name: f.name.split("_").slice(1).join("_") || f.name,
        size: f.metadata ? (f.metadata.size / 1024).toFixed(1) + " KB" : "—",
        date: f.created_at ? new Date(f.created_at).toLocaleDateString() : "—",
        agent: "INTEL",
        raw: f
      })));
    } catch (err) {
      console.error("refreshFiles:", err);
    }
  }, [userId]);

  const refreshMetrics = React.useCallback(async () => {
    if (!llmClient.hasValidConfig()) return;
    setLoadingMetrics(true);
    try {
      const { kpi, alerts } = await fetchLiveMetrics((msg) => llmClient.chat(msg));
      setKpiData(kpi);
      setSidebarAlerts(alerts);
    } catch {
      // LLM returned non-parseable JSON — silently keep previous state
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  React.useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const saved = loadConfig();
    const hasValid = saved?.apiKey || saved?.provider === "ollama";
    if (saved) {
      setConfig(saved);
      llmClient.setConfig(saved);
      const t = translations[saved.language || "en"];
      setStatus(hasValid ? `${t.ready}: ${saved.provider}` : `${t.setupRequired}: ${saved.provider}`);
      if (hasValid) {
        refreshMetrics();
        refreshFiles();
      }
    }
    if (!hasValid) {
      setShowSetup(true);
    }
    setChatHistory(loadChatHistory());
  }, [refreshMetrics]);

  React.useEffect(() => {
    if (!currentChatId) setMessages([welcomeMsg(!!config?.apiKey || config?.provider === "ollama", config.language)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCmdPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const chatTitle = (msgs: Message[]) => {
    const first = msgs.find((m) => m.role === "user");
    return first ? first.content.slice(0, 40) + (first.content.length > 40 ? "…" : "") : "New Chat";
  };

  const handleNewChat = () => {
    if (messages.length > 1 && currentChatId) {
      const updated = chatHistory.map((c) =>
        c.id === currentChatId ? { ...c, messages, title: chatTitle(messages) } : c,
      );
      setChatHistory(updated);
      saveChatHistory(updated);
    }
    const id = `${Date.now()}`;
    setCurrentChatId(id);
    setMessages([welcomeMsg(!!config?.apiKey || config?.provider === "ollama", config.language)]);
    setActiveView("chat");
  };

  const handleLoadChat = (id: string) => {
    const c = chatHistory.find((c) => c.id === id);
    if (c) {
      setCurrentChatId(id);
      setMessages(c.messages);
      setActiveView("chat");
    }
  };

  const handleDeleteChat = (id: string) => {
    const updated = chatHistory.filter((c) => c.id !== id);
    setChatHistory(updated);
    saveChatHistory(updated);
    if (currentChatId === id) {
      setCurrentChatId("");
      setMessages([welcomeMsg(!!config?.apiKey, config.language)]);
    }
  };

  const saveConfigAndConnect = (cfg: Config) => {
    const hasValid = cfg.apiKey || cfg.provider === "ollama";
    persistConfig(cfg);
    setConfig(cfg);
    llmClient.setConfig(cfg);
    const t = translations[cfg.language || "en"];
    setStatus(hasValid ? `${t.ready}: ${cfg.provider}` : `${t.setupRequired}: ${cfg.provider}`);
    setShowSetup(false);
    addMsg(
      mkAssistantMsg(
        hasValid
          ? `**Configuration saved.**\n\n• **Provider:** ${cfg.provider}\n• **Model:** ${cfg.model}`
          : `**Configuration saved.**\n\n*Note: An API key is required to activate ${cfg.provider}.*`,
      ),
    );
    if (hasValid) {
      toast.success(t.ready);
      refreshMetrics();
    }
  };

  const addMsg = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const autoSaveChat = (msgs: Message[]) => {
    const id = currentChatId || `${Date.now()}`;
    if (!currentChatId) setCurrentChatId(id);
    setChatHistory((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const session: ChatSession = {
        id,
        title: chatTitle(msgs),
        date: new Date().toISOString(),
        messages: msgs,
      };
      const updated =
        idx >= 0 ? prev.map((c) => (c.id === id ? session : c)) : [session, ...prev];
      saveChatHistory(updated);
      return updated;
    });
  };

  const handleSendMessage = async (content: string, attachments?: UploadedFile[]) => {
    const text = content.trim();
    if (!text && (!attachments || attachments.length === 0)) return;

    setActiveView("chat");

    const userMsg: Message = {
      id: `${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      attachments: attachments?.map((a) => ({ name: a.name, url: a.url, size: a.size })),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (attachments?.length) refreshFiles();

    if (!llmClient.hasValidConfig()) {
      addMsg(mkAssistantMsg(llmClient.getMissingConfigMessage()));
      return;
    }

    setIsLoading(true);

    if (text.startsWith("/")) {
      await handleCommand(text);
      setIsLoading(false);
      return;
    }

    try {
      setCurrentModel(config.model);
      const attachmentNote = attachments?.length
        ? `\n\n[User attached ${attachments.length} file(s): ${attachments.map((a) => a.name).join(", ")}]`
        : "";
      const result = await llmClient.chat(text + attachmentNote);
      const aiMsg = mkAssistantMsg(result.content);
      setMessages((prev) => {
        const next = [...prev, aiMsg];
        autoSaveChat(next);
        return next;
      });
    } catch (err) {
      addMsg(
        mkAssistantMsg(
          `**Error:** ${err instanceof Error ? err.message : "Failed to get response"}\n\nCheck your API key and provider in Settings.`,
          "[ERR]",
        ),
      );
    } finally {
      setIsLoading(false);
      setCurrentModel("");
    }
  };

  const handleCommand = async (cmd: string) => {
    const parts = cmd.split(" ");
    const name = parts[0].toLowerCase();
    let response = "";
    let tag = "[MAF]";

    const askLLM = async (prompt: string, agentId: string) => {
      const agent = DEFAULT_AGENTS.find((a) => a.id === agentId) || DEFAULT_AGENTS[0];
      try {
        const r = await llmClient.chat(`As ${agent.name} (${agent.title}, ${agent.tag}): ${prompt}`);
        return { content: r.content, tag: agent.tag };
      } catch (e) {
        return {
          content: `**Error:** ${e instanceof Error ? e.message : "Failed"}`,
          tag: "[ERR]",
        };
      }
    };

    switch (name) {
      case "/help":
        response = `**Intelligence Command Reference**
        
• \`/summary\` — Execute full business health check (Sana [DAT])
• \`/metrics\` — Pulse check on live KPIs
• \`/agents\` — Review your 11 specialized agents
• \`/analyze <topic>\` — Deep analysis (revenue, churn, ops...)
• \`/predict <topic>\` — Forecasting and trends
• \`/create <item>\` — Generate campaigns, code, plans
• \`/research <topic>\` — Market and competitor intelligence
• \`/ask <agent> <msg>\` — Direct message to a specific agent
• \`/boss\` — Executive oversight dashboard
• \`/clear\` — Start a fresh intelligence session
• \`/config\` — Open provider settings`;
        break;

      case "/agents":
        response = `### Your Intelligence Squad\n\n` + DEFAULT_AGENTS.map((a) => `• **${a.name}** ${a.tag} — ${a.title}`).join("\n");
        break;

      case "/analyze": {
        const topic = parts[1]?.toLowerCase();
        const agentId = ANALYZE_MAP[topic || ""] || "sana";
        const r = await askLLM(`Analyze this: ${parts.slice(1).join(" ") || "general business performance"}`, agentId);
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/predict": {
        const topic = parts[1]?.toLowerCase();
        const agentId = PREDICT_MAP[topic || ""] || "sana";
        const r = await askLLM(`Predict/Forecast: ${parts.slice(1).join(" ") || "next quarter performance"}`, agentId);
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/create": {
        const topic = parts[1]?.toLowerCase();
        const agentId = CREATE_MAP[topic || ""] || "omar";
        const r = await askLLM(`Create/Generate: ${parts.slice(1).join(" ") || "a business report"}`, agentId);
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/research": {
        const r = await askLLM(`Research: ${parts.slice(1).join(" ") || "current market trends"}`, "sana");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/ask": {
        const target = parts[1]?.toLowerCase();
        const agent = DEFAULT_AGENTS.find(a => a.id === target || a.name.toLowerCase() === target || a.tag.toLowerCase().includes(target || ""));
        if (!agent) {
          response = "Agent not found. Use `/agents` to see available squad members.";
          break;
        }
        const r = await askLLM(parts.slice(2).join(" "), agent.id);
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/design": {
        const r = await askLLM(`Design brief: ${parts.slice(1).join(" ")}`, "nala");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/automate": {
        const r = await askLLM(`Automation workflow: ${parts.slice(1).join(" ")}`, "kofi");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/scrape":
      case "/search": {
        const r = await askLLM(`Execute web operation: ${cmd}`, "ravi");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/connect":
      case "/connections": {
        const r = await askLLM(`Manage ecosystem connections: ${cmd}`, "omar");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/rooms":
        response = "**Agent Room Assignments:**\n\n" + DEFAULT_AGENTS.map((a) => `• **${a.name}** ${a.tag} — ${a.room}`).join("\n");
        break;

      case "/boss": {
        const r = await askLLM(
          "Provide an executive boss-view summary: cross-department risk flags, top 3 priorities, and current operational health across all departments. Be direct and concise.",
          "malik"
        );
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/summary": {
        const r = await askLLM("Give a full business health check across all departments.", "sana");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/metrics": {
        const r = await askLLM("Generate a live KPI dashboard summary with current performance metrics.", "sana");
        response = r.content;
        tag = r.tag;
        refreshMetrics();
        break;
      }

      case "/clear":
        handleNewChat();
        return;

      case "/config":
        setShowSetup(true);
        return;

      default:
        response = `Unknown command: \`${name}\`\n\nType \`/help\` to see the full intelligence command set.`;
    }

    addMsg({
      id: `${Date.now()}`,
      role: "assistant",
      content: response,
      agentTag: tag,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  return (
    <div dir={config.language === "ar" ? "rtl" : "ltr"} className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        agents={DEFAULT_AGENTS}
        status={status}
        userEmail={userEmail}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        kpiData={kpiData}
        alerts={sidebarAlerts}
        loadingMetrics={loadingMetrics}
        language={config.language}
        activeView={activeView}
        onViewChange={setActiveView}
        onAgentClick={(id) => {
          const a = DEFAULT_AGENTS.find((a) => a.id === id);
          if (a) {
            setActiveView("chat");
            addMsg(mkAssistantMsg(`### ${a.tag} ${a.name}\n\n${a.description}`, a.tag));
          }
        }}
        onKpiClick={(cmd) => handleSendMessage(cmd)}
        onSettingsClick={() => setShowSetup(true)}
        onPrivacyClick={() => setShowPrivacy(true)}
        onCommandPaletteOpen={() => setShowCmdPalette(true)}
        onQuickAction={(action) => {
          const map: Record<string, string> = {
            summary: "/summary",
            metrics: "/metrics",
            create: "/create campaign",
            research: "/research trends",
          };
          handleSendMessage(map[action]);
        }}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        onRefreshMetrics={refreshMetrics}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        <div className={cn("flex-1 h-full flex flex-col", activeView !== "overview" && "hidden")}>
          <PlatformOverview 
            language={config.language}
            kpiData={kpiData}
            recentFiles={recentFiles}
            onNavigateToFiles={() => setActiveView("files")}
            onNavigateToChat={() => setActiveView("chat")}
          />
        </div>

        <div className={cn("flex-1 h-full flex flex-col", activeView !== "chat" && "hidden")}>
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            currentModel={currentModel}
            userId={userId}
            pendingInput={pendingInput}
            language={config.language}
            onSendMessage={handleSendMessage}
            onCommandPaletteOpen={() => setShowCmdPalette(true)}
            onPendingInputConsumed={() => setPendingInput("")}
          />
        </div>

        <div className={cn("flex-1 h-full flex flex-col", activeView !== "files" && "hidden")}>
          <FilesView language={config.language} files={recentFiles} />
        </div>
      </main>

      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        language={config.language}
        onSelect={(cmd, needsArgs) => {
          setShowCmdPalette(false);
          if (needsArgs) {
            setPendingInput(cmd);
            setActiveView("chat");
          } else {
            handleSendMessage(cmd);
          }
        }}
      />

      <SetupWizard
        open={showSetup}
        config={config}
        language={config.language}
        onSave={saveConfigAndConnect}
        onClose={() => setShowSetup(false)}
      />

      <PrivacyModal open={showPrivacy} language={config.language} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}


