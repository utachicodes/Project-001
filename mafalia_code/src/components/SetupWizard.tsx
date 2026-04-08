import { useState } from 'react'
import { Config } from '../types'
import { X, Database, Sparkles, Rocket, CheckCircle2, AlertCircle } from 'lucide-react'
import { ProviderSelector, ALL_PROVIDERS } from './ProviderSelector'

interface SetupWizardProps {
  config: Config | null
  onSave: (config: Config) => void
  onClose: () => void
}

function SetupWizard({ config, onSave, onClose }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState(config?.provider || 'openrouter')
  const [model, setModel] = useState(config?.model || 'google/gemini-2.0-flash-exp:free')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [dataDir, setDataDir] = useState(config?.dataDir || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || '')
  const [isSaving, setIsSaving] = useState(false)

  const needsApiKey = currentProvider?.requiresApiKey !== false

  const currentProvider = ALL_PROVIDERS.find(p => p.id === provider)
  const selectedModel = currentProvider?.freeModels.find(m => m.id === model) || 
                      currentProvider?.paidModels.find(m => m.id === model)
  const isFree = selectedModel?.isFree ?? false

  const handleSave = async () => {
    if (needsApiKey && !apiKey.trim()) {
      setStep(2)
      return
    }
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Determine the base URL
    let resolvedBaseUrl = baseUrl.trim()
    if (!resolvedBaseUrl) {
      if (provider === 'ollama') resolvedBaseUrl = 'http://localhost:11434/v1'
    }

    onSave({
      provider,
      model,
      apiKey: apiKey.trim() || (provider === 'ollama' ? 'ollama' : ''),
      baseUrl: resolvedBaseUrl,
      dataDir: dataDir || '.',
      maxTokens: 4096,
      temperature: 0.4,
    })
    setIsSaving(false)
  }

  const steps = [
    { num: 1, title: 'Choose AI', desc: 'Select provider & model' },
    { num: 2, title: 'API Key', desc: 'Enter your credentials' },
    { num: 3, title: 'Data', desc: 'Configure data folder' },
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117]/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/[0.08]">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/mafalia-logo.png" 
                alt="Mafalia" 
                className="w-12 h-12 rounded-xl object-contain bg-white/[0.03] border border-white/[0.08] p-1"
              />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Mafalia Code
                </h2>
                <p className="text-sm text-zinc-500">AI-Powered Business Intelligence</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s.num
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium ${step >= s.num ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {s.title}
                  </p>
                  <p className="text-xs text-zinc-600">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-px mx-2 ${step > s.num ? 'bg-orange-500/50' : 'bg-zinc-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && (
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/80 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Choose Your AI Provider</h3>
                    <p className="text-sm text-zinc-500">Select from free and premium models</p>
                  </div>
                </div>

                <ProviderSelector
                  selectedProvider={provider}
                  selectedModel={model}
                  apiKey={apiKey}
                  onProviderChange={setProvider}
                  onModelChange={setModel}
                  onApiKeyChange={setApiKey}
                />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-700/80 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center">
                    <Sparkles size={20} className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {needsApiKey ? 'API Key Required' : 'Connection Setup'}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {needsApiKey ? 'Your key is stored securely and never shared' : 'Configure your local AI connection'}
                    </p>
                  </div>
                </div>

                {/* Ollama / no-key providers */}
                {!needsApiKey && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        No API Key Needed
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {provider === 'ollama'
                          ? 'Ollama runs locally on your machine. Make sure Ollama is installed and running (ollama serve).'
                          : 'This provider uses a custom endpoint. Enter the base URL below.'}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <label className="text-sm font-medium text-zinc-400 mb-2 block">
                        Base URL {provider === 'ollama' && '(default: http://localhost:11434/v1)'}
                      </label>
                      <input
                        type="text"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder={provider === 'ollama' ? 'http://localhost:11434/v1' : 'http://your-server:port/v1'}
                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                      <p className="text-xs text-zinc-600 mt-1.5">Leave empty to use default</p>
                    </div>
                  </div>
                )}

                {/* API key providers */}
                {needsApiKey && (
                  <>
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <label className="text-sm font-medium text-zinc-400 mb-2 block">
                        {currentProvider?.name} API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`sk-... or ${provider.toUpperCase()}_API_KEY`}
                        className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                      
                      {!apiKey.trim() && (
                        <div className="flex items-center gap-2 mt-3 text-amber-400 text-sm">
                          <AlertCircle size={16} />
                          <span>API key is required to continue</span>
                        </div>
                      )}

                      {apiKey.trim() && (
                        <div className="flex items-center gap-2 mt-3 text-emerald-400 text-sm">
                          <CheckCircle2 size={16} />
                          <span>API key looks good!</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        Free Options Available
                      </h4>
                      <ul className="space-y-1 text-sm text-zinc-400">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          OpenRouter: Gemini Flash, Llama 3.2, Qwen, DeepSeek
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Google AI Studio: Gemini 2.0 Flash & Pro
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ollama: Run any model locally for free
                        </li>
                      </ul>
                    </div>
                  </>
                )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-700/80 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center">
                    <Database size={20} className="text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Business Data</h3>
                    <p className="text-sm text-zinc-500">Optional: Connect your CSV files</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <label className="text-sm font-medium text-zinc-400 mb-2 block">
                    Data Directory (Optional)
                  </label>
                  <input
                    type="text"
                    value={dataDir}
                    onChange={(e) => setDataDir(e.target.value)}
                    placeholder="./data (default)"
                    className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-600 focus:border-orange-500/50 focus:outline-none"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Folder containing your business CSVs (revenue, inventory, customers, etc.)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm">
                  <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <Rocket size={18} />
                    Ready to Launch!
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Provider:</span>
                      <span className="text-zinc-300">{currentProvider?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Model:</span>
                      <span className="text-zinc-300">{selectedModel?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Cost:</span>
                      <span className={isFree ? 'text-emerald-400' : 'text-amber-400'}>
                        {isFree ? 'FREE' : 'Paid'}
                      </span>
                    </div>
                  </div>
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/[0.08] bg-black/20 backdrop-blur-sm flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Back
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-orange-600/90 hover:bg-orange-500 backdrop-blur-sm text-white transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={(needsApiKey && !apiKey.trim()) || isSaving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm text-white transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Sparkles size={16} className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    Launch Mafalia
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupWizard
