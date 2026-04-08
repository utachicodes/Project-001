import { useState } from 'react'
import { Config, PROVIDERS } from '../types'
import { X, Key, Server, Database, Sparkles } from 'lucide-react'

interface SetupWizardProps {
  config: Config | null
  onSave: (config: Config) => void
  onClose: () => void
}

function SetupWizard({ config, onSave, onClose }: SetupWizardProps) {
  const [provider, setProvider] = useState(config?.provider || 'openai')
  const [model, setModel] = useState(config?.model || 'gpt-4o')
  const [apiKey, setApiKey] = useState(config?.apiKey || '')
  const [baseUrl, setBaseUrl] = useState(config?.baseUrl || '')
  const [dataDir, setDataDir] = useState(config?.dataDir || '')

  const selectedProvider = PROVIDERS.find(p => p.id === provider)

  const handleSave = () => {
    onSave({
      provider,
      model,
      apiKey,
      baseUrl,
      dataDir: dataDir || '.',
      maxTokens: 4096,
      temperature: 0.4,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-mafalia-sidebar rounded-2xl w-full max-w-lg shadow-2xl border border-mafalia-border">
        {/* Header */}
        <div className="p-6 border-b border-mafalia-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-mafalia-accent/20 flex items-center justify-center">
                <Sparkles className="text-mafalia-accent" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-mafalia-text">Welcome to Mafalia Code</h2>
                <p className="text-sm text-mafalia-text-dim">Connect your AI model to get started</p>
              </div>
            </div>
            <button onClick={onClose} className="text-mafalia-text-dim hover:text-mafalia-text">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Provider */}
          <div>
            <label className="text-sm font-semibold text-mafalia-text mb-2 flex items-center gap-2">
              <Server size={16} className="text-mafalia-text-dim" />
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value)
                const p = PROVIDERS.find(p => p.id === e.target.value)
                if (p?.models[0]) setModel(p.models[0])
              }}
              className="w-full bg-mafalia-input border border-mafalia-border rounded-lg px-4 py-3 text-mafalia-text text-sm focus:border-mafalia-accent focus:outline-none"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm font-semibold text-mafalia-text mb-2 flex items-center gap-2">
              <Key size={16} className="text-mafalia-text-dim" />
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`sk-... (or ${provider.toUpperCase()}_API_KEY from env)`}
              className="w-full bg-mafalia-input border border-mafalia-border rounded-lg px-4 py-3 text-mafalia-text text-sm focus:border-mafalia-accent focus:outline-none placeholder:text-mafalia-text-dim/50"
            />
            <p className="text-xs text-mafalia-text-dim mt-1">
              Leave blank to use environment variable
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="text-sm font-semibold text-mafalia-text mb-2">Model</label>
            {selectedProvider?.models && selectedProvider.models.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-mafalia-input border border-mafalia-border rounded-lg px-4 py-3 text-mafalia-text text-sm focus:border-mafalia-accent focus:outline-none"
              >
                {selectedProvider.models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter model name (e.g., gpt-4o)"
                className="w-full bg-mafalia-input border border-mafalia-border rounded-lg px-4 py-3 text-mafalia-text text-sm focus:border-mafalia-accent focus:outline-none"
              />
            )}
          </div>

          {/* Custom Base URL (for custom provider) */}
          {provider === 'custom' && (
            <div>
              <label className="text-sm font-semibold text-mafalia-text mb-2">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full bg-mafalia-input border border-mafalia-border rounded-lg px-4 py-3 text-mafalia-text text-sm focus:border-mafalia-accent focus:outline-none"
              />
            </div>
          )}

          {/* Data Directory */}
          <div>
            <label className="text-sm font-semibold text-mafalia-text mb-2 flex items-center gap-2">
              <Database size={16} className="text-mafalia-text-dim" />
              Business Data Folder
            </label>
            <input
              type="text"
              value={dataDir}
              onChange={(e) => setDataDir(e.target.value)}
              placeholder="Path to CSV files (default: current folder)"
              className="w-full bg-mafalia-input border border-mafalia-border rounded-lg px-4 py-3 text-mafalia-text text-sm focus:border-mafalia-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-mafalia-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-mafalia-text hover:bg-mafalia-input transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!provider || !model}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-mafalia-accent hover:bg-mafalia-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            Start Mafalia Code
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetupWizard
