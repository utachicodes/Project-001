import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '../types'
import {
  Send, Sparkles, Slash,
  BarChart3, TrendingUp, Wand2, Compass,
  Paperclip, FolderOpen, Crown,
  Cpu,
} from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Business Health', cmd: '/summary',         icon: BarChart3,  color: 'var(--accent-violet)', bg: 'hsla(258, 90%, 66%, 0.08)'  },
  { label: 'Revenue Pulse',    cmd: '/analyze revenue', icon: TrendingUp,  color: 'var(--accent-cyan)',   bg: 'hsla(188, 86%, 53%, 0.08)'   },
  { label: 'Campaign Forge',   cmd: '/create campaign', icon: Wand2,      color: 'var(--primary)',       bg: 'var(--primary-soft)'  },
  { label: 'Market Intel',     cmd: '/research trends', icon: Compass,    color: 'var(--accent-emerald)', bg: 'hsla(158, 64%, 52%, 0.08)'   },
  { label: 'Growth Oracle',    cmd: '/predict growth',  icon: TrendingUp, color: 'var(--accent-violet)', bg: 'hsla(258, 90%, 66%, 0.08)'  },
  { label: 'Boss View',        cmd: '/boss',            icon: Crown,      color: 'hsl(35, 92%, 52%)',    bg: 'hsla(35, 92%, 52%, 0.1)'  },
]

const AGENT_COLORS: Record<string, string> = {
  '[REV]': 'var(--primary)',
  '[OPS]': 'var(--accent-cyan)',
  '[CUS]': 'var(--accent-violet)',
  '[INV]': 'var(--accent-emerald)',
  '[MKT]': 'var(--primary)',
  '[FIN]': 'hsl(265, 80%, 60%)',
  '[DAT]': 'var(--accent-emerald)',
  '[TEC]': 'var(--primary)',
  '[GRO]': 'var(--accent-violet)',
  '[PAR]': 'var(--accent-cyan)',
  '[MAF]': 'var(--primary)',
  '[ERR]': 'hsl(0, 84%, 60%)',
}

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  currentModel?: string
  onSendMessage: (content: string) => void
  onCommandPaletteOpen: () => void
  pendingInput?: string
  onPendingInputConsumed?: () => void
}

export default function ChatArea({
  messages, isLoading, currentModel, onSendMessage,
  onCommandPaletteOpen, pendingInput, onPendingInputConsumed,
}: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isWelcome = messages.length === 0 || (messages.length === 1 && (!messages[0].content || messages[0].id === 'welcome'))

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (pendingInput) {
      setInput(pendingInput + ' ')
      onPendingInputConsumed?.()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [pendingInput])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val === '/' && input === '') { onCommandPaletteOpen(); return }
    setInput(val)
  }

  // ── Markdown Parser ─────────────────────────────────────────────
  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0
    while (remaining.length > 0) {
      const boldIdx  = remaining.indexOf('**')
      const codeIdx  = remaining.indexOf('`')
      const nextBold = boldIdx !== -1 ? boldIdx : Infinity
      const nextCode = codeIdx !== -1 ? codeIdx : Infinity
      if (nextBold === Infinity && nextCode === Infinity) { parts.push(remaining); break }
      if (nextBold <= nextCode) {
        if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx))
        const end = remaining.indexOf('**', boldIdx + 2)
        if (end === -1) { parts.push(remaining.slice(boldIdx)); break }
        parts.push(<strong key={key++} className="font-extrabold text-slate-900">{remaining.slice(boldIdx + 2, end)}</strong>)
        remaining = remaining.slice(end + 2)
      } else {
        if (codeIdx > 0) parts.push(remaining.slice(0, codeIdx))
        const end = remaining.indexOf('`', codeIdx + 1)
        if (end === -1) { parts.push(remaining.slice(codeIdx)); break }
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 rounded-md text-[11.5px] font-mono bg-slate-100 text-primary border border-slate-200">
            {remaining.slice(codeIdx + 1, end)}
          </code>
        )
        remaining = remaining.slice(end + 1)
      }
    }
    return parts
  }

  const formatContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeLang = ''
    let codeLines: string[] = []

    lines.forEach((line, i) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={i} className="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-bottom border-slate-100">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">{codeLang || 'code'}</span>
              </div>
              <pre className="font-mono text-[13px] px-5 py-4 text-slate-800 overflow-x-auto bg-white whitespace-pre-wrap leading-relaxed">
                {codeLines.join('\n')}
              </pre>
            </div>
          )
          codeLines = []; codeLang = ''; inCodeBlock = false
        } else {
          codeLang = line.slice(3).trim()
          inCodeBlock = true
        }
        return
      }
      if (inCodeBlock) { codeLines.push(line); return }

      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-[16px] font-extrabold text-slate-900 mt-6 mb-2 tracking-tight">{parseInline(line.slice(4))}</h3>)
        return
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-[18px] font-black text-slate-900 mt-7 mb-3 tracking-tight">{parseInline(line.slice(3))}</h2>)
        return
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        elements.push(
          <div key={i} className="flex gap-3 mt-2 ml-1">
            <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary opacity-40" />
            <span className="text-slate-600 leading-relaxed text-[14px] font-medium">{parseInline(line.slice(2))}</span>
          </div>
        )
        return
      }
      if (line.trim() === '') { elements.push(<div key={i} className="h-3" />); return }
      elements.push(<p key={i} className="text-slate-600 leading-relaxed text-[14px] font-medium mt-1.5">{parseInline(line)}</p>)
    })

    if (inCodeBlock && codeLines.length > 0) {
      elements.push(
        <pre key="code-end" className="my-4 rounded-xl font-mono text-[13px] px-5 py-4 text-slate-800 overflow-x-auto bg-white border border-slate-200 shadow-sm whitespace-pre-wrap leading-relaxed">
          {codeLines.join('\n')}
        </pre>
      )
    }
    return elements
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden" style={{ background: 'var(--bg-app)' }}>

      {/* Active model badge */}
      <AnimatePresence>
        {currentModel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-900 shadow-2xl shadow-slate-200 border border-slate-800">
              <Cpu size={14} className="text-primary" />
              <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">
                {currentModel.split('/').pop()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Message / Welcome Area ─────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-10" style={{ scrollbarWidth: 'thin' }}>
        <div className="max-w-3xl mx-auto">

          {/* Welcome screen */}
          {isWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center min-h-[60vh] pt-4"
            >
              {/* Hero logo */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                className="relative mb-8"
              >
                <div className="relative w-20 h-20 rounded-[20px] flex items-center justify-center bg-[#E63946] shadow-2xl shadow-red-200">
                  <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12">
                    <path d="M4 18l4-12 4 12M12 18l4-12 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[36px] font-black text-slate-900 mb-3 tracking-tight text-center leading-tight"
              >
                Mafalia <span className="text-[#E63946]">Intelligence</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 text-[15px] font-medium mb-12 max-w-lg text-center leading-relaxed"
              >
                Your complete business command center. Orchestrate 10 specialized agents to analyze, predict, and automate your growth.
              </motion.p>

              {/* Quick action grid */}
              <div className="grid grid-cols-3 gap-3.5 w-full max-w-[540px]">
                {QUICK_ACTIONS.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.cmd}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05, type: 'spring', damping: 25 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSendMessage(action.cmd)}
                      className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl transition-all group border border-transparent shadow-sm hover:shadow-lg hover:bg-white"
                      style={{ background: action.bg, borderColor: `${action.color}20` }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        <Icon size={18} style={{ color: action.color }} />
                      </div>
                      <span className="text-[12.5px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors text-center leading-tight">
                        {action.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Agent status row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm"
              >
                <div className="flex -space-x-1.5">
                  {Object.values(AGENT_COLORS).slice(0, 5).map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Platform Core Ready</span>
                <div className="status-dot status-online" />
              </motion.div>
            </motion.div>
          )}

          {/* Messages */}
          {!isWelcome && (
            <div className="space-y-8 pb-8">
              {messages.map((msg) => {
                const color = AGENT_COLORS[msg.agentTag || ''] || 'var(--primary)'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  >
                    {msg.role === 'user' && (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2.5 mb-2 px-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[12px] font-black text-slate-800">Admin</span>
                        </div>
                        <div className="px-6 py-4 rounded-3xl rounded-tr-md max-w-[82%] bg-slate-900 text-white shadow-xl">
                          <p className="text-[14.5px] font-medium leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-2.5 px-1">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
                               style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                            {msg.agentTag === '[MAF]'
                              ? <Sparkles size={12} style={{ color }} />
                              : <span className="text-[11px] font-black" style={{ color }}>{msg.agentTag?.slice(1, 4)}</span>}
                          </div>
                          <span className="text-[13px] font-black tracking-tight" style={{ color }}>
                            {msg.agentTag?.replace('[','').replace(']','') || 'MAFALIA'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="px-7 py-5 rounded-3xl rounded-tl-md max-w-[94%] bg-white border border-slate-100 shadow-lg shadow-slate-100/50 border-l-[4px]"
                             style={{ borderLeftColor: color }}>
                          <div className="text-[14.5px] text-slate-700 leading-relaxed font-medium">
                            {formatContent(msg.content)}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3.5 px-2"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100 shadow-sm">
                      <Sparkles size={12} className="text-primary animate-pulse" />
                    </div>
                    <div className="px-5 py-3.5 rounded-2xl rounded-tl-md bg-white border border-slate-100 shadow-sm border-l-2 border-primary">
                      <div className="flex items-center gap-2">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input Bar ─────────────────────────── */}
      <div className="px-8 py-8 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-violet-500 rounded-3xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-primary/40 transition-all shadow-lg shadow-slate-100">
              <div className="flex items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Execute command or ask anything…"
                  className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-[15px] font-semibold px-6 py-5 resize-none outline-none leading-relaxed"
                  style={{ minHeight: '60px', maxHeight: '160px' }}
                  rows={1}
                />
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  className="mr-4 mb-4 p-4 rounded-2xl transition-all disabled:opacity-20 bg-slate-900 shadow-xl"
                >
                  <Send size={18} className="text-white" />
                </motion.button>
              </div>

              {/* Action chips */}
              <div className="flex items-center gap-1.5 px-4 pb-3.5 pt-0 border-t border-slate-100/50">
                <Chip icon={Paperclip} label="Files"   onClick={() => { setInput('/browse '); inputRef.current?.focus() }} />
                <Chip icon={Slash}     label="Actions" onClick={onCommandPaletteOpen} />
                <Chip icon={FolderOpen} label="CSVs"    onClick={() => { setInput('/csvs '); inputRef.current?.focus() }} />
                <div className="flex-1" />
                <span className="text-[11px] font-bold text-slate-300 tabular-nums select-none tracking-widest px-3">{input.length}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] font-extrabold text-slate-300 uppercase tracking-[0.2em] select-none">
            Mafalia Intelligence Platform v1.0
          </p>
        </div>
      </div>
    </div>
  )
}

function Chip({ icon: Icon, label, onClick }: { icon: React.ComponentType<any>; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -1, background: 'white', borderColor: 'var(--border)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 transition-all text-[12px] font-bold border border-transparent"
    >
      <Icon size={14} className="opacity-60" />
      <span>{label}</span>
    </motion.button>
  )
}

