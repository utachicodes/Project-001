import { Config, PROVIDERS } from './types'
import ELECTRON_API from './api'

// Model selection strategies based on query type
const MODEL_STRATEGIES = {
  // Simple queries - use free/fast models
  simple: {
    models: [
      'google/gemini-2.0-flash-exp:free',
      'gemini-2.0-flash-exp',
      'gpt-4o-mini',
    ],
    description: 'Quick responses for simple questions',
  },
  // Analytics queries - use models good at data analysis
  analytics: {
    models: [
      'google/gemini-2.5-pro-exp-03-25:free',
      'gemini-2.5-pro-exp-03-25',
      'gpt-4o',
      'claude-sonnet-4-20250514',
    ],
    description: 'Deep analysis for business data',
  },
  // Complex reasoning - use best available models
  complex: {
    models: [
      'anthropic/claude-3.5-sonnet',
      'gpt-4o',
      'gemini-1.5-pro',
    ],
    description: 'Complex reasoning and strategy',
  },
  // Code/technical - use code-capable models
  code: {
    models: [
      'deepseek/deepseek-chat:free',
      'gpt-4o',
      'claude-3-5-sonnet-20241022',
    ],
    description: 'Technical and code-related queries',
  },
}

// Keywords to determine query type
const QUERY_PATTERNS = {
  simple: /^(hello|hi|hey|what|who|when|where|how\s+are|thanks|ok|yes|no|goodbye)/i,
  analytics: /(revenue|profit|sales|inventory|stock|customer|metrics|analytics|data|report|kpi|dashboard|trend|growth|analysis)/i,
  code: /(code|programming|api|bug|error|fix|implement|function|script|technical|review)/i,
  complex: /(strategy|plan|optimize|recommend|advice|forecast|predict|model|algorithm)/i,
}

export class LLMClient {
  private config: Config | null = null

  setConfig(config: Config) {
    this.config = config
  }

  hasValidConfig(): boolean {
    if (!this.config) return false
    // Ollama and custom endpoints don't require API keys
    if (this.config.provider === 'ollama' || this.config.provider === 'custom') {
      return !!this.config.provider && !!this.config.model
    }
    return !!this.config.apiKey && !!this.config.provider && !!this.config.model
  }

  getMissingConfigMessage(): string {
    return `**API Key Required**

You need to configure an AI provider before asking questions.

**Free Options:**
• **OpenRouter** - Free tier with Gemini, Llama, Qwen, DeepSeek
• **Google Gemini** - Free tier with generous limits

**How to get started:**
1. Get a free API key from [openrouter.ai](https://openrouter.ai) or [aistudio.google.com](https://aistudio.google.com)
2. Click **Settings** → Enter your API key
3. Select a free model (marked with ":free")

Click /config to open settings.`
  }

  // Smart model selection based on query
  selectModelStrategy(query: string): keyof typeof MODEL_STRATEGIES {
    const lowerQuery = query.toLowerCase()
    
    if (QUERY_PATTERNS.code.test(lowerQuery)) return 'code'
    if (QUERY_PATTERNS.analytics.test(lowerQuery)) return 'analytics'
    if (QUERY_PATTERNS.complex.test(lowerQuery)) return 'complex'
    if (QUERY_PATTERNS.simple.test(lowerQuery)) return 'simple'
    
    // Default to analytics for business queries
    return 'analytics'
  }

  // Get the best available model for current config and strategy
  getOptimalModel(strategy: keyof typeof MODEL_STRATEGIES): string {
    if (!this.config) return 'gpt-4o-mini'
    
    const strategyModels = MODEL_STRATEGIES[strategy].models
    const currentModel = this.config.model
    
    // If current model is in strategy, use it
    if (strategyModels.includes(currentModel)) {
      return currentModel
    }
    
    // Otherwise, find first available model from strategy
    // that matches the provider type
    const provider = PROVIDERS.find(p => p.id === this.config!.provider)
    if (!provider) return currentModel
    
    // For OpenRouter, use the strategy model directly
    if (this.config.provider === 'openrouter') {
      const freeModel = strategyModels.find(m => m.includes(':free'))
      if (freeModel) return freeModel
      return strategyModels[0]
    }
    
    // For other providers, find intersection
    const available = strategyModels.find(m => 
      provider.models.some(pm => m.includes(pm) || pm.includes(m))
    )
    
    return available || currentModel
  }

  async chat(message: string): Promise<{ content: string; modelUsed: string; cost?: number }> {
    if (!this.hasValidConfig()) {
      throw new Error('API key not configured')
    }

    const strategy = this.selectModelStrategy(message)
    const model = this.getOptimalModel(strategy)
    const provider = this.config!.provider

    // First, try to get business data from Python bridge
    let businessContext = ''
    try {
      const result = await ELECTRON_API.orchestrate(message, 2)
      businessContext = this.formatBusinessContext(result)
    } catch (e) {
      // Bridge not available, continue without business data
    }

    // Build the system prompt with business context
    const systemPrompt = this.buildSystemPrompt(strategy, businessContext)

    // Route to appropriate provider
    const response = await this.callProvider(provider, model, systemPrompt, message)

    return {
      content: response,
      modelUsed: model,
    }
  }

  private buildSystemPrompt(strategy: keyof typeof MODEL_STRATEGIES, businessContext: string): string {
    const basePrompt = `You are Mafalia AI, a business operations assistant powered by specialized AI agents.

You have access to 10 business agents:
- Zara [REV]: Revenue strategy, pricing, profit analysis
- Kofi [OPS]: Operations, efficiency, workflows  
- Amara [CUS]: Customer insights, churn, loyalty
- Idris [INV]: Inventory, stock, waste management
- Nala [MKT]: Marketing campaigns, social media
- Tariq [FIN]: Finance, cash flow, health scores
- Sana [DAT]: Data science, forecasting, patterns
- Ravi [TEC]: Technology, APIs, security reviews
- Luna [GRO]: Growth hacking, funnels, experiments
- Omar [PAR]: Partnerships, suppliers, deals

Query type: ${MODEL_STRATEGIES[strategy].description}`

    if (businessContext) {
      return `${basePrompt}\n\nCurrent business data:\n${businessContext}\n\nUse this data to provide accurate, specific insights. If the data is incomplete, acknowledge this and provide general guidance.`
    }

    return basePrompt
  }

  private formatBusinessContext(result: any): string {
    if (!result.results || result.results.length === 0) return ''
    
    return result.results.map((r: any) => {
      const data = r.response
      if (typeof data === 'object') {
        return `${r.tag} ${r.agent}:\n${JSON.stringify(data, null, 2)}`
      }
      return `${r.tag} ${r.agent}: ${data}`
    }).join('\n\n')
  }

  private async callProvider(provider: string, model: string, systemPrompt: string, message: string): Promise<string> {
    const apiKey = this.config!.apiKey
    const baseUrl = this.config!.baseUrl || PROVIDERS.find(p => p.id === provider)?.baseUrl

    switch (provider) {
      case 'openai':
        return this.callOpenAI(baseUrl!, apiKey, model, systemPrompt, message)
      
      case 'anthropic':
        return this.callAnthropic(baseUrl!, apiKey, model, systemPrompt, message)
      
      case 'google':
        return this.callGoogle(apiKey, model, systemPrompt, message)
      
      case 'openrouter':
        return this.callOpenRouter(apiKey, model, systemPrompt, message)
      
      case 'ollama':
        return this.callOllama(model, systemPrompt, message)
      
      case 'custom': {
        const customUrl = this.config!.baseUrl || baseUrl
        if (!customUrl) throw new Error('Custom endpoint requires a base URL. Set it in Settings.')
        return this.callOpenAI(customUrl, apiKey || 'no-key', model, systemPrompt, message)
      }
      
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  private async callOpenAI(baseUrl: string, apiKey: string, model: string, systemPrompt: string, message: string): Promise<string> {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: this.config!.temperature,
        max_tokens: this.config!.maxTokens,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenAI API error: ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  }

  private async callAnthropic(baseUrl: string, apiKey: string, model: string, systemPrompt: string, message: string): Promise<string> {
    const res = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: this.config!.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic API error: ${err}`)
    }

    const data = await res.json()
    return data.content[0].text
  }

  private async callGoogle(apiKey: string, model: string, systemPrompt: string, message: string): Promise<string> {
    // Extract model name without 'models/' prefix
    const modelName = model.startsWith('models/') ? model : `models/${model}`
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }],
        }],
        generationConfig: {
          temperature: this.config!.temperature,
          maxOutputTokens: this.config!.maxTokens,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Google API error: ${err}`)
    }

    const data = await res.json()
    return data.candidates[0].content.parts[0].text
  }

  private async callOllama(model: string, systemPrompt: string, message: string): Promise<string> {
    const baseUrl = this.config?.baseUrl || 'http://localhost:11434/v1'
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: this.config!.temperature,
        max_tokens: this.config!.maxTokens,
        stream: false,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Ollama error: ${err}\n\nMake sure Ollama is running: ollama serve`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  }

  private async callOpenRouter(apiKey: string, model: string, systemPrompt: string, message: string): Promise<string> {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Mafalia Code',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: this.config!.temperature,
        max_tokens: this.config!.maxTokens,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter API error: ${err}`)
    }

    const data = await res.json()
    return data.choices[0].message.content
  }
}

// Singleton instance
export const llmClient = new LLMClient()
export default llmClient
