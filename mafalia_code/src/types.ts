// Type definitions for Mafalia Code

export interface Config {
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
  dataDir: string
  maxTokens: number
  temperature: number
}

export interface Agent {
  id: string
  name: string
  tag: string
  title: string
  color: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentTag?: string
  timestamp: string
}

export interface Provider {
  id: string
  name: string
  baseUrl: string
  models: string[]
}

export const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-pro-preview-06-05', 'gemini-2.0-flash', 'gemini-1.5-pro'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['anthropic/claude-sonnet-4-20250514', 'openai/gpt-4o', 'google/gemini-2.5-pro-preview-06-05'],
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    baseUrl: '',
    models: [],
  },
]

// Extend Window interface for Electron API
declare global {
  interface Window {
    electronAPI: {
      config: {
        load: () => Promise<Config | null>
        save: (config: Config) => Promise<boolean>
      }
    }
  }
}
