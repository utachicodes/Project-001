import type { Config } from "./types";
import { PROVIDERS } from "./types";

const MODEL_STRATEGIES = {
  simple: {
    models: ["google/gemini-2.0-flash-exp:free", "gemini-2.0-flash-exp", "gpt-4o-mini"],
    description: "Quick responses for simple questions",
  },
  analytics: {
    models: [
      "google/gemini-2.5-pro-exp-03-25:free",
      "gemini-2.5-pro-exp-03-25",
      "gpt-4o",
      "claude-sonnet-4-20250514",
    ],
    description: "Deep analysis for business data",
  },
  complex: {
    models: ["anthropic/claude-3.5-sonnet", "gpt-4o", "gemini-1.5-pro"],
    description: "Complex reasoning and strategy",
  },
  code: {
    models: ["deepseek/deepseek-chat:free", "gpt-4o", "claude-3-5-sonnet-20241022"],
    description: "Technical and code-related queries",
  },
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

  getOptimalModel(strategy: Strategy): string {
    if (!this.config) return "gpt-4o-mini";
    const strategyModels = MODEL_STRATEGIES[strategy].models as readonly string[];
    if (strategyModels.includes(this.config.model)) return this.config.model;

    const provider = PROVIDERS.find((p) => p.id === this.config!.provider);
    if (!provider) return this.config.model;

    if (this.config.provider === "openrouter") {
      const free = strategyModels.find((m) => m.includes(":free"));
      return free || strategyModels[0];
    }
    const availableMatch = strategyModels.find((m) =>
      provider.models.some((pm) => m.includes(pm) || pm.includes(m)),
    );

    if (availableMatch && this.config.provider !== "openrouter") {
      // Return the native ID that matched instead of the OpenRouter-formatted ID
      const native = provider.models.find((pm) => availableMatch.includes(pm) || pm.includes(availableMatch));
      return native || availableMatch;
    }

    return availableMatch || this.config.model;
  }

  async chat(message: string): Promise<{ content: string; modelUsed: string }> {
    if (!this.hasValidConfig()) throw new Error("API key not configured");

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
    const model = this.getOptimalModel(strategy);
    const systemPrompt = this.buildSystemPrompt(strategy);
    const content = await this.callProvider(this.config!.provider, model, systemPrompt, message);
    return { content, modelUsed: model };
  }

  private buildSystemPrompt(strategy: Strategy): string {
    return `You are Mafalia Intelligence, a sophisticated business orchestration platform.

You have access to 11 business agents:
- Zara [REV]: Revenue strategy, pricing, profit analysis
- Kofi [OPS]: Operations, efficiency, workflows
- Amara [CUS]: Customer insights, churn, loyalty
- Idris [INV]: Inventory, stock, waste management
- Nala [MKT]: Marketing campaigns, social media
- Tariq [FIN]: Finance, cash flow, health scores
- Sana [DAT]: Data science, forecasting, patterns
- Ravi [TEC]: Technology, APIs, data engineering
- Luna [GRO]: Growth hacking, funnels, experiments
- Omar [PAR]: Partnerships, suppliers, deals
- Malik [SEC]: Security reviews, compliance, access controls

Query type: ${MODEL_STRATEGIES[strategy].description}

Respond in clear, concise markdown. Use **bold** for emphasis, bullet lists, and headings.`;
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
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Mafalia Intelligence",
      },
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
    if (!res.ok) throw new Error(`OpenRouter API error: ${await res.text()}`);
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
