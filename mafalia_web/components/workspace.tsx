"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
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
import { addConnection, getConnections } from "@/lib/supabase/data";
import type { UploadedFile } from "@/lib/supabase/storage";

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

const welcomeMsg = (hasKey: boolean): Message =>
  mkAssistantMsg(
    hasKey
      ? ""
      : `**Welcome to Mafalia Intelligence.**\n\nConfigure an AI provider to get started. Click **Settings** in the sidebar or type \`/config\`.\n\n• **OpenRouter** — Free tier at openrouter.ai\n• **Google Gemini** — Free API at aistudio.google.com\n• **Ollama** — Run locally, no API key needed`,
  );

export function Workspace({ userId, userEmail }: WorkspaceProps) {
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
  const [chatHistory, setChatHistory] = React.useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = React.useState("");

  // Live sidebar metrics state
  const [kpiData, setKpiData] = React.useState<KpiData | null>(null);
  const [sidebarAlerts, setSidebarAlerts] = React.useState<AlertItem[]>([]);
  const [loadingMetrics, setLoadingMetrics] = React.useState(false);

  const initRef = React.useRef(false);

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
    if (saved?.apiKey || saved?.provider === "ollama") {
      setConfig(saved);
      llmClient.setConfig(saved);
      setStatus(`Connected: ${saved.provider}`);
      refreshMetrics();
    } else {
      setShowSetup(true);
    }
    setChatHistory(loadChatHistory());
  }, [refreshMetrics]);

  React.useEffect(() => {
    if (!currentChatId) setMessages([welcomeMsg(!!config?.apiKey || config?.provider === "ollama")]);
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
    setMessages([welcomeMsg(!!config?.apiKey || config?.provider === "ollama")]);
  };

  const handleLoadChat = (id: string) => {
    const c = chatHistory.find((c) => c.id === id);
    if (c) {
      setCurrentChatId(id);
      setMessages(c.messages);
    }
  };

  const handleDeleteChat = (id: string) => {
    const updated = chatHistory.filter((c) => c.id !== id);
    setChatHistory(updated);
    saveChatHistory(updated);
    if (currentChatId === id) {
      setCurrentChatId("");
      setMessages([welcomeMsg(!!config?.apiKey)]);
    }
  };

  const saveConfigAndConnect = (cfg: Config) => {
    persistConfig(cfg);
    setConfig(cfg);
    llmClient.setConfig(cfg);
    setStatus(`Connected: ${cfg.provider}`);
    setShowSetup(false);
    addMsg(
      mkAssistantMsg(
        `**Configuration saved.**\n\n• **Provider:** ${cfg.provider}\n• **Model:** ${cfg.model}`,
      ),
    );
    toast.success(`Connected to ${cfg.provider}`);
    // Fetch live metrics now that we have a working connection
    refreshMetrics();
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

    const userMsg: Message = {
      id: `${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      attachments: attachments?.map((a) => ({ name: a.name, url: a.url, size: a.size })),
    };
    setMessages((prev) => [...prev, userMsg]);

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
      const strategy = llmClient.selectModelStrategy(text);
      setCurrentModel(llmClient.getOptimalModel(strategy));
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
        response = `**Available Commands**

### Business Intelligence
• \`/summary\` — Full business health check
• \`/metrics\` — Live KPI dashboard
• \`/agents\` — List all 11 agents
• \`/ask <agent> <question>\` — Ask a specific agent

### Actions
• \`/analyze <domain>\` — Deep analysis
• \`/predict <target>\` — Forecast
• \`/create <type>\` — Generate content
• \`/design <type>\` — Creative brief
• \`/automate <workflow>\` — Build automation
• \`/research <topic>\` — Market intelligence

### Web & Data
• \`/scrape <url>\` — Scrape a webpage
• \`/search <query>\` — Web search
• \`/connect <name> | <company> | <role>\` — Save a connection
• \`/connections\` — View saved connections

### General
• \`/config\` — Settings
• \`/clear\` — Clear chat
• \`/rooms\` — Agent room assignments`;
        break;

      case "/agents":
        response = DEFAULT_AGENTS.map((a) => `${a.tag} **${a.name}** — ${a.title}`).join("\n");
        break;

      case "/rooms":
        response =
          "**Agent Rooms:**\n\n" +
          DEFAULT_AGENTS.map((a) => `• **${a.name}** ${a.tag} — ${a.room}`).join("\n");
        break;

      case "/boss":
        response =
          "**Boss View** — high-level oversight across all 11 agents. Use `/summary` for a full health check or `/rooms` to see agent assignments.";
        break;

      case "/summary": {
        const r = await askLLM(
          "Give a full business health check across revenue, operations, customers, inventory, marketing, and finance. Use clear sections and bullets.",
          "sana",
        );
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/metrics": {
        const r = await askLLM(
          "Render a live KPI dashboard summary: revenue total + transactions + avg order, customer count + active, total orders, inventory critical items, and finance health rating. Use markdown sections.",
          "sana",
        );
        response = r.content;
        tag = r.tag;
        // Also refresh sidebar KPI cards after a /metrics command
        refreshMetrics();
        break;
      }

      case "/analyze": {
        const target = parts.slice(1).join(" ") || "business";
        const agentId = ANALYZE_MAP[target.toLowerCase()] || "sana";
        const r = await askLLM(
          `Analyze ${target} in detail with metrics, risks, and recommendations.`,
          agentId,
        );
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/predict": {
        const target = parts.slice(1).join(" ") || "revenue";
        const agentId = PREDICT_MAP[target.toLowerCase()] || "sana";
        const r = await askLLM(
          `Forecast future ${target} for the next 30/90 days. Be specific about assumptions and confidence.`,
          agentId,
        );
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/create": {
        const target = parts.slice(1).join(" ");
        if (!target) {
          response =
            "Usage: `/create <type>`\n\nTypes: campaign, code, experiment, business-plan, pitch-deck, report, sop";
          break;
        }
        const agentKey = Object.keys(CREATE_MAP).find((k) =>
          target.toLowerCase().startsWith(k),
        );
        const r = await askLLM(`Create a detailed ${target}.`, agentKey ? CREATE_MAP[agentKey] : "omar");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/design": {
        const target = parts.slice(1).join(" ");
        if (!target) {
          response = "Usage: `/design <type>`\n\nTypes: social post, flyer, ad, logo concept, banner";
          break;
        }
        const r = await askLLM(`Design a ${target} with a detailed creative brief.`, "nala");
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/automate": {
        const target = parts.slice(1).join(" ");
        if (!target) {
          response = "Usage: `/automate <workflow>`";
          break;
        }
        const r = await askLLM(
          `Design an automation workflow for ${target}. Include triggers, steps, and rollback.`,
          "ravi",
        );
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/research": {
        const target = parts.slice(1).join(" ");
        if (!target) {
          response = "Usage: `/research <topic>`";
          break;
        }
        const r = await askLLM(
          `Research ${target} with data-driven insights, trends, and competitor signals.`,
          "sana",
        );
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/ask": {
        if (parts.length < 3) {
          response = "Usage: `/ask <agent_id> <question>` — e.g. `/ask zara top products`";
          break;
        }
        const agentId = parts[1].toLowerCase();
        const r = await askLLM(parts.slice(2).join(" "), agentId);
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/scrape": {
        const url = parts.slice(1).join(" ");
        if (!url) {
          response = "Usage: `/scrape <url>`";
          break;
        }
        response = `**Scraping is not available in the web version.**\n\nThe desktop edition can scrape pages directly. For the web app, paste the URL contents into chat or upload a file via the paperclip.`;
        tag = "[TEC]";
        break;
      }

      case "/search": {
        const q = parts.slice(1).join(" ");
        if (!q) {
          response = "Usage: `/search <query>`";
          break;
        }
        const r = await askLLM(
          `Summarize what is publicly known about: ${q}. Note that real-time web search is not connected — be explicit about what you know up to your training cutoff.`,
          "sana",
        );
        response = r.content;
        tag = r.tag;
        break;
      }

      case "/connect": {
        const args = parts
          .slice(1)
          .join(" ")
          .split("|")
          .map((s) => s.trim());
        if (!args[0]) {
          response = "Usage: `/connect <name> | <company> | <role>`";
          break;
        }
        try {
          await addConnection({
            name: args[0],
            company: args[1] || "",
            role: args[2] || "",
            source: "chat",
            user_id: userId,
          });
          response = `**Connection saved:** ${args[0]}${args[2] ? ` — ${args[2]}` : ""}${args[1] ? ` at ${args[1]}` : ""}`;
        } catch (e) {
          response = `**Error:** ${e instanceof Error ? e.message : "Failed"}`;
        }
        tag = "[PAR]";
        break;
      }

      case "/connections": {
        try {
          const conns = await getConnections();
          response =
            conns.length === 0
              ? "**No connections yet.** Use `/connect <name> | <company> | <role>` to save one."
              : `**Connections (${conns.length}):**\n\n` +
                conns
                  .map(
                    (c) =>
                      `• **${c.name}**${c.role ? ` — ${c.role}` : ""}${c.company ? ` at ${c.company}` : ""}`,
                  )
                  .join("\n");
        } catch (e) {
          response = `**Error:** ${e instanceof Error ? e.message : "Failed"}`;
        }
        tag = "[PAR]";
        break;
      }

      case "/clear":
        handleNewChat();
        return;
      case "/config":
        setShowSetup(true);
        return;
      default:
        response = `Unknown command: \`${name}\`\n\nType \`/help\` to see all commands.`;
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
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        agents={DEFAULT_AGENTS}
        status={status}
        userEmail={userEmail}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        kpiData={kpiData}
        alerts={sidebarAlerts}
        loadingMetrics={loadingMetrics}
        onAgentClick={(id) => {
          const a = DEFAULT_AGENTS.find((a) => a.id === id);
          if (a)
            addMsg(
              mkAssistantMsg(
                `### ${a.tag} ${a.name} — ${a.title}\n\n${a.description}\n\n**Quick actions:**\n${(a.quickActions || []).map((q) => `• \`${q}\``).join("\n")}`,
                a.tag,
              ),
            );
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

      <ChatArea
        messages={messages}
        isLoading={isLoading}
        currentModel={currentModel}
        userId={userId}
        pendingInput={pendingInput}
        onSendMessage={handleSendMessage}
        onCommandPaletteOpen={() => setShowCmdPalette(true)}
        onPendingInputConsumed={() => setPendingInput("")}
      />

      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        onSelect={(cmd, needsArgs) => {
          setShowCmdPalette(false);
          if (needsArgs) setPendingInput(cmd);
          else handleSendMessage(cmd);
        }}
      />

      <SetupWizard
        open={showSetup}
        config={config}
        onSave={saveConfigAndConnect}
        onClose={() => setShowSetup(false)}
      />

      <PrivacyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}
