import type { Config } from "./types";
import { PROVIDERS } from "./types";
import { LIMITS } from "./constants";

const isDev = process.env.NODE_ENV === 'development';

const MODEL_STRATEGIES = {
  simple: { description: "Quick responses for simple questions" },
  analytics: { description: "Deep analysis for business data" },
  complex: { description: "Complex reasoning and strategy" },
  code: { description: "Technical and code-related queries" },
} as const;

const QUERY_PATTERNS = {
  simple: /^(hello|hi|hey|what|who|when|where|how\s+are|thanks|ok|yes|no|goodbye)/i,
  analytics:
    /(revenue|profit|sales|inventory|stock|customer|metrics|analytics|data|report|kpi|dashboard|trend|growth|analysis)/i,
  code: /(code|programming|api|bug|error|fix|implement|function|script|technical|review)/i,
  complex: /(strategy|plan|optimize|recommend|advice|forecast|predict|model|algorithm)/i,
};

type Strategy = keyof typeof MODEL_STRATEGIES;

export class LLMClient {
  private config: Config | null = null;

  setConfig(config: Config) {
    this.config = config;
  }

  hasValidConfig(): boolean {
    if (!this.config) return false;
    if (this.config.provider === "ollama" || this.config.provider === "custom") {
      return !!this.config.provider && !!this.config.model;
    }
    return !!this.config.apiKey && !!this.config.provider && !!this.config.model;
  }

  getMissingConfigMessage(): string {
    return `**API Key Required**

You need to configure an AI provider before asking questions.

**Free Options:**
• **OpenRouter** — Free tier with Gemini, Llama, Qwen, DeepSeek
• **Google Gemini** — Free tier with generous limits

**How to get started:**
1. Get a free API key from [openrouter.ai](https://openrouter.ai) or [aistudio.google.com](https://aistudio.google.com)
2. Click **Settings** → enter your API key
3. Select a free model (marked with \`:free\`)

Type /config to open settings.`;
  }

  selectModelStrategy(query: string): Strategy {
    const q = query.toLowerCase();
    if (QUERY_PATTERNS.code.test(q)) return "code";
    if (QUERY_PATTERNS.analytics.test(q)) return "analytics";
    if (QUERY_PATTERNS.complex.test(q)) return "complex";
    if (QUERY_PATTERNS.simple.test(q)) return "simple";
    return "analytics";
  }

  /** Sends a message to the configured LLM provider and returns the response content and model used. */
  async chat(message: string): Promise<{ content: string; modelUsed: string }> {
    if (!this.hasValidConfig()) {
      const missing = [];
      if (!this.config?.provider) missing.push("Provider");
      if (!this.config?.model) missing.push("Model");
      if (this.config?.provider !== "ollama" && this.config?.provider !== "custom" && !this.config?.apiKey) {
        missing.push("API Key");
      }
      throw new Error(`Configuration incomplete. Missing: ${missing.join(", ")}`);
    }

    // Validation to help users with mismatched keys/providers
    const key = this.config!.apiKey;
    const provider = this.config!.provider;
    if (provider === "openrouter" && key.startsWith("AIza")) {
      throw new Error("You are using a Google Gemini API key with OpenRouter selected as the provider. Please go to Settings and change the Provider to 'Google (Gemini)'.");
    }
    if (provider === "google" && key.startsWith("sk-")) {
      throw new Error("You are using an OpenAI/OpenRouter API key with Google Gemini selected as the provider. Please go to Settings and change the Provider to 'OpenRouter' or 'OpenAI'.");
    }

    const strategy = this.selectModelStrategy(message);
    const model = this.config!.model; 
    
    // Fetch live context from Supabase
    const context = await this.fetchContext();
    const systemPrompt = `${this.buildSystemPrompt(strategy)}\n\nBUSINESS DATA CONTEXT:\n${context}`;
    
    const content = await this.callProvider(provider, model, systemPrompt, message);
    return { content, modelUsed: model };
  }

  private async fetchContext(): Promise<string> {
    try {
      const { getConnections, getScrapedPages, tryFetchTable, BUSINESS_TABLES } = await import("./supabase/data");

      const sections: string[] = [];

      // 1. Contacts / Connections
      const connections = await getConnections(30);
      if (connections.length > 0) {
        sections.push(
          "CONTACTS/CONNECTIONS:\n" +
          connections.map(c =>
            `  - ${c.name}${c.company ? ` @ ${c.company}` : ""}${c.role ? ` (${c.role})` : ""}${c.email ? ` <${c.email}>` : ""}${c.source ? ` [${c.source}]` : ""}${c.notes ? ` | Notes: ${c.notes}` : ""}`
          ).join("\n")
        );
      }

      // 2. Scraped pages / market intelligence
      const pages = await getScrapedPages(10);
      if (pages.length > 0) {
        sections.push(
          "SCRAPED MARKET INTELLIGENCE:\n" +
          pages.map(p =>
            `  - [${p.title || p.url}] ${p.content ? p.content.slice(0, LIMITS.CONTENT_PREVIEW).replace(/\s+/g, " ") + "…" : "(no content)"}`
          ).join("\n")
        );
      }

      // 3. Probe known business tables and include any that have data
      const tableResults = await Promise.all(
        BUSINESS_TABLES.map(async (table) => {
          const rows = await tryFetchTable(table, 20);
          return rows.length > 0 ? { table, rows } : null;
        })
      );
      for (const result of tableResults) {
        if (!result) continue;
        const { table, rows } = result;
        const preview = rows.slice(0, LIMITS.ROWS_PREVIEW).map(r => {
          const fields = Object.entries(r)
            .filter(([k]) => !["id", "user_id", "created_at", "updated_at"].includes(k))
            .map(([k, v]) => `${k}: ${String(v).slice(0, LIMITS.FIELD_VALUE)}`)
            .join(" | ");
          return `  - ${fields}`;
        }).join("\n");
        sections.push(`${table.toUpperCase()} (${rows.length} records):\n${preview}${rows.length > 10 ? `\n  … and ${rows.length - 10} more` : ""}`);
      }

      if (sections.length === 0) {
        return "Database is connected but no business data found yet. The user has not added any records.";
      }

      return sections.join("\n\n");
    } catch (err: any) {
      if (isDev) console.warn("fetchContext error:", err);
      return "Unable to retrieve database context at this moment.";
    }
  }

  private buildSystemPrompt(strategy: Strategy): string {
    const langName = { en: "English", fr: "French", ar: "Arabic" }[this.config?.language || "en"];
    const now = new Date().toUTCString();
    return `You are Mafalia Intelligence, a conversational yet professional business orchestration platform.
Current Time: ${now}

STRICT RESPONSE RULES:
1. NO EMOJIS.
2. NO "AI slop" - avoid flowery language, polite fillers, or generic AI introductions.
3. NO DASHES - use numbered lists or bold headers for structure.
4. BE CONVERSATIONAL - act as a sophisticated partner, engage with the user's queries directly.
5. BE DIRECT - provide high-impact, data-driven responses.
6. Respond in concise markdown using **bold** for emphasis.
7. Respond ONLY in ${langName}.

Orchestration context: ${MODEL_STRATEGIES[strategy].description}`;
  }

  private async callProvider(
    provider: string,
    model: string,
    systemPrompt: string,
    message: string,
  ): Promise<string> {
    const apiKey = this.config!.apiKey;
    const baseUrl =
      this.config!.baseUrl || PROVIDERS.find((p) => p.id === provider)?.baseUrl;

    switch (provider) {
      case "openai":
        return this.callOpenAI(baseUrl!, apiKey, model, systemPrompt, message);
      case "anthropic":
        return this.callAnthropic(baseUrl!, apiKey, model, systemPrompt, message);
      case "google":
        return this.callGoogle(apiKey, model, systemPrompt, message);
      case "openrouter":
        return this.callOpenRouter(apiKey, model, systemPrompt, message);
      case "ollama":
        return this.callOllama(model, systemPrompt, message);
      case "custom": {
        const url = this.config!.baseUrl || baseUrl;
        if (!url) throw new Error("Custom endpoint requires a base URL.");
        return this.callOpenAI(url, apiKey || "no-key", model, systemPrompt, message);
      }
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async callOpenAI(
    baseUrl: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    message: string,
  ) {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: this.config!.temperature,
        max_tokens: this.config!.maxTokens,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${await res.text()}`);
    const data = await res.json();
    return data.choices[0].message.content as string;
  }

  private async callAnthropic(
    baseUrl: string,
    apiKey: string,
    model: string,
    systemPrompt: string,
    message: string,
  ) {
    const res = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: this.config!.maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${await res.text()}`);
    const data = await res.json();
    return data.content[0].text as string;
  }

  private async callGoogle(apiKey: string, model: string, systemPrompt: string, message: string) {
    const modelName = model.startsWith("models/") ? model : `models/${model}`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
          generationConfig: {
            temperature: this.config!.temperature,
            maxOutputTokens: this.config!.maxTokens,
          },
        }),
      },
    );
    if (!res.ok) throw new Error(`Google API error: ${await res.text()}`);
    const data = await res.json();
    return data.candidates[0].content.parts[0].text as string;
  }

  private async callOpenRouter(apiKey: string, model: string, systemPrompt: string, message: string) {
    const referer =
      typeof window !== "undefined" ? window.location.origin : "https://mafalia.ai";
    
    const fetchWithModel = async (targetModel: string) => {
      return fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": referer,
          "X-Title": "Mafalia Intelligence",
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: this.config!.temperature,
          max_tokens: this.config!.maxTokens,
        }),
      });
    };

    let res = await fetchWithModel(model);
    let responseText = "";

    // If rate limited, try a fallback free model
    if (res.status === 429) {
      responseText = await res.text();
      const isFreeModel = model.endsWith(":free") || model.includes("owl-alpha") || responseText.toLowerCase().includes("rate-limited");
      
      if (isFreeModel) {
        const fallbackModel = "google/gemini-2.0-flash-exp:free";
        if (model !== fallbackModel) {
          if (isDev) console.warn(`Model ${model} rate limited, falling back to ${fallbackModel}`);
          res = await fetchWithModel(fallbackModel);
          if (!res.ok) responseText = await res.text();
        }
      }
    }

    if (!res.ok) {
      const errorMsg = responseText || await res.text();
      throw new Error(`OpenRouter API error: ${errorMsg}`);
    }
    
    const data = await res.json();
    return data.choices[0].message.content as string;
  }

  private async callOllama(model: string, systemPrompt: string, message: string) {
    const baseUrl = this.config!.baseUrl || "http://localhost:11434/v1";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: this.config!.temperature,
        max_tokens: this.config!.maxTokens,
        stream: false,
      }),
    });
    if (!res.ok)
      throw new Error(
        `Ollama error: ${await res.text()}\n\nMake sure Ollama is running locally: ollama serve`,
      );
    const data = await res.json();
    return data.choices[0].message.content as string;
  }
}

export const llmClient = new LLMClient();
export default llmClient;
