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
    <div className="w-[280px] min-w-[280px] h-full flex flex-col relative overflow-hidden"
         style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]"
           style={{ background: 'var(--primary)' }} />

      {/* ── Logo ──────────────────────────────────── */}
      <div className="px-6 pt-7 pb-5 drag-region">
        <div className="flex items-center gap-3.5 no-drag">
          <div className="relative w-11 h-11 rounded-[12px] flex items-center justify-center bg-[#E63946] shadow-lg shadow-red-100">
            <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
              <path d="M4 18l4-12 4 12M12 18l4-12 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-none">Mafalia</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1.5">Intelligence</p>
          </div>
        </div>
      </div>

      {/* ── Search / Command ──────────────────────── */}
      <div className="px-5 mb-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCommandPaletteOpen}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all no-drag border border-slate-100 hover:border-slate-200"
          style={{ background: 'var(--bg-app)' }}
        >
          <Search size={14} className="text-slate-400" />
          <span className="flex-1 text-[13px] text-left text-slate-400 font-medium">Search anything…</span>
          <kbd className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-white border border-slate-200 shadow-sm">
            /
          </kbd>
        </motion.button>
      </div>

      {/* ── New Chat ──────────────────────────────── */}
      <div className="px-5 mb-5">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-5 py-3 rounded-xl text-white transition-all no-drag shadow-md hover:shadow-lg"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={16} strokeWidth={3} />
          <span className="font-bold text-sm tracking-wide">New Session</span>
        </motion.button>
      </div>

      {/* ── Divider ───────────────────────────────── */}
      <div className="mx-6 mb-4 h-px bg-slate-100" />

      {/* ── Quick Actions ────────────────────────── */}
      <div className="px-5 mb-2">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">Deep Tools</p>
        <div className="space-y-1">
          <QuickBtn onClick={() => onQuickAction('summary')}   icon={BarChart3}   label="Business Health" color="var(--accent-violet)" />
          <QuickBtn onClick={() => onQuickAction('metrics')}   icon={TrendingUp}  label="Revenue Metrics"  color="var(--accent-cyan)" />
          <QuickBtn onClick={() => onQuickAction('create')}    icon={Wand2}       label="Campaign Forge"   color="var(--primary)" />
          <QuickBtn onClick={() => onQuickAction('research')}  icon={Globe}       label="Market Intel"     color="var(--accent-emerald)" />
        </div>
      </div>

      {/* ── Divider ───────────────────────────────── */}
      <div className="mx-6 my-4 h-px bg-slate-100" />

      {/* ── Agents ───────────────────────────────── */}
      <div className="flex items-center justify-between px-6 mb-3">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Agents</p>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
          {agents.length} Online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: 'thin' }}>
        <div className="space-y-1">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.id]
            return (
              <motion.button
                key={agent.id}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAgentClick(agent.id)}
                className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all group no-drag border border-transparent hover:bg-slate-50 hover:border-slate-200"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 border border-slate-200 group-hover:bg-white transition-colors shadow-sm">
                  {Icon
                    ? <Icon size={15} className="text-slate-600 group-hover:text-slate-900" />
                    : <span className="text-[11px] font-bold text-slate-600">{agent.tag.slice(1, 4)}</span>}
                </div>

                {/* Info */}
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-slate-900 truncate group-hover:text-black transition-colors">{agent.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate leading-tight group-hover:text-slate-600 uppercase tracking-wide">{agent.title}</p>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200">
                    {agent.tag}
                  </span>
                  <div className={`status-dot status-online`} />
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Chat History ─────────────────────────── */}
      <div className="px-5 py-2 border-t border-slate-50">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 transition-colors no-drag bg-slate-50/50 hover:bg-slate-100/50"
        >
          <div className="flex items-center gap-2.5">
            <History size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Session Log</span>
            {chatHistory.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-400 border border-slate-200 shadow-xs">{chatHistory.length}</span>
            )}
          </div>
          <motion.div animate={{ rotate: showHistory ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={13} />
          </motion.div>
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-40 overflow-y-auto space-y-1 pt-2 pb-1">
                {chatHistory.length === 0
                  ? <p className="text-[11px] text-slate-400 px-3 py-2 italic">No previous sessions found</p>
                  : chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => onLoadChat(chat.id)}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white hover:border-slate-200 border border-transparent shadow-sm hover:shadow-md"
                      style={{
                        background: currentChatId === chat.id ? 'white' : 'transparent',
                        borderColor: currentChatId === chat.id ? 'var(--border)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MessageSquare size={13} className={currentChatId === chat.id ? 'text-primary' : 'text-slate-400'} />
                        <span className={`text-[12.5px] truncate font-medium ${currentChatId === chat.id ? 'text-slate-900' : 'text-slate-500'}`}>{chat.title}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
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
      <div className="p-4 bg-slate-50/30 border-t border-slate-100">
        <div className="flex gap-2">
          <button onClick={onPrivacyClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-sm shadow-transparent hover:shadow-md no-drag">
            <ShieldCheck size={14} /><span>Privacy</span>
          </button>
          <button onClick={onSettingsClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-sm shadow-transparent hover:shadow-md no-drag">
            <Settings size={14} /><span>Settings</span>
          </button>
        </div>
        {/* Connection status */}
        <div className="flex items-center gap-2 px-2 mt-3.5">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: status.includes('Connected') ? 'var(--accent-emerald)' : 'var(--text-muted)' }}
          />
          <span className="text-[11px] font-bold text-slate-400 truncate tracking-wide">{status}</span>
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
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group no-drag border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm"
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100/50 group-hover:bg-white border border-slate-100 transition-colors shadow-xs">
        <Icon size={14} style={{ color }} />
      </div>
      <span className="font-bold text-[13.5px] text-slate-500 group-hover:text-slate-900 transition-colors tracking-tight">{label}</span>
    </motion.button>
  )
}

