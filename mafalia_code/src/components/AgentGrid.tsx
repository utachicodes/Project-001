import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Agent } from '../types'
import {
  DollarSign, Cog, Heart, Package, Megaphone,
  PiggyBank, BarChart2, Wrench, Rocket, Handshake,
  X, Activity, Zap, ChevronRight, Circle
} from 'lucide-react'

const AGENT_ICONS: Record<string, React.ComponentType<any>> = {
  zara: DollarSign,
  kofi: Cog,
  amara: Heart,
  idris: Package,
  nala: Megaphone,
  tariq: PiggyBank,
  sana: BarChart2,
  ravi: Wrench,
  luna: Rocket,
  omar: Handshake,
}

interface AgentGridProps {
  agents: Agent[]
  isOpen: boolean
  onClose: () => void
  onAgentClick: (agentId: string) => void
  activeAgents?: string[]
}

export default function AgentGrid({ agents, isOpen, onClose, onAgentClick, activeAgents = [] }: AgentGridProps) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)
  const [pulseMap, setPulseMap] = useState<Record<string, boolean>>({})

  // Simulate agent activity pulses
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      setPulseMap(prev => ({ ...prev, [randomAgent.id]: true }))
      setTimeout(() => {
        setPulseMap(prev => ({ ...prev, [randomAgent.id]: false }))
      }, 2000)
    }, 3000)
    return () => clearInterval(interval)
  }, [isOpen, agents])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed inset-6 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-5xl pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                    <Activity size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Agent Network</h2>
                    <p className="text-xs text-zinc-500">10 specialized AI agents — click to interact</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
                >
                  <X size={20} className="text-zinc-400" />
                </motion.button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-3">
                {agents.map((agent, i) => {
                  const Icon = AGENT_ICONS[agent.id] || Zap
                  const isHovered = hoveredAgent === agent.id
                  const isPulsing = pulseMap[agent.id] || false
                  const isActive = activeAgents.includes(agent.id)

                  return (
                    <motion.button
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', damping: 20, stiffness: 300 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.97 }}
                      onHoverStart={() => setHoveredAgent(agent.id)}
                      onHoverEnd={() => setHoveredAgent(null)}
                      onClick={() => { onAgentClick(agent.id); onClose() }}
                      className="relative group text-left"
                    >
                      {/* Card */}
                      <div
                        className="relative rounded-2xl p-4 border backdrop-blur-sm overflow-hidden transition-all duration-300"
                        style={{
                          background: isHovered
                            ? `linear-gradient(135deg, ${agent.color}12, ${agent.color}06)`
                            : 'rgba(255,255,255,0.02)',
                          borderColor: isHovered ? `${agent.color}35` : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        {/* Pulse ring */}
                        <AnimatePresence>
                          {isPulsing && (
                            <motion.div
                              initial={{ opacity: 0.6, scale: 0.8 }}
                              animate={{ opacity: 0, scale: 2.5 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 2, ease: 'easeOut' }}
                              className="absolute top-3 right-3 w-3 h-3 rounded-full"
                              style={{ background: agent.color }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Status dot */}
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <Circle
                              size={8}
                              fill={isActive ? agent.color : '#3f3f46'}
                              color="transparent"
                            />
                            {isActive && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-full"
                                style={{ boxShadow: `0 0 6px ${agent.color}` }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Icon */}
                        <motion.div
                          className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                          style={{
                            background: `${agent.color}18`,
                            border: `1px solid ${agent.color}30`,
                          }}
                          animate={isHovered ? { rotate: [0, -5, 5, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <Icon size={20} style={{ color: agent.color }} />
                        </motion.div>

                        {/* Name & Title */}
                        <h3 className="text-sm font-bold text-zinc-100 mb-0.5">{agent.name}</h3>
                        <p className="text-[11px] text-zinc-500 leading-tight">{agent.title}</p>

                        {/* Tag */}
                        <div className="mt-3 flex items-center justify-between">
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                            style={{
                              background: `${agent.color}15`,
                              color: agent.color,
                              border: `1px solid ${agent.color}25`,
                            }}
                          >
                            {agent.tag}
                          </span>
                          <motion.div
                            animate={{ x: isHovered ? 0 : -4, opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <ChevronRight size={14} style={{ color: agent.color }} />
                          </motion.div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Bottom info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex items-center justify-center gap-6 text-[11px] text-zinc-600"
              >
                <span className="flex items-center gap-1.5">
                  <Circle size={6} fill="#10b981" color="transparent" />
                  Active
                </span>
                <span className="flex items-center gap-1.5">
                  <Circle size={6} fill="#3f3f46" color="transparent" />
                  Standby
                </span>
                <span>Click an agent to start a conversation</span>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
