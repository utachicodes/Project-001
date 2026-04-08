import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Agent, Message } from '../types'
import {
  Settings, Plus, History, Trash2, ShieldCheck,
  ChevronRight, MessageSquare, BarChart3, TrendingUp,
  LayoutGrid, Search, Wand2, Globe,
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

function Sidebar({
  agents, status, onAgentClick, onSettingsClick, onQuickAction,
  chatHistory, onNewChat, onLoadChat, onDeleteChat, currentChatId,
  onPrivacyClick, onAgentGridOpen, onCommandPaletteOpen
}: SidebarProps) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="w-[280px] min-w-[280px] h-full flex flex-col bg-[#0d1117] border-r border-white/[0.08] relative overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/mafalia-logo.png"
            alt="Mafalia"
            className="w-9 h-9 object-contain opacity-90"
          />
          <div>
            <span className="text-[15px] font-semibold text-zinc-200 tracking-tight">Mafalia</span>
            <p className="text-[10px] text-zinc-600 font-medium tracking-wide">AI Business Command Center</p>
          </div>
        </div>
      </div>

      {/* Search — like Script.io ⌘K */}
      <div className="px-4 mb-2">
        <button
          onClick={onCommandPaletteOpen}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:bg-white/[0.05] hover:border-white/[0.10] hover:text-zinc-400 transition-all"
        >
          <Search size={15} />
          <span className="flex-1 text-sm text-left">Search</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono border border-white/[0.06]">/</kbd>
        </button>
      </div>

      {/* New Chat */}
      <div className="px-4 mb-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm text-zinc-300 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
        >
          <Plus size={18} />
          <span className="font-semibold text-sm">New Conversation</span>
        </motion.button>
      </div>

      {/* Chat History Toggle */}
      <div className="px-4 mb-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex items-center gap-2">
            <History size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Chat History</span>
          </div>
          <motion.div animate={{ rotate: showHistory ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} />
          </motion.div>
        </button>
      </div>

      {/* Chat History List */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 mb-3 overflow-hidden"
          >
            <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1">
              {chatHistory.length === 0 ? (
                <p className="text-xs text-zinc-600 px-3 py-2">No previous chats</p>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      currentChatId === chat.id
                        ? 'bg-orange-500/15 border border-orange-500/25'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                    onClick={() => onLoadChat(chat.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare size={14} className="text-zinc-500 shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{chat.title}</span>
                    </div>
                    <button
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDeleteChat(chat.id) }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4 my-1" />

      {/* Quick Actions */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">Quick Actions</p>
        <div className="space-y-1">
          <QuickActionBtn onClick={() => onQuickAction('summary')} icon={BarChart3} label="Business Summary" color="#10b981" />
          <QuickActionBtn onClick={() => onQuickAction('metrics')} icon={TrendingUp} label="Live Metrics" color="#3b82f6" />
          <QuickActionBtn onClick={() => onQuickAction('create')} icon={Wand2} label="Create Content" color="#f97316" />
          <QuickActionBtn onClick={() => onQuickAction('research')} icon={Globe} label="Web Research" color="#06b6d4" />
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-4 my-1" />

      {/* Agents header + grid toggle */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">AI Agents</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAgentGridOpen}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          title="Agent Ecosystem"
        >
          <LayoutGrid size={14} className="text-zinc-500 hover:text-orange-400" />
        </motion.button>
      </div>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-1">
        <div className="space-y-0.5">
          {agents.map((agent, i) => {
            const Icon = AGENT_ICONS[agent.id]
            return (
              <motion.button
                key={agent.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAgentClick(agent.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm"
                  style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}30` }}
                >
                  {Icon ? <Icon size={15} style={{ color: agent.color }} /> :
                    <span className="text-xs font-bold" style={{ color: agent.color }}>{agent.tag.slice(1, 4)}</span>}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {agent.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">{agent.title}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${agent.color}12`, color: `${agent.color}99` }}
                  >
                    {agent.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'working' ? 'bg-amber-400 animate-pulse' :
                      agent.status === 'error' ? 'bg-red-400' :
                      agent.status === 'offline' ? 'bg-zinc-600' :
                      'bg-emerald-500/70'
                    }`} />
                    <span className="text-[9px] text-zinc-600">{agent.room}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.05] bg-white/[0.02]">
        <div className="space-y-1">
          <button
            onClick={onPrivacyClick}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-emerald-400 hover:bg-white/[0.03] transition-colors"
          >
            <ShieldCheck size={14} />
            <span>Privacy & Security</span>
          </button>
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-colors"
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
        <div className="mt-3 px-2">
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
            <span className="truncate">{status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionBtn({ onClick, icon: Icon, label, color }: {
  onClick: () => void
  icon: React.ComponentType<any>
  label: string
  color: string
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.10] backdrop-blur-sm transition-all"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}25` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <span className="font-medium text-sm text-zinc-300">{label}</span>
    </motion.button>
  )
}

export default Sidebar
