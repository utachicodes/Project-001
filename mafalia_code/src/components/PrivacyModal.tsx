import { X, Shield, Folder, HardDrive, Monitor, Globe, FileText, Database, Terminal } from 'lucide-react'

interface PrivacyModalProps {
  onClose: () => void
}

const ACCESS_ITEMS = [
  {
    icon: Folder,
    title: 'Desktop, Documents & Downloads',
    desc: 'Browse, read, and write files anywhere on your system',
    color: '#10b981',
  },
  {
    icon: FileText,
    title: 'All File Types',
    desc: 'CSV, JSON, text, configs, logs — any readable file up to 10 MB',
    color: '#3b82f6',
  },
  {
    icon: HardDrive,
    title: 'Full File System',
    desc: 'Navigate any directory, create folders, copy, move, and delete files',
    color: '#f59e0b',
  },
  {
    icon: Monitor,
    title: 'System Information',
    desc: 'Platform, hostname, CPU, memory, and directory paths',
    color: '#8b5cf6',
  },
  {
    icon: Terminal,
    title: 'Open Files & Folders',
    desc: 'Launch files in their default app or reveal them in the file explorer',
    color: '#06b6d4',
  },
  {
    icon: Globe,
    title: 'Network via API Providers',
    desc: 'Queries are sent to your configured AI provider (OpenRouter, Gemini, etc.)',
    color: '#ef4444',
  },
]

function PrivacyModal({ onClose }: PrivacyModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1117]/95 backdrop-blur-xl rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl border border-white/[0.08]">
        <div className="p-6 border-b border-white/[0.08] sticky top-0 bg-[#0d1117]/95 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-emerald-400" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Access & Permissions</h2>
                <p className="text-xs text-zinc-500">Full desktop access is enabled</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-2">
          {ACCESS_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${item.color}15` }}
                >
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-5 pb-5 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-3">Data handling</h3>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <Database size={12} className="text-zinc-500 mt-0.5 shrink-0" />
                <span>All processing runs locally via the Python backend</span>
              </div>
              <div className="flex items-start gap-2">
                <Database size={12} className="text-zinc-500 mt-0.5 shrink-0" />
                <span>Chat history stored in browser localStorage</span>
              </div>
              <div className="flex items-start gap-2">
                <Database size={12} className="text-zinc-500 mt-0.5 shrink-0" />
                <span>Data is only sent to your chosen AI provider for inference</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.10] text-zinc-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyModal
