import { useState } from 'react'
import { ChevronDown, Check, ExternalLink, Sparkles, Crown, Search } from 'lucide-react'

export interface ModelInfo {
  id: string
  name: string
  description: string
  isFree: boolean
  contextLength: string
  strengths: string[]
  provider: string
}

export interface ProviderInfo {
  id: string
  name: string
  description: string
  logo: string
  website: string
  requiresApiKey: boolean
  freeModels: ModelInfo[]
  paidModels: ModelInfo[]
  color: string
}

export const ALL_PROVIDERS: ProviderInfo[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Universal AI gateway - access 100+ models through one API',
    logo: 'OR',
    website: 'https://openrouter.ai',
    requiresApiKey: true,
    color: '#8b5cf6',
    freeModels: [
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', description: 'Fast multimodal model', isFree: true, contextLength: '1M tokens', strengths: ['Speed', 'Multimodal'], provider: 'google' },
      { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning', isFree: true, contextLength: '1M tokens', strengths: ['Coding', 'Reasoning'], provider: 'google' },
      { id: 'meta-llama/llama-3.2-11b-vision-instruct:free', name: 'Llama 3.2 11B', description: 'Open-source with vision', isFree: true, contextLength: '128K tokens', strengths: ['Vision', 'Open source'], provider: 'meta' },
      { id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', name: 'Nemotron 70B', description: 'Powerful instruct model', isFree: true, contextLength: '128K tokens', strengths: ['Helpfulness'], provider: 'nvidia' },
      { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B', description: 'Large multilingual model', isFree: true, contextLength: '128K tokens', strengths: ['Multilingual', 'Math'], provider: 'qwen' },
      { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek Chat', description: 'Great for coding', isFree: true, contextLength: '64K tokens', strengths: ['Coding', 'Technical'], provider: 'deepseek' },
    ],
    paidModels: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Complex reasoning', isFree: false, contextLength: '200K tokens', strengths: ['Reasoning', 'Analysis'], provider: 'anthropic' },
      { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Flagship multimodal', isFree: false, contextLength: '128K tokens', strengths: ['General purpose', 'Vision'], provider: 'openai' },
    ]
  },
  {
    id: 'google',
    name: 'Google AI Studio',
    description: 'Direct Gemini access with generous free tier',
    logo: 'G',
    website: 'https://aistudio.google.com',
    requiresApiKey: true,
    color: '#10b981',
    freeModels: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: 'Fast multimodal', isFree: true, contextLength: '1M tokens', strengths: ['Speed', 'Free tier'], provider: 'google' },
      { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning', isFree: true, contextLength: '1M tokens', strengths: ['Reasoning', 'Coding'], provider: 'google' },
    ],
    paidModels: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Production-ready', isFree: false, contextLength: '2M tokens', strengths: ['Production', 'Enterprise'], provider: 'google' },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Direct API access to GPT models',
    logo: 'OAI',
    website: 'https://platform.openai.com',
    requiresApiKey: true,
    color: '#10a37f',
    freeModels: [],
    paidModels: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable multimodal', isFree: false, contextLength: '128K tokens', strengths: ['General purpose', 'Vision'], provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cheap', isFree: false, contextLength: '128K tokens', strengths: ['Speed', 'Cost-effective'], provider: 'openai' },
      { id: 'o1-preview', name: 'o1 Preview', description: 'Advanced reasoning', isFree: false, contextLength: '128K tokens', strengths: ['Reasoning', 'Math'], provider: 'openai' },
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Direct API access to Claude models',
    logo: 'ANT',
    website: 'https://console.anthropic.com',
    requiresApiKey: true,
    color: '#d97706',
    freeModels: [],
    paidModels: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best balance of speed and intelligence', isFree: false, contextLength: '200K tokens', strengths: ['Reasoning', 'Analysis'], provider: 'anthropic' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude', isFree: false, contextLength: '200K tokens', strengths: ['Complex tasks', 'Research'], provider: 'anthropic' },
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run AI models locally — free, private, no API key needed',
    logo: '🦙',
    website: 'https://ollama.com',
    requiresApiKey: false,
    color: '#22c55e',
    freeModels: [
      { id: 'llama3.1', name: 'Llama 3.1 8B', description: 'Best general-purpose local model', isFree: true, contextLength: '128K tokens', strengths: ['General', 'Fast'], provider: 'meta' },
      { id: 'llama3.1:70b', name: 'Llama 3.1 70B', description: 'Powerful, needs 48GB+ RAM', isFree: true, contextLength: '128K tokens', strengths: ['Reasoning', 'Analysis'], provider: 'meta' },
      { id: 'mistral', name: 'Mistral 7B', description: 'Fast and efficient', isFree: true, contextLength: '32K tokens', strengths: ['Speed', 'Efficiency'], provider: 'mistral' },
      { id: 'mixtral', name: 'Mixtral 8x7B', description: 'MoE architecture, great for analysis', isFree: true, contextLength: '32K tokens', strengths: ['Coding', 'Analysis'], provider: 'mistral' },
      { id: 'qwen2.5', name: 'Qwen 2.5 7B', description: 'Strong multilingual', isFree: true, contextLength: '128K tokens', strengths: ['Multilingual', 'Math'], provider: 'qwen' },
      { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', description: 'Best for code generation', isFree: true, contextLength: '128K tokens', strengths: ['Coding', 'Technical'], provider: 'deepseek' },
      { id: 'phi3', name: 'Phi-3 Mini', description: 'Small but capable, runs on any machine', isFree: true, contextLength: '128K tokens', strengths: ['Lightweight', 'Fast'], provider: 'microsoft' },
      { id: 'gemma2', name: 'Gemma 2 9B', description: 'Google open model', isFree: true, contextLength: '8K tokens', strengths: ['Quality', 'Compact'], provider: 'google' },
    ],
    paidModels: []
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    description: 'Connect to any OpenAI-compatible API server',
    logo: 'API',
    website: '',
    requiresApiKey: false,
    color: '#6b7280',
    freeModels: [],
    paidModels: []
  },
]

interface ProviderSelectorProps {
  selectedProvider: string
  selectedModel: string
  apiKey: string
  onProviderChange: (provider: string) => void
  onModelChange: (model: string) => void
  onApiKeyChange: (key: string) => void
}

export function ProviderSelector({
  selectedProvider,
  selectedModel,
  apiKey,
  onProviderChange,
  onModelChange,
  onApiKeyChange
}: ProviderSelectorProps) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(selectedProvider)
  const [showFreeOnly, setShowFreeOnly] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProviders = ALL_PROVIDERS.filter(provider => {
    if (!searchQuery) return true
    const allModels = [...provider.freeModels, ...provider.paidModels]
    return allModels.some(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search models..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-orange-500/50 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 p-1 bg-white/[0.03] rounded-lg border border-white/[0.06]">
        <button
          onClick={() => setShowFreeOnly(true)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            showFreeOnly
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles size={14} />
          Free Models
        </button>
        <button
          onClick={() => setShowFreeOnly(false)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            !showFreeOnly
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Crown size={14} />
          All Models
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
        {filteredProviders.map((provider) => {
          const isExpanded = expandedProvider === provider.id
          const hasFreeModels = provider.freeModels.length > 0
          const modelsToShow = showFreeOnly ? provider.freeModels : [...provider.freeModels, ...provider.paidModels]

          if (showFreeOnly && modelsToShow.length === 0) return null

          return (
            <div
              key={provider.id}
              className={`rounded-xl border overflow-hidden ${
                isExpanded
                  ? 'border-white/[0.12] bg-white/[0.05]'
                  : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.10]'
              }`}
            >
              <button
                onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ background: `${provider.color}20`, border: `1px solid ${provider.color}40` }}
                >
                  {provider.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{provider.name}</span>
                    {hasFreeModels && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium border border-emerald-500/30">
                        {provider.freeModels.length} FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{provider.description}</p>
                </div>
                <ChevronDown size={20} className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="border-t border-white/[0.06]">
                  {provider.requiresApiKey && (
                    <div className="p-4 border-b border-white/[0.06]">
                      <label className="text-xs text-zinc-500 mb-1.5 block">
                        API Key for {provider.name}
                        {provider.website && (
                          <a href={provider.website} target="_blank" rel="noopener" className="ml-2 text-orange-400 hover:underline inline-flex items-center gap-1">
                            Get key <ExternalLink size={10} />
                          </a>
                        )}
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        placeholder={`Enter ${provider.name} API key`}
                        className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-orange-500/50 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="p-2 space-y-1">
                    {modelsToShow.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => { onProviderChange(provider.id); onModelChange(model.id) }}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                          selectedProvider === provider.id && selectedModel === model.id
                            ? 'bg-orange-500/15 border border-orange-500/30'
                            : 'hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5">
                          {selectedProvider === provider.id && selectedModel === model.id ? (
                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-white/[0.15]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-zinc-200">{model.name}</span>
                            {model.isFree && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">FREE</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{model.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {model.strengths.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 text-[10px]">{s}</span>
                            ))}
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-500 text-[10px]">{model.contextLength}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                    {modelsToShow.length === 0 && (
                      <div className="text-center py-4 text-zinc-500 text-sm">
                        No {showFreeOnly ? 'free ' : ''}models available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedProvider && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{ALL_PROVIDERS.find(p => p.id === selectedProvider)?.logo}</span>
              <span className="text-sm font-medium text-zinc-300">{ALL_PROVIDERS.find(p => p.id === selectedProvider)?.name}</span>
            </div>
            <span className="text-xs text-zinc-500">
              {ALL_PROVIDERS.find(p => p.id === selectedProvider)?.freeModels.find(m => m.id === selectedModel)?.name ||
               ALL_PROVIDERS.find(p => p.id === selectedProvider)?.paidModels.find(m => m.id === selectedModel)?.name ||
               selectedModel}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProviderSelector
