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
  { label: 'Business Summary', cmd: '/summary',         icon: BarChart3,  color: '#7C3AED', bg: 'rgba(124,58,237,0.12)'  },
  { label: 'Analyze Revenue',  cmd: '/analyze revenue', icon: TrendingUp, color: '#00D4FF', bg: 'rgba(0,212,255,0.10)'   },
  { label: 'Create Campaign',  cmd: '/create campaign', icon: Wand2,      color: '#A855F7', bg: 'rgba(168,85,247,0.12)'  },
  { label: 'Research Trends',  cmd: '/research trends', icon: Compass,    color: '#06B6D4', bg: 'rgba(6,182,212,0.10)'   },
  { label: 'Predict Growth',   cmd: '/predict growth',  icon: TrendingUp, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  { label: 'Boss Dashboard',   cmd: '/boss',            icon: Crown,      color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
]

const AGENT_COLORS: Record<string, string> = {
  '[REV]': '#FF6B35', '[OPS]': '#2E86AB', '[CUS]': '#A23B72',
  '[INV]': '#1B998B', '[MKT]': '#F77F00', '[FIN]': '#6C5B7B',
  '[DAT]': '#2D6A4F', '[TEC]': '#E63946', '[GRO]': '#9B5DE5',
  '[PAR]': '#06D6A0', '[MAF]': '#7C3AED', '[ERR]': '#EF4444',
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
        parts.push(<strong key={key++} className="font-semibold text-slate-100">{remaining.slice(boldIdx + 2, end)}</strong>)
        remaining = remaining.slice(end + 2)
      } else {
        if (codeIdx > 0) parts.push(remaining.slice(0, codeIdx))
        const end = remaining.indexOf('`', codeIdx + 1)
        if (end === -1) { parts.push(remaining.slice(codeIdx)); break }
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 rounded-md text-xs font-mono"
                style={{ background: 'rgba(124,58,237,0.18)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.2)' }}>
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
            <div key={i} className="my-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{codeLang || 'code'}</span>
              </div>
              <pre className="font-mono text-[12.5px] px-4 py-3 text-slate-300 overflow-x-auto"
                   style={{ background: 'rgba(0,0,0,0.35)', whiteSpace: 'pre-wrap' }}>
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
        elements.push(<h3 key={i} className="text-[15px] font-bold mt-4 mb-1.5" style={{ color: '#A78BFA' }}>{parseInline(line.slice(4))}</h3>)
        return
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-base font-bold text-slate-100 mt-5 mb-2">{parseInline(line.slice(3))}</h2>)
        return
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        elements.push(
          <div key={i} className="flex gap-2 mt-1.5 ml-2">
            <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(124,58,237,0.7)' }} />
            <span className="text-slate-300 leading-relaxed text-[13.5px]">{parseInline(line.slice(2))}</span>
          </div>
        )
        return
      }
      if (line.trim() === '') { elements.push(<div key={i} className="h-2" />); return }
      elements.push(<p key={i} className="text-slate-300 leading-relaxed text-[13.5px] mt-1">{parseInline(line)}</p>)
    })

    if (inCodeBlock && codeLines.length > 0) {
      elements.push(
        <pre key="code-end" className="my-3 rounded-xl font-mono text-[12.5px] px-4 py-3 text-slate-300 overflow-x-auto"
             style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'pre-wrap' }}>
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
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 shadow-xl">
              <Cpu size={12} className="text-blue-400" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                {currentModel.split('/').pop()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Message / Welcome Area ─────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: 'thin' }}>
        <div className="max-w-3xl mx-auto">

          {/* Welcome screen */}
          {isWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[64vh] pt-8"
            >
              {/* Hero logo */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 22 }}
                className="relative mb-6"
              >
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-[#E63946] shadow-xl shadow-red-100">
                  <svg viewBox="0 0 24 24" fill="white" className="w-10 h-10"><path d="M12 2L2 22h4l6-12 6 12h4L12 2z"/></svg>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[32px] font-black text-slate-900 mb-2 tracking-tight text-center"
              >
                Mafalia <span className="text-[#E63946]">Intelligence</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="text-slate-500 text-[13.5px] mb-2 max-w-md text-center leading-relaxed"
              >
                10 specialized agents. One boss. Analyze, predict, create, automate — all from one platform.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-8 text-center"
              >
                Type a message or press{' '}
                <kbd className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-slate-900 font-mono">
                  /
                </kbd>{' '}
                for commands
              </motion.p>

              {/* Quick action grid */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-[480px]">
                {QUICK_ACTIONS.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.cmd}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05, type: 'spring', damping: 22 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSendMessage(action.cmd)}
                      className="flex flex-col items-center gap-2.5 px-3 py-4 rounded-2xl transition-all group"
                      style={{ background: action.bg, border: `1px solid ${action.color}20` }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = `${action.color}45`}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = `${action.color}20`}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                           style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}>
                        <Icon size={16} style={{ color: action.color }} />
                      </div>
                      <span className="text-[11.5px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors text-center leading-tight">
                        {action.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Agent dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex items-center gap-1.5"
              >
                {['#FF6B35','#2E86AB','#A23B72','#1B998B','#F77F00','#6C5B7B','#2D6A4F','#E63946','#9B5DE5','#06D6A0'].map((c, i) => (
                  <motion.div
                    key={c}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.72 + i * 0.03, type: 'spring', damping: 18 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: c, opacity: 0.7 }}
                  />
                ))}
                <span className="text-[10px] text-slate-600 ml-2">10 agents ready</span>
              </motion.div>
            </motion.div>
          )}

          {/* Messages */}
          {!isWelcome && (
            <div className="space-y-5 pb-4">
              {messages.map((msg) => {
                const color = AGENT_COLORS[msg.agentTag || ''] || '#7C3AED'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                  >
                    {msg.role === 'user' && (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-[11px] text-slate-600">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[12px] font-semibold text-slate-500">You</span>
                        </div>
                        <div className="px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[84%] bg-white border border-slate-200 shadow-sm">
                          <p className="text-[13.5px] text-slate-900 font-medium leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2.5 mb-2 px-1">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                               style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                            {msg.agentTag === '[MAF]'
                              ? <Sparkles size={11} style={{ color }} />
                              : <span className="text-[10px] font-bold" style={{ color }}>{msg.agentTag?.slice(1, 4)}</span>}
                          </div>
                          <span className="text-[12px] font-semibold" style={{ color }}>
                            {msg.agentTag || 'MAF'}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="px-5 py-4 rounded-2xl rounded-tl-sm max-w-[92%] bg-white border border-slate-200 border-l-[3px] shadow-sm"
                             style={{ borderLeftColor: color }}>
                          <div className="text-[13.5px] text-slate-700 leading-relaxed font-medium">
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-2"
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                         style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                      <Sparkles size={11} style={{ color: '#A78BFA' }} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '2px solid rgba(124,58,237,0.4)' }}>
                      <div className="flex items-center gap-1.5">
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
      <div className="px-6 py-6 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-400 transition-all shadow-sm">
            <div className="flex items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Mafalia intelligence…"
                className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-[14px] font-medium px-5 py-4 resize-none outline-none leading-relaxed"
                style={{ minHeight: '52px', maxHeight: '140px' }}
                rows={1}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="mr-3 mb-3 p-3 rounded-xl transition-all disabled:opacity-25 bg-slate-900 shadow-lg"
              >
                <Send size={16} className="text-white" />
              </motion.button>
            </div>

            {/* Action chips */}
            <div className="flex items-center gap-0.5 px-3 pb-2.5 pt-0 border-t border-slate-100">
              <Chip icon={Paperclip} label="Attach"   onClick={() => { setInput('/browse '); inputRef.current?.focus() }} />
              <Chip icon={Slash}     label="Commands" onClick={onCommandPaletteOpen} />
              <Chip icon={FolderOpen} label="Find CSVs" onClick={() => { setInput('/csvs '); inputRef.current?.focus() }} />
              <div className="flex-1" />
              <span className="text-[11px] text-slate-700 tabular-nums select-none">{input.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ icon: Icon, label, onClick }: { icon: React.ComponentType<any>; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-colors text-[11.5px]"
    >
      <Icon size={12} />
      <span>{label}</span>
    </motion.button>
  )
}
