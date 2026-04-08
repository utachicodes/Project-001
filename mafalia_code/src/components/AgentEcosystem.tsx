import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Agent, AgentStatus, AgentTask } from '../types'
import {
  DollarSign, Cog, Heart, Package, Megaphone,
  PiggyBank, BarChart2, Wrench, Rocket, Handshake,
  X, Crown, Eye, Clock, CheckCircle2, AlertTriangle,
  Loader2, Circle, ChevronDown, ChevronRight, Play,
  Send, ListChecks
} from 'lucide-react'

const AGENT_ICONS: Record<string, React.ComponentType<any>> = {
  zara: DollarSign, kofi: Cog, amara: Heart, idris: Package, nala: Megaphone,
  tariq: PiggyBank, sana: BarChart2, ravi: Wrench, luna: Rocket, omar: Handshake,
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
  idle: { label: 'Idle', color: '#71717a', icon: Circle },
  working: { label: 'Working', color: '#f59e0b', icon: Loader2 },
  reporting: { label: 'Reporting', color: '#3b82f6', icon: Send },
  error: { label: 'Error', color: '#ef4444', icon: AlertTriangle },
  offline: { label: 'Offline', color: '#3f3f46', icon: Circle },
}

interface BossLog {
  id: string
  timestamp: string
  type: 'dispatch' | 'check' | 'alert' | 'report'
  message: string
  agentId?: string
}

interface AgentEcosystemProps {
  agents: Agent[]
  isOpen: boolean
  onClose: () => void
  onAgentClick: (agentId: string) => void
  onSendMessage: (content: string) => void
}

export default function AgentEcosystem({ agents, isOpen, onClose, onAgentClick, onSendMessage }: AgentEcosystemProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [bossLogs, setBossLogs] = useState<BossLog[]>([])
  const [agentStates, setAgentStates] = useState<Record<string, { status: AgentStatus; task?: AgentTask; taskHistory: AgentTask[] }>>({})
  const [bossThinking, setBossThinking] = useState(false)

  // Initialize agent states
  useEffect(() => {
    if (!isOpen) return
    const initial: Record<string, { status: AgentStatus; task?: AgentTask; taskHistory: AgentTask[] }> = {}
    agents.forEach(a => {
      initial[a.id] = {
        status: a.status || 'idle',
        task: a.currentTask,
        taskHistory: a.taskHistory || [],
      }
    })
    setAgentStates(initial)
    setBossLogs([{
      id: '0',
      timestamp: new Date().toISOString(),
      type: 'report',
      message: 'Boss online. All 10 agent rooms monitored.',
    }])
  }, [isOpen, agents])

  const addBossLog = useCallback((type: BossLog['type'], message: string, agentId?: string) => {
    setBossLogs(prev => [{
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      agentId,
      message,
    }, ...prev].slice(0, 30))
  }, [])

  const setAgentStatus = useCallback((agentId: string, status: AgentStatus, task?: AgentTask) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        status,
        task: task || prev[agentId]?.task,
        taskHistory: prev[agentId]?.taskHistory || [],
      },
    }))
  }, [])

  const completeAgentTask = useCallback((agentId: string, result: string) => {
    setAgentStates(prev => {
      const state = prev[agentId]
      if (!state?.task) return prev
      const completed: AgentTask = { ...state.task, status: 'done', completedAt: new Date().toISOString(), result }
      return {
        ...prev,
        [agentId]: {
          status: 'idle' as AgentStatus,
          task: undefined,
          taskHistory: [completed, ...state.taskHistory].slice(0, 10),
        },
      }
    })
  }, [])

  // Boss check-in cycle — simulates the boss monitoring agents
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      const idleAgents = agents.filter(a => agentStates[a.id]?.status === 'idle')
      const workingAgents = agents.filter(a => agentStates[a.id]?.status === 'working')

      // Occasionally dispatch a task to an idle agent
      if (idleAgents.length > 0 && Math.random() > 0.5) {
        const target = idleAgents[Math.floor(Math.random() * idleAgents.length)]
        const tasks = [
          `Scan latest ${target.room} data`,
          `Prepare ${target.title.toLowerCase()} brief`,
          `Check ${target.room} metrics`,
          `Review pending ${target.tag} items`,
        ]
        const desc = tasks[Math.floor(Math.random() * tasks.length)]
        const task: AgentTask = { id: Date.now().toString(), description: desc, status: 'running', startedAt: new Date().toISOString() }
        setAgentStatus(target.id, 'working', task)
        addBossLog('dispatch', `Assigned: "${desc}" to ${target.name}`, target.id)
      }

      // Complete a working agent's task
      if (workingAgents.length > 0 && Math.random() > 0.4) {
        const target = workingAgents[Math.floor(Math.random() * workingAgents.length)]
        completeAgentTask(target.id, 'Task completed successfully')
        setAgentStatus(target.id, 'reporting')
        addBossLog('report', `${target.name} finished task in ${target.room}`, target.id)
        // After reporting, go idle
        setTimeout(() => {
          setAgentStatus(target.id, 'idle')
        }, 2000)
      }

      // Boss check-in
      if (Math.random() > 0.7) {
        const checkAgent = agents[Math.floor(Math.random() * agents.length)]
        addBossLog('check', `Checked on ${checkAgent.name} in ${checkAgent.room}`, checkAgent.id)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [isOpen, agents, agentStates, setAgentStatus, completeAgentTask, addBossLog])

  const handleBossDispatch = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    setBossThinking(true)
    const task: AgentTask = {
      id: Date.now().toString(),
      description: `Full ${agent.title.toLowerCase()} analysis`,
      status: 'running',
      startedAt: new Date().toISOString(),
    }
    setAgentStatus(agentId, 'working', task)
    addBossLog('dispatch', `Boss dispatched ${agent.name} for full analysis`, agentId)
    setTimeout(() => setBossThinking(false), 800)

    // Actually send the command
    onSendMessage(`/ask ${agentId} give me a full ${agent.title.toLowerCase()} report`)
    setTimeout(() => {
      completeAgentTask(agentId, 'Analysis sent to chat')
      setAgentStatus(agentId, 'idle')
      addBossLog('report', `${agent.name} analysis delivered`, agentId)
    }, 3000)
  }

  const workingCount = Object.values(agentStates).filter(s => s.status === 'working').length
  const idleCount = Object.values(agentStates).filter(s => s.status === 'idle').length
  const totalTasks = Object.values(agentStates).reduce((sum, s) => sum + s.taskHistory.length, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-4 z-40 flex items-start justify-center pt-8 pointer-events-none overflow-y-auto"
          >
            <div className="w-full max-w-6xl pointer-events-auto pb-8">

              {/* Boss Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <Crown size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">Agent Ecosystem</h2>
                    <p className="text-xs text-zinc-500">Boss is monitoring all rooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> {workingCount} working</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-zinc-600" /> {idleCount} idle</span>
                    <span className="flex items-center gap-1.5"><ListChecks size={12} /> {totalTasks} done</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
                  >
                    <X size={18} className="text-zinc-400" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_300px] gap-4">
                {/* Agent Rooms Grid */}
                <div className="space-y-2">
                  {agents.map((agent, i) => {
                    const Icon = AGENT_ICONS[agent.id] || Circle
                    const state = agentStates[agent.id] || { status: 'idle' as AgentStatus, taskHistory: [] }
                    const statusCfg = STATUS_CONFIG[state.status]
                    const StatusIcon = statusCfg.icon
                    const isExpanded = expandedAgent === agent.id

                    return (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, type: 'spring', damping: 22, stiffness: 300 }}
                      >
                        {/* Room row */}
                        <div
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer group"
                          style={{
                            background: state.status === 'working' ? `${agent.color}08` : 'rgba(255,255,255,0.015)',
                            borderColor: state.status === 'working' ? `${agent.color}20` : 'rgba(255,255,255,0.05)',
                          }}
                          onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                        >
                          {/* Icon */}
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${agent.color}15` }}
                          >
                            <Icon size={16} style={{ color: agent.color }} />
                          </div>

                          {/* Name + Room */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-200">{agent.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500">{agent.room}</span>
                            </div>
                            {state.task && state.status === 'working' ? (
                              <p className="text-xs text-zinc-500 truncate mt-0.5">{state.task.description}</p>
                            ) : (
                              <p className="text-xs text-zinc-600 mt-0.5">{agent.title}</p>
                            )}
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: `${statusCfg.color}12` }}>
                              <StatusIcon
                                size={12}
                                style={{ color: statusCfg.color }}
                                className={state.status === 'working' ? 'animate-spin' : ''}
                              />
                              <span className="text-[11px] font-medium" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                            </div>
                            {isExpanded ? <ChevronDown size={14} className="text-zinc-600" /> : <ChevronRight size={14} className="text-zinc-600" />}
                          </div>
                        </div>

                        {/* Expanded room detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 py-3 ml-12 border-l border-white/[0.06] space-y-3">
                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); handleBossDispatch(agent.id) }}
                                    disabled={state.status === 'working'}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-30 transition-all"
                                  >
                                    <Play size={11} /> Boss: Dispatch
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); onAgentClick(agent.id); onClose() }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08] transition-all"
                                  >
                                    <Eye size={11} /> Direct Chat
                                  </motion.button>
                                </div>

                                {/* Task History */}
                                {state.taskHistory.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Recent tasks</span>
                                    {state.taskHistory.slice(0, 3).map(t => (
                                      <div key={t.id} className="flex items-center gap-2 text-xs text-zinc-500">
                                        <CheckCircle2 size={11} className="text-emerald-500/60 shrink-0" />
                                        <span className="truncate">{t.description}</span>
                                        {t.completedAt && (
                                          <span className="text-[10px] text-zinc-600 shrink-0 ml-auto">
                                            {new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {state.taskHistory.length === 0 && (
                                  <p className="text-xs text-zinc-600">No tasks completed yet. Dispatch this agent to get started.</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Boss Activity Log */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 shrink-0">
                    <Crown size={14} className="text-amber-400" />
                    <span className="text-xs font-semibold text-zinc-300">Boss Log</span>
                    {bossThinking && <Loader2 size={12} className="text-amber-400 animate-spin ml-auto" />}
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
                    {bossLogs.map(log => {
                      const agent = log.agentId ? agents.find(a => a.id === log.agentId) : null
                      const typeColor = log.type === 'dispatch' ? '#f59e0b' : log.type === 'alert' ? '#ef4444' : log.type === 'report' ? '#3b82f6' : '#71717a'
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 py-1.5"
                        >
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: typeColor }} />
                          <div className="min-w-0">
                            <p className="text-[11px] text-zinc-400 leading-snug">{log.message}</p>
                            <span className="text-[10px] text-zinc-600">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Boss quick actions */}
                  <div className="px-3 py-2.5 border-t border-white/[0.06] space-y-1.5 shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        addBossLog('dispatch', 'Boss initiated full business sweep across all rooms')
                        onSendMessage('/summary')
                        agents.forEach((a, i) => {
                          setTimeout(() => {
                            setAgentStatus(a.id, 'working', {
                              id: Date.now().toString() + i,
                              description: `Business sweep: ${a.room}`,
                              status: 'running',
                              startedAt: new Date().toISOString(),
                            })
                          }, i * 300)
                          setTimeout(() => {
                            completeAgentTask(a.id, 'Sweep complete')
                            setAgentStatus(a.id, 'idle')
                          }, 5000 + i * 500)
                        })
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15 hover:bg-amber-500/20 transition-all"
                    >
                      <Crown size={12} /> Full Business Sweep
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        addBossLog('check', 'Boss checking all rooms...')
                        agents.forEach(a => {
                          const s = agentStates[a.id]?.status || 'idle'
                          addBossLog('check', `${a.name} in ${a.room}: ${s}`, a.id)
                        })
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08] transition-all"
                    >
                      <Eye size={12} /> Check All Rooms
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
