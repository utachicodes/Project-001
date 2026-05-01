"use client";
import * as React from "react";
import { ChevronDown, Check, ExternalLink, Sparkles, Crown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
  contextLength: string;
  strengths: string[];
}

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  requiresApiKey: boolean;
  freeModels: ModelInfo[];
  paidModels: ModelInfo[];
}

export const ALL_PROVIDERS: ProviderInfo[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Universal AI gateway — access 100+ models through one API",
    logo: "OR",
    website: "https://openrouter.ai",
    requiresApiKey: true,
    freeModels: [
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", description: "Fast multimodal model", isFree: true, contextLength: "1M tokens", strengths: ["Speed", "Multimodal"] },
      { id: "google/gemini-2.5-pro-exp-03-25:free", name: "Gemini 2.5 Pro", description: "Advanced reasoning", isFree: true, contextLength: "1M tokens", strengths: ["Coding", "Reasoning"] },
      { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", description: "Advanced multilingual LLM", isFree: true, contextLength: "128K tokens", strengths: ["Multilingual", "Reasoning"] },
      { id: "meta-llama/llama-3.2-11b-vision-instruct:free", name: "Llama 3.2 11B", description: "Open-source with vision", isFree: true, contextLength: "128K tokens", strengths: ["Vision", "Open source"] },
      { id: "deepseek/deepseek-chat:free", name: "DeepSeek Chat", description: "Great for coding", isFree: true, contextLength: "64K tokens", strengths: ["Coding", "Technical"] },
    ],
    paidModels: [
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", description: "Complex reasoning", isFree: false, contextLength: "200K tokens", strengths: ["Reasoning", "Analysis"] },
      { id: "openai/gpt-4o", name: "GPT-4o", description: "Flagship multimodal", isFree: false, contextLength: "128K tokens", strengths: ["General", "Vision"] },
    ],
  },
  {
    id: "google",
    name: "Google AI Studio",
    description: "Direct Gemini access with generous free tier",
    logo: "G",
    website: "https://aistudio.google.com",
    requiresApiKey: true,
    freeModels: [
      { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", description: "Fast multimodal", isFree: true, contextLength: "1M tokens", strengths: ["Speed", "Free tier"] },
      { id: "gemini-2.5-pro-exp-03-25", name: "Gemini 2.5 Pro", description: "Advanced reasoning", isFree: true, contextLength: "1M tokens", strengths: ["Reasoning", "Coding"] },
    ],
    paidModels: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Production-ready", isFree: false, contextLength: "2M tokens", strengths: ["Production", "Enterprise"] },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Direct API access to GPT models",
    logo: "OAI",
    website: "https://platform.openai.com",
    requiresApiKey: true,
    freeModels: [],
    paidModels: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable multimodal", isFree: false, contextLength: "128K tokens", strengths: ["General", "Vision"] },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and cheap", isFree: false, contextLength: "128K tokens", strengths: ["Speed", "Cost"] },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Direct API access to Claude models",
    logo: "ANT",
    website: "https://console.anthropic.com",
    requiresApiKey: true,
    freeModels: [],
    paidModels: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Best balance", isFree: false, contextLength: "200K tokens", strengths: ["Reasoning", "Analysis"] },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most powerful Claude", isFree: false, contextLength: "200K tokens", strengths: ["Complex", "Research"] },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    description: "Run AI models on your own machine — free, private",
    logo: "🦙",
    website: "https://ollama.com",
    requiresApiKey: false,
    freeModels: [
      { id: "llama3.1", name: "Llama 3.1 8B", description: "Best general-purpose local", isFree: true, contextLength: "128K tokens", strengths: ["General", "Fast"] },
      { id: "mistral", name: "Mistral 7B", description: "Fast and efficient", isFree: true, contextLength: "32K tokens", strengths: ["Speed"] },
      { id: "deepseek-coder-v2", name: "DeepSeek Coder V2", description: "Best for code generation", isFree: true, contextLength: "128K tokens", strengths: ["Coding"] },
    ],
    paidModels: [],
  },
  {
    id: "custom",
    name: "Custom Endpoint",
    description: "Connect to any OpenAI-compatible API",
    logo: "API",
    website: "",
    requiresApiKey: false,
    freeModels: [],
    paidModels: [],
  },
];

interface ProviderSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  apiKey: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (key: string) => void;
}

export function ProviderSelector({
  selectedProvider,
  selectedModel,
  apiKey,
  onProviderChange,
  onModelChange,
  onApiKeyChange,
}: ProviderSelectorProps) {
  const [expandedProvider, setExpandedProvider] = React.useState<string | null>(selectedProvider);
  const [showFreeOnly, setShowFreeOnly] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = ALL_PROVIDERS.filter((p) => {
    if (!searchQuery) return true;
    return [...p.freeModels, ...p.paidModels].some(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search models…"
          className="w-full bg-secondary border border-border rounded-md pl-9 pr-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="flex items-center gap-1 p-1 bg-secondary rounded-md border border-border">
        <button
          onClick={() => setShowFreeOnly(true)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors",
            showFreeOnly
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="size-3" />
          Free Models
        </button>
        <button
          onClick={() => setShowFreeOnly(false)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors",
            !showFreeOnly
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Crown className="size-3" />
          All Models
        </button>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {filtered.map((provider) => {
          const isExpanded = expandedProvider === provider.id;
          const modelsToShow = showFreeOnly
            ? provider.freeModels
            : [...provider.freeModels, ...provider.paidModels];
          if (showFreeOnly && modelsToShow.length === 0 && !provider.requiresApiKey) return null;

          return (
            <div
              key={provider.id}
              className={cn(
                "rounded-xl border overflow-hidden transition-colors",
                isExpanded ? "border-primary/30 bg-card" : "border-border bg-secondary/40 hover:border-border",
              )}
            >
              <button
                onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className="size-9 rounded-md flex items-center justify-center bg-primary/10 border border-primary/20 text-[12px] font-bold text-primary">
                  {provider.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13.5px] text-foreground">{provider.name}</span>
                    {provider.freeModels.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9.5px] font-bold border border-emerald-500/25">
                        {provider.freeModels.length} FREE
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground truncate">{provider.description}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {provider.requiresApiKey && (
                    <div className="p-3 border-b border-border bg-secondary/40">
                      <label className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-2">
                        API Key for {provider.name}
                        {provider.website && (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Get key <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        placeholder={`Enter ${provider.name} API key`}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                  )}

                  <div className="p-2 space-y-1">
                    {modelsToShow.map((model) => {
                      const isSelected =
                        selectedProvider === provider.id && selectedModel === model.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => {
                            onProviderChange(provider.id);
                            onModelChange(model.id);
                          }}
                          className={cn(
                            "w-full flex items-start gap-3 p-2.5 rounded-md text-left transition-colors border",
                            isSelected
                              ? "bg-primary/10 border-primary/30"
                              : "border-transparent hover:bg-accent",
                          )}
                        >
                          <div className="mt-0.5">
                            {isSelected ? (
                              <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="size-3 text-primary-foreground" />
                              </div>
                            ) : (
                              <div className="size-5 rounded-full border-2 border-border" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[13px] text-foreground">
                                {model.name}
                              </span>
                              {model.isFree && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9.5px] font-bold">
                                  FREE
                                </span>
                              )}
                            </div>
                            <p className="text-[11.5px] text-muted-foreground mt-0.5">
                              {model.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {model.strengths.map((s) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[9.5px] font-medium border border-border"
                                >
                                  {s}
                                </span>
                              ))}
                              <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[9.5px] border border-border">
                                {model.contextLength}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {modelsToShow.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-[12px]">
                        No {showFreeOnly ? "free " : ""}models available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
