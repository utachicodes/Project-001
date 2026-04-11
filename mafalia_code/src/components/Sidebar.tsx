import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Agent, Message } from '../types'
import {
  Settings, Plus, History, Trash2, ShieldCheck,
  ChevronRight, MessageSquare, BarChart3, TrendingUp,
  Search, Wand2, Globe, Command,
  DollarSign, Cog, Heart, Package, Megaphone,
  PiggyBank, BarChart2, Wrench, Rocket, Handshake,
} from 'lucide-react'

const AGENT_ICONS: Record<string, React.ComponentType<any>> = {
  zara: DollarSign, kofi: Cog, amara: Heart, idris: Package, nala: Megaphone,
  tariq: PiggyBank, sana: BarChart2, ravi: Wrench, luna: Rocket, omar: Handshake,
}

interface SidebarProps {
  agents: Agent[]
  status: string
  onAgentClick: (agentId: string) => void
  onSettingsClick: () => void
  onQuickAction: (action: 'summary' | 'metrics' | 'clear' | 'create' | 'research') => void
  chatHistory: { id: string; title: string; date: string; messages: Message[] }[]
  onNewChat: () => void
  onLoadChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  currentChatId: string
  onPrivacyClick: () => void
  onAgentGridOpen: () => void
  onCommandPaletteOpen: () => void
}

export default function Sidebar({
  agents, status, onAgentClick, onSettingsClick, onQuickAction,
  chatHistory, onNewChat, onLoadChat, onDeleteChat, currentChatId,
  onPrivacyClick, onAgentGridOpen, onCommandPaletteOpen,
}: SidebarProps) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="w-[272px] min-w-[272px] h-full flex flex-col relative overflow-hidden"
         style={{ background: 'rgba(5,8,16,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Subtle top glow stripe */}
      <div className="absolute top-0 left-0 right-0 h-px"
           style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(0,212,255,0.4), transparent)' }} />

      {/* ── Logo ──────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 drag-region">
        <div className="flex items-center gap-3 no-drag">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(0,212,255,0.2))', border: '1px solid rgba(124,58,237,0.4)' }}>
            <span className="text-base font-bold gradient-text">M</span>
            <div className="absolute -inset-0.5 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,212,255,0.1))', filter: 'blur(6px)', zIndex: -1 }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 tracking-tight">Mafalia <span className="gradient-text">Code</span></p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">AI Command Center</p>
          </div>
        </div>
      </div>

      {/* ── Search / Command ──────────────────────── */}
      <div className="px-4 mb-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCommandPaletteOpen}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all no-drag"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Search size={13} className="text-slate-500" />
          <span className="flex-1 text-xs text-left text-slate-500">Search commands…</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-600"
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Command size={9} />/
          </kbd>
        </motion.button>
      </div>

      {/* ── New Chat ──────────────────────────────── */}
      <div className="px-4 mb-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-slate-300 transition-all no-drag"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,212,255,0.08))', border: '1px solid rgba(124,58,237,0.25)' }}
        >
          <Plus size={15} className="text-violet-400" />
          <span className="font-medium text-sm">New Conversation</span>
        </motion.button>
      </div>

      {/* ── Divider ───────────────────────────────── */}
      <div className="mx-4 mb-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* ── Quick Actions ────────────────────────── */}
      <div className="px-4 mb-1">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2 px-1">Quick Actions</p>
        <div className="space-y-0.5">
          <QuickBtn onClick={() => onQuickAction('summary')}   icon={BarChart3}   label="Business Summary" color="#7C3AED" />
          <QuickBtn onClick={() => onQuickAction('metrics')}   icon={TrendingUp}  label="Live Metrics"     color="#00D4FF" />
          <QuickBtn onClick={() => onQuickAction('create')}    icon={Wand2}       label="Create Content"   color="#A855F7" />
          <QuickBtn onClick={() => onQuickAction('research')}  icon={Globe}       label="Web Research"     color="#06B6D4" />
        </div>
      </div>

      {/* ── Divider ───────────────────────────────── */}
      <div className="mx-4 my-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* ── Agents ───────────────────────────────── */}
      <div className="flex items-center justify-between px-5 mb-1.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">AI Agents</p>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)' }}>
          {agents.length} active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-2" style={{ scrollbarWidth: 'thin' }}>
        <div className="space-y-0.5">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.id]
            const isWorking = agent.status === 'working'
            return (
              <motion.button
                key={agent.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAgentClick(agent.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group no-drag"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                }}
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{ background: `${agent.color}14`, border: `1px solid ${agent.color}28` }}>
                  {Icon
                    ? <Icon size={14} style={{ color: agent.color }} />
                    : <span className="text-[11px] font-bold" style={{ color: agent.color }}>{agent.tag.slice(1, 4)}</span>}
                </div>

                {/* Info */}
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors truncate">{agent.name}</p>
                  <p className="text-[11px] text-slate-500 truncate leading-tight">{agent.title}</p>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${agent.color}10`, color: `${agent.color}90` }}>
                    {agent.tag}
                  </span>
                  <div className={`status-dot ${agent.status || 'idle'} ${isWorking ? 'animate-pulse-glow' : ''}`} />
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Chat History ─────────────────────────── */}
      <div className="mx-4 mt-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      <div className="px-4 py-1.5">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors no-drag"
        >
          <div className="flex items-center gap-2">
            <History size={13} />
            <span className="text-[11px] font-medium uppercase tracking-wider">History</span>
            {chatHistory.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500">{chatHistory.length}</span>
            )}
          </div>
          <motion.div animate={{ rotate: showHistory ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={12} />
          </motion.div>
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="max-h-36 overflow-y-auto space-y-0.5 pt-1">
                {chatHistory.length === 0
                  ? <p className="text-[11px] text-slate-600 px-2 py-1.5">No previous chats</p>
                  : chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => onLoadChat(chat.id)}
                      className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: currentChatId === chat.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                        border: `1px solid ${currentChatId === chat.id ? 'rgba(124,58,237,0.25)' : 'transparent'}`,
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare size={11} className="text-slate-600 flex-shrink-0" />
                        <span className="text-[12px] text-slate-400 truncate">{chat.title}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id) }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={11} className="text-red-400" />
                      </button>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ───────────────────────────────── */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-1">
          <button onClick={onPrivacyClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] text-slate-500 hover:text-cyan-400 hover:bg-white/[0.03] transition-colors no-drag">
            <ShieldCheck size={12} /><span>Privacy</span>
          </button>
          <button onClick={onSettingsClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] text-slate-500 hover:text-violet-400 hover:bg-white/[0.03] transition-colors no-drag">
            <Settings size={12} /><span>Settings</span>
          </button>
        </div>
        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-2 mt-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: status.includes('Connected') ? '#34D399' : '#94A3B8' }}
          />
          <span className="text-[10px] text-slate-600 truncate">{status}</span>
        </div>
      </div>
    </div>
  )
}

function QuickBtn({ onClick, icon: Icon, label, color }: {
  onClick: () => void; icon: React.ComponentType<any>; label: string; color: string
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group no-drag"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `${color}10`
        ;(e.currentTarget as HTMLElement).style.borderColor = `${color}20`
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
      }}
    >
      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
           style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={12} style={{ color }} />
      </div>
      <span className="font-medium text-[13px] text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
    </motion.button>
  )
}
