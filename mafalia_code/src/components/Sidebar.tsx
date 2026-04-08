import { Agent } from '../types'
import { BarChart3, Zap, Users, Package, Megaphone, Wallet, Brain, Shield, TrendingUp, Handshake, Settings, Sparkles } from 'lucide-react'

interface SidebarProps {
  agents: Agent[]
  status: string
  onAgentClick: (agentId: string) => void
  onSettingsClick: () => void
  onQuickAction: (action: 'summary' | 'metrics' | 'clear') => void
}

function Sidebar({ agents, status, onAgentClick, onSettingsClick, onQuickAction }: SidebarProps) {
  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'zara': return <BarChart3 size={16} />
      case 'kofi': return <Zap size={16} />
      case 'amara': return <Users size={16} />
      case 'idris': return <Package size={16} />
      case 'nala': return <Megaphone size={16} />
      case 'tariq': return <Wallet size={16} />
      case 'sana': return <Brain size={16} />
      case 'ravi': return <Shield size={16} />
      case 'luna': return <TrendingUp size={16} />
      case 'omar': return <Handshake size={16} />
      default: return <Sparkles size={16} />
    }
  }

  return (
    <div className="w-[260px] min-w-[260px] h-full bg-mafalia-sidebar flex flex-col border-r border-mafalia-border">
      {/* Logo */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <img 
            src="/mafalia-logo.png" 
            alt="Mafalia" 
            className="w-10 h-10 rounded-lg object-contain"
          />
          <div>
            <span className="text-xl font-bold text-mafalia-accent">MAFALIA</span>
            <span className="text-xl font-bold text-mafalia-text ml-1">CODE</span>
            <p className="text-[10px] text-mafalia-text-dim">Business Operations CoWork</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-mafalia-border mx-4" />

      {/* Quick Actions */}
      <div className="px-4 py-3">
        <p className="text-[11px] font-semibold text-mafalia-text-dim uppercase tracking-wider mb-2">Quick Actions</p>
        <div className="space-y-1">
          <button
            onClick={() => onQuickAction('summary')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-mafalia-text hover:bg-mafalia-input transition-colors"
          >
            Business Summary
          </button>
          <button
            onClick={() => onQuickAction('metrics')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-mafalia-text hover:bg-mafalia-input transition-colors"
          >
            Live Metrics
          </button>
          <button
            onClick={() => onQuickAction('clear')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-mafalia-text hover:bg-mafalia-input transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-mafalia-border mx-4" />

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        <p className="text-[11px] font-semibold text-mafalia-text-dim uppercase tracking-wider mb-2 px-1">Agents</p>
        <div className="space-y-1">
          {agents.map(agent => (
            <button
              key={agent.id}
              onClick={() => onAgentClick(agent.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-mafalia-input transition-colors group"
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: agent.color }}
              >
                {getAgentIcon(agent.id)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-mafalia-text group-hover:text-white transition-colors">
                  {agent.name}
                </p>
                <p className="text-[11px] text-mafalia-text-dim">{agent.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-mafalia-border">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-mafalia-text-dim hover:bg-mafalia-input hover:text-mafalia-text transition-colors"
        >
          <Settings size={16} />
          Settings
        </button>
        <p className="text-[10px] text-mafalia-text-dim mt-2 px-1 truncate" title={status}>
          {status}
        </p>
      </div>
    </div>
  )
}

export default Sidebar
