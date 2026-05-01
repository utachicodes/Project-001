export interface Config {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens: number;
  temperature: number;
}

export type AgentStatus = "idle" | "working" | "reporting" | "error" | "offline";

export interface Agent {
  id: string;
  name: string;
  tag: string;
  title: string;
  color: string;
  status?: AgentStatus;
  room?: string;
  description?: string;
  quickActions?: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentTag?: string;
  timestamp: string;
  attachments?: { name: string; url: string; size: number }[];
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
}

export const PROVIDERS: Provider[] = [
  {
    id: "openrouter",
    name: "OpenRouter (Recommended — Free Options)",
    baseUrl: "https://openrouter.ai/api/v1",
    models: [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.5-pro-exp-03-25:free",
      "z-ai/glm-4.5-air:free",
      "meta-llama/llama-3.2-11b-vision-instruct:free",
      "deepseek/deepseek-chat:free",
      "anthropic/claude-3.5-sonnet",
      "openai/gpt-4o-mini",
    ],
  },
  {
    id: "google",
    name: "Google (Gemini — Free Tier)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    models: ["gemini-2.0-flash-exp", "gemini-2.5-pro-exp-03-25", "gemini-1.5-flash", "gemini-1.5-pro"],
  },
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-preview", "o1-mini"],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    baseUrl: "https://api.anthropic.com/v1",
    models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-opus-20240229"],
  },
  {
    id: "ollama",
    name: "Ollama (Local — runs on your machine)",
    baseUrl: "http://localhost:11434/v1",
    models: ["llama3.1", "llama3.1:70b", "mistral", "mixtral", "qwen2.5", "deepseek-coder-v2", "phi3", "gemma2"],
  },
  {
    id: "custom",
    name: "Custom Endpoint",
    baseUrl: "",
    models: [],
  },
];
