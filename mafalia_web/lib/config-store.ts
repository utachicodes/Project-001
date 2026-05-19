import type { Config, ChatSession } from "./types";
import { STORAGE_KEYS } from './constants';

const CONFIG_KEY = STORAGE_KEYS.CONFIG;
const HISTORY_KEY = STORAGE_KEYS.CHAT_HISTORY;

export const DEFAULT_CONFIG: Config = {
  provider: "openrouter",
  apiKey: "",
  model: "", // No default model, user must choose
  baseUrl: "https://openrouter.ai/api/v1",
  maxTokens: 4096,
  temperature: 0.4,
  language: "en",
};

export function loadConfig(): Config | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? (JSON.parse(raw) as Config) : null;
  } catch {
    return null;
  }
}

export function saveConfig(config: Config) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    /* quota or disabled */
  }
}

export function loadChatHistory(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(history: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* quota or disabled */
  }
}
