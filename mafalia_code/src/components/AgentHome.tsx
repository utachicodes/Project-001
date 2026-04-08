import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Agent } from '../types'
import {
  DollarSign, Cog, Heart, Package, Megaphone,
  PiggyBank, BarChart2, Wrench, Rocket, Handshake,
  X, Play, ArrowRight, Clock, CheckCircle2, Zap,
  Home, ChevronRight, Circle, Loader2
} from 'lucide-react'

const AGENT_ICONS: Record<string, React.ComponentType<any>> = {
  zara: DollarSign, kofi: Cog, amara: Heart, idris: Package, nala: Megaphone,
  tariq: PiggyBank, sana: BarChart2, ravi: Wrench, luna: Rocket, omar: Handshake,
}

interface AgentHomeProps {
  agent: Agent
  isOpen: boolean
  onClose: () => void
  onSendCommand: (command: string) => void
}

export default function AgentHome({ agent, isOpen, onClose, onSendCommand }: AgentHomeProps) {
  const [runningAction, setRunningAction] = useState<string | null>(null)
  const Icon = AGENT_ICONS[agent.id] || Zap

  const handleAction = (command: string) => {
    setRunningAction(command)
    onSendCommand(command)
    onClose()
    setTimeout(() => setRunningAction(null), 1000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start justify-center pointer-events-none"
          >
            <div className="w-full max-w-3xl pointer-events-auto mx-4 mt-4 mb-8">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117] overflow-hidden shadow-2xl shadow-black/40">

                {/* Agent Header */}
                <div
                  className="relative px-8 pt-8 pb-6 overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${agent.color}12, ${agent.color}04)` }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `radial-gradient(${agent.color} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
                  />
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: `${agent.color}20`, border: `2px solid ${agent.color}35` }}
                      >
                        <Icon size={26} style={{ color: agent.color }} />
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl font-bold text-zinc-100">{agent.name}</h2>
                          <span
                            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md"
                            style={{ background: `${agent.color}18`, color: agent.color, border: `1px solid ${agent.color}25` }}
                          >
                            {agent.tag}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 mt-0.5">{agent.title}</p>
                        <p className="text-xs text-zinc-500 mt-1.5 max-w-md leading-relaxed">{agent.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        <Home size={12} className="text-zinc-500" />
                        <span className="text-[11px] text-zinc-400">{agent.room}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
                      >
                        <X size={16} className="text-zinc-400" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-6">

                  {/* Capabilities */}
                  {agent.capabilities && agent.capabilities.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Capabilities</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {agent.capabilities.map((cap) => (
                          <motion.button
                            key={cap.id}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleAction(cap.command)}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all text-left group"
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: `${agent.color}12` }}
                            >
                              {runningAction === cap.command ? (
                                <Loader2 size={16} style={{ color: agent.color }} className="animate-spin" />
                              ) : (
                                <Play size={14} style={{ color: agent.color }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{cap.label}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{cap.description}</p>
                            </div>
                            <code className="text-[10px] font-mono text-zinc-600 bg-white/[0.03] px-2 py-1 rounded border border-white/[0.04] shrink-0 hidden sm:block">
                              {cap.command}
                            </code>
                            <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {agent.quickActions && agent.quickActions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        {agent.quickActions.map((action) => (
                          <motion.button
                            key={action}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAction(action)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: `${agent.color}10`,
                              color: agent.color,
                              border: `1px solid ${agent.color}20`,
                            }}
                          >
                            <Zap size={11} />
                            <span>{action}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Task History */}
                  {agent.taskHistory && agent.taskHistory.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Tasks</h3>
                      <div className="space-y-1.5">
                        {agent.taskHistory.slice(0, 5).map((task) => (
                          <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.015]">
                            {task.status === 'done' ? (
                              <CheckCircle2 size={14} className="text-emerald-500/70 shrink-0" />
                            ) : (
                              <Clock size={14} className="text-zinc-600 shrink-0" />
                            )}
                            <span className="text-xs text-zinc-400 flex-1 truncate">{task.description}</span>
                            {task.completedAt && (
                              <span className="text-[10px] text-zinc-600">
                                {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Chat Prompt */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAction(`/ask ${agent.id} give me a full ${agent.title.toLowerCase()} report`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium text-sm transition-all"
                    style={{
                      background: `${agent.color}15`,
                      color: agent.color,
                      border: `1px solid ${agent.color}25`,
                    }}
                  >
                    <ArrowRight size={16} />
                    <span>Ask {agent.name} for a Full Report</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
