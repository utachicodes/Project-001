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

export type AgentStatus = 'idle' | 'working' | 'reporting' | 'error' | 'offline'

export interface AgentTask {
  id: string
  description: string
  status: 'queued' | 'running' | 'done' | 'failed'
  startedAt?: string
  completedAt?: string
  result?: string
}

export interface AgentCapability {
  id: string
  label: string
  command: string
  description: string
}

export interface AgentInsight {
  id: string
  title: string
  value: string
  trend?: 'up' | 'down' | 'stable'
  severity?: 'info' | 'warning' | 'critical' | 'success'
  timestamp: string
}

export interface Agent {
  id: string
  name: string
  tag: string
  title: string
  color: string
  status?: AgentStatus
  room?: string
  currentTask?: AgentTask
  taskHistory?: AgentTask[]
  lastActivity?: string
  description?: string
  capabilities?: AgentCapability[]
  insights?: AgentInsight[]
  quickActions?: string[]
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
    id: 'openrouter',
    name: 'OpenRouter (Recommended - Free Options)',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-2.5-pro-exp-03-25:free',
      'meta-llama/llama-3.2-11b-vision-instruct:free',
      'nvidia/llama-3.1-nemotron-70b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'deepseek/deepseek-chat:free',
      'mistralai/mistral-7b-instruct:free',
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o-mini',
    ],
  },
  {
    id: 'google',
    name: 'Google (Gemini - Free Tier)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      'gemini-2.0-flash-exp',
      'gemini-2.5-pro-exp-03-25',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ],
  },
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
    id: 'ollama',
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    models: ['llama3.1', 'llama3.1:70b', 'mistral', 'mixtral', 'qwen2.5', 'deepseek-coder-v2', 'phi3', 'gemma2'],
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    baseUrl: '',
    models: [],
  },
]

export interface ModelStrategy {
  id: string
  name: string
  description: string
  useCases: string[]
  complexity: 'low' | 'medium' | 'high'
  cost: 'free' | 'cheap' | 'standard'
}

// File system entry from readDir
export interface FileEntry {
  name: string
  isDirectory: boolean
  isFile: boolean
  path: string
  ext: string
  size: number
}

export interface DirResult {
  path: string
  entries: FileEntry[]
  error?: string
}

export interface FileResult {
  content?: string
  size?: number
  path?: string
  error?: string
}

export interface FileStat {
  size: number
  isFile: boolean
  isDirectory: boolean
  modified: string
  created: string
  error?: string
}

export interface SystemInfo {
  platform: string
  arch: string
  nodeVersion: string
  electronVersion: string
  homeDir: string
  desktopDir: string
  documentsDir: string
  downloadsDir: string
  tempDir: string
  hostname: string
  cpus: number
  totalMemory: number
  freeMemory: number
}

// Extend Window interface for Electron API
declare global {
  interface Window {
    electronAPI: {
      config: {
        load: () => Promise<Config | null>
        save: (config: Config) => Promise<boolean>
      }
      fs: {
        readDir: (dirPath: string) => Promise<DirResult>
        readFile: (filePath: string) => Promise<FileResult>
        writeFile: (filePath: string, content: string) => Promise<{ success?: boolean; error?: string }>
        exists: (targetPath: string) => Promise<boolean>
        stat: (targetPath: string) => Promise<FileStat>
        mkdir: (dirPath: string) => Promise<{ success?: boolean; error?: string }>
        delete: (targetPath: string) => Promise<{ success?: boolean; error?: string }>
        copy: (src: string, dest: string) => Promise<{ success?: boolean; error?: string }>
        move: (src: string, dest: string) => Promise<{ success?: boolean; error?: string }>
      }
      dialog: {
        openFile: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>
        openDirectory: () => Promise<string | null>
        saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>
      }
      shell: {
        openPath: (targetPath: string) => Promise<string>
        openExternal: (url: string) => Promise<boolean>
        showItemInFolder: (targetPath: string) => Promise<boolean>
      }
      system: {
        info: () => Promise<SystemInfo>
      }
      path: {
        join: (...segments: string[]) => Promise<string>
        resolve: (...segments: string[]) => Promise<string>
        dirname: (filePath: string) => Promise<string>
        basename: (filePath: string) => Promise<string>
        home: () => Promise<string>
      }
    }
  }
}
