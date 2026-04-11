import { useState } from 'react'
import { motion } from 'framer-motion'
import { Config } from '../types'
import { X, Database, Sparkles, Rocket, CheckCircle2, AlertCircle } from 'lucide-react'
import { ProviderSelector, ALL_PROVIDERS } from './ProviderSelector'

interface SetupWizardProps {
  config: Config | null
  onSave: (config: Config) => void
  onClose: () => void
}

const STEPS = [
  { num: 1, title: 'AI Provider', desc: 'Choose model & provider' },
  { num: 2, title: 'API Key',     desc: 'Enter credentials' },
  { num: 3, title: 'Data',        desc: 'Configure data folder' },
]

export default function SetupWizard({ config, onSave, onClose }: SetupWizardProps) {
  const [step, setStep]       = useState(1)
  const [provider, setProvider] = useState(config?.provider || 'openrouter')
  const [model, setModel]     = useState(config?.model || 'google/gemini-2.0-flash-exp:free')
  const [apiKey, setApiKey]   = useState(config?.apiKey || '')
  const [dataDir, setDataDir] = useState(config?.dataDir || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || '')
  const [isSaving, setIsSaving] = useState(false)

  const currentProvider = ALL_PROVIDERS.find(p => p.id === provider)
  const selectedModel   = currentProvider?.freeModels.find(m => m.id === model) ||
                          currentProvider?.paidModels.find(m => m.id === model)
  const needsApiKey = currentProvider?.requiresApiKey !== false
  const isFree      = selectedModel?.isFree ?? false

  const handleSave = async () => {
    if (needsApiKey && !apiKey.trim()) { setStep(2); return }
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 400))
    let resolvedBaseUrl = baseUrl.trim()
    if (!resolvedBaseUrl && provider === 'ollama') resolvedBaseUrl = 'http://localhost:11434/v1'
    onSave({
      provider, model,
      apiKey: apiKey.trim() || (provider === 'ollama' ? 'ollama' : ''),
      baseUrl: resolvedBaseUrl,
      dataDir: dataDir || '.',
      maxTokens: 4096, temperature: 0.4,
    })
    setIsSaving(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
         style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 360 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
        style={{ background: 'rgba(8,12,20,0.98)', border: '1px solid rgba(124,58,237,0.25)' }}
      >
        {/* Top gradient */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.7), rgba(0,212,255,0.5), transparent)' }} />

        {/* Header */}
        <div className="px-8 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,212,255,0.2))', border: '1px solid rgba(124,58,237,0.4)' }}>
                  <span className="text-lg font-bold gradient-text">M</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">Setup <span className="gradient-text">Mafalia Code</span></h2>
              </div>
              <p className="text-[13px] text-slate-500 ml-12">AI-powered business intelligence in minutes</p>
            </div>
            <button onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-3 mt-6">
            {STEPS.map((s, i) => {
              const done    = step > s.num
              const active  = step === s.num
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => done && setStep(s.num)}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                         style={{
                           background: done    ? 'linear-gradient(135deg, #7C3AED, #00D4FF)'
                                       : active ? 'rgba(124,58,237,0.25)'
                                       : 'rgba(255,255,255,0.05)',
                           border: active ? '1px solid rgba(124,58,237,0.6)' : done ? 'none' : '1px solid rgba(255,255,255,0.08)',
                           color: done ? '#fff' : active ? '#A78BFA' : '#475569',
                         }}>
                      {done ? <CheckCircle2 size={14} /> : s.num}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[12px] font-semibold" style={{ color: active ? '#C4B5FD' : done ? '#94A3B8' : '#475569' }}>{s.title}</p>
                      <p className="text-[10px] text-slate-600">{s.desc}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-8 h-px mx-1 transition-all"
                         style={{ background: step > s.num ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.06)' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>

          {/* Step 1: Provider */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)' }}>
                  <Sparkles size={15} style={{ color: '#A78BFA' }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-100">Choose Your AI Provider</h3>
                  <p className="text-[12px] text-slate-500">Select from free and premium models</p>
                </div>
              </div>
              <ProviderSelector
                selectedProvider={provider} selectedModel={model} apiKey={apiKey}
                onProviderChange={setProvider} onModelChange={setModel} onApiKeyChange={setApiKey}
              />
            </div>
          )}

          {/* Step 2: API Key */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>
                  <Sparkles size={15} style={{ color: '#00D4FF' }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-100">
                    {needsApiKey ? 'API Key Required' : 'Connection Setup'}
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    {needsApiKey ? 'Stored locally and never shared' : 'Configure your local AI connection'}
                  </p>
                </div>
              </div>

              {!needsApiKey && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <h4 className="text-[13px] font-semibold text-emerald-400 mb-1.5 flex items-center gap-2">
                      <CheckCircle2 size={14} /> No API Key Needed
                    </h4>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      {provider === 'ollama'
                        ? 'Ollama runs locally. Make sure Ollama is installed and running (ollama serve).'
                        : 'This provider uses a custom endpoint. Enter the base URL below.'}
                    </p>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-slate-400 mb-1.5 block">
                      Base URL {provider === 'ollama' && '(default: http://localhost:11434/v1)'}
                    </label>
                    <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
                      placeholder={provider === 'ollama' ? 'http://localhost:11434/v1' : 'http://your-server:port/v1'}
                      className="w-full text-[13px] text-slate-200 placeholder-slate-600 px-4 py-3 rounded-xl outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'}
                    />
                  </div>
                </div>
              )}

              {needsApiKey && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-medium text-slate-400 mb-1.5 block">
                      {currentProvider?.name} API Key
                    </label>
                    <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                      placeholder={`sk-... or ${provider.toUpperCase()}_API_KEY`}
                      className="w-full text-[13px] text-slate-200 placeholder-slate-600 px-4 py-3 rounded-xl outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'}
                    />
                    {!apiKey.trim()
                      ? <div className="flex items-center gap-1.5 mt-2 text-[12px] text-amber-400"><AlertCircle size={13} /> API key required to continue</div>
                      : <div className="flex items-center gap-1.5 mt-2 text-[12px] text-emerald-400"><CheckCircle2 size={13} /> Looks good!</div>
                    }
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
                    <h4 className="text-[12px] font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                      <Sparkles size={13} /> Free options available
                    </h4>
                    <ul className="space-y-1.5 text-[12px] text-slate-400">
                      {['OpenRouter: Gemini Flash, Llama 3.2, Qwen, DeepSeek (free)',
                        'Google AI Studio: Gemini 2.0 Flash & Pro (free tier)',
                        'Ollama: Run any model locally for free'].map(item => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Data */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <Database size={15} style={{ color: '#A78BFA' }} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-slate-100">Business Data</h3>
                  <p className="text-[12px] text-slate-500">Optional: Connect your CSV files</p>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-slate-400 mb-1.5 block">Data Directory (Optional)</label>
                <input type="text" value={dataDir} onChange={e => setDataDir(e.target.value)}
                  placeholder="./data (default)"
                  className="w-full text-[13px] text-slate-200 placeholder-slate-600 px-4 py-3 rounded-xl outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)'}
                />
                <p className="text-[11px] text-slate-600 mt-1.5">Folder containing your business CSVs (revenue, inventory, customers…)</p>
              </div>

              {/* Summary card */}
              <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(0,212,255,0.06))', border: '1px solid rgba(124,58,237,0.25)' }}>
                <h4 className="font-semibold text-[13px] text-violet-300 mb-3 flex items-center gap-2">
                  <Rocket size={14} /> Ready to Launch!
                </h4>
                <div className="space-y-2">
                  {[
                    ['Provider', currentProvider?.name],
                    ['Model',    selectedModel?.name],
                    ['Cost',     isFree ? '✓ FREE' : 'Paid'],
                  ].map(([key, val]) => (
                    <div key={key} className="flex justify-between text-[13px]">
                      <span className="text-slate-500">{key}:</span>
                      <span className={key === 'Cost' ? (isFree ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-300'}>
                        {val || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex justify-between items-center"
             style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
            className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-all">
              Cancel
            </button>
            {step < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #00D4FF)' }}
              >
                Continue →
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={(needsApiKey && !apiKey.trim()) || isSaving}
                className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
              >
                {isSaving ? <><Sparkles size={13} className="animate-spin" /> Starting…</> : <><Rocket size={13} /> Launch Mafalia</>}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
