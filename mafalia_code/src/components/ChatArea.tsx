import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '../types'
import {
  Send, Loader2, Sparkles, Cpu, Zap, Slash,
  BarChart3, TrendingUp, Network, MessageSquare,
  Paperclip, FolderOpen, Wand2, Palette, Compass, Globe,
  Repeat, Crown
} from 'lucide-react'

const QUICK_ACTIONS = [
  { label: 'Business Summary', cmd: '/summary', icon: BarChart3, color: '#10b981', bg: '#10b98115' },
  { label: 'Analyze Revenue', cmd: '/analyze revenue', icon: TrendingUp, color: '#3b82f6', bg: '#3b82f615' },
  { label: 'Create Campaign', cmd: '/create campaign', icon: Wand2, color: '#f97316', bg: '#f9731615' },
  { label: 'Research Trends', cmd: '/research trends', icon: Compass, color: '#06b6d4', bg: '#06b6d415' },
  { label: 'Predict Growth', cmd: '/predict growth', icon: TrendingUp, color: '#9b5de5', bg: '#9b5de515' },
  { label: 'Boss Dashboard', cmd: '/boss', icon: Crown, color: '#f59e0b', bg: '#f59e0b15' },
]

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  currentModel?: string
  onSendMessage: (content: string) => void
  onCommandPaletteOpen: () => void
  pendingInput?: string
  onPendingInputConsumed?: () => void
  onAgentGridOpen?: () => void
}

function ChatArea({ messages, isLoading, currentModel, onSendMessage, onCommandPaletteOpen, pendingInput, onPendingInputConsumed, onAgentGridOpen }: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isWelcome = messages.length === 0 || (messages.length === 1 && (!messages[0].content || messages[0].id === 'welcome'))

  const setInputAndFocus = (text: string) => {
    setInput(text)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input)
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val === '/' && input === '') {
      onCommandPaletteOpen()
      return
    }
    setInput(val)
  }

  // Parse inline markdown: **bold** and `code`
  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0
    while (remaining.length > 0) {
      // Bold
      const boldIdx = remaining.indexOf('**')
      const codeIdx = remaining.indexOf('`')
      // Find whichever comes first
      const nextBold = boldIdx !== -1 ? boldIdx : Infinity
      const nextCode = codeIdx !== -1 ? codeIdx : Infinity

      if (nextBold === Infinity && nextCode === Infinity) {
        parts.push(remaining)
        break
      }

      if (nextBold <= nextCode) {
        if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx))
        const end = remaining.indexOf('**', boldIdx + 2)
        if (end === -1) { parts.push(remaining.slice(boldIdx)); break }
        parts.push(<strong key={key++} className="font-semibold text-zinc-100">{remaining.slice(boldIdx + 2, end)}</strong>)
        remaining = remaining.slice(end + 2)
      } else {
        if (codeIdx > 0) parts.push(remaining.slice(0, codeIdx))
        const end = remaining.indexOf('`', codeIdx + 1)
        if (end === -1) { parts.push(remaining.slice(codeIdx)); break }
        parts.push(<code key={key++} className="px-1.5 py-0.5 rounded bg-black/30 text-orange-300 text-xs font-mono border border-white/[0.06]">{remaining.slice(codeIdx + 1, end)}</code>)
        remaining = remaining.slice(end + 1)
      }
    }
    return parts
  }

  const formatContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeLines: string[] = []

    lines.forEach((line, i) => {
      // Code block toggle
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={i} className="font-mono text-xs bg-black/30 rounded-lg px-4 py-3 mt-2 mb-2 text-zinc-300 border border-white/[0.06] overflow-x-auto whitespace-pre-wrap">
              {codeLines.join('\n')}
            </pre>
          )
          codeLines = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
        }
        return
      }
      if (inCodeBlock) { codeLines.push(line); return }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-base font-bold text-orange-400 mt-4 mb-1.5">{parseInline(line.slice(4))}</h3>)
        return
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-lg font-bold text-zinc-100 mt-4 mb-1.5">{parseInline(line.slice(3))}</h2>)
        return
      }
      // Bullets
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const text = line.startsWith('• ') ? line.slice(2) : line.slice(2)
        elements.push(
          <div key={i} className="flex gap-2 mt-1 ml-1">
            <span className="text-zinc-500 shrink-0">•</span>
            <span className="text-zinc-300">{parseInline(text)}</span>
          </div>
        )
        return
      }
      // Empty
      if (line.trim() === '') { elements.push(<div key={i} className="h-2" />); return }
      // Normal line with inline formatting
      elements.push(<p key={i} className="text-zinc-300 mt-1 leading-relaxed">{parseInline(line)}</p>)
    })

    // Close unclosed code block
    if (inCodeBlock && codeLines.length > 0) {
      elements.push(
        <pre key="code-end" className="font-mono text-xs bg-black/30 rounded-lg px-4 py-3 mt-2 text-zinc-300 border border-white/[0.06] overflow-x-auto whitespace-pre-wrap">
          {codeLines.join('\n')}
        </pre>
      )
    }

    return elements
  }

  const getAgentColor = (tag?: string) => {
    if (!tag) return '#f97316'
    const colors: Record<string, string> = {
      '[REV]': '#f97316', '[OPS]': '#06b6d4', '[CUS]': '#ec4899',
      '[INV]': '#10b981', '[MKT]': '#f59e0b', '[FIN]': '#8b5cf6',
      '[DAT]': '#14b8a6', '[TEC]': '#ef4444', '[GRO]': '#a855f7',
      '[PAR]': '#22c55e', '[MAF]': '#f97316', '[ERR]': '#ef4444',
    }
    return colors[tag] || '#f97316'
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0a0e14]">
      {/* Model indicator */}
      <AnimatePresence>
        {currentModel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.08]">
              <Cpu size={14} className="text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">{currentModel.split('/').pop()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
        <div className="max-w-3xl mx-auto">

          {isWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[60vh] pt-8"
            >
              {/* Hero */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 25 }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-2xl scale-150" />
                <img
                  src="/mafalia-logo.png"
                  alt="Mafalia"
                  className="relative w-16 h-16 object-contain"
                />
              </motion.div>
              <h1 className="text-[28px] font-bold text-zinc-100 mb-2 tracking-tight">
                Your AI Business Command Center
              </h1>
              <p className="text-zinc-500 text-sm mb-2 max-w-lg text-center leading-relaxed">
                10 specialized agents. One boss. Analyze, predict, create, automate — all from one place.
              </p>
              <p className="text-zinc-600 text-xs mb-8">
                Type a question, use a quick action, or press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono border border-white/[0.08] text-zinc-400">/</kbd> for commands
              </p>

              {/* Quick Action Grid */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-xl">
                {QUICK_ACTIONS.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.cmd}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.04, type: 'spring', damping: 22, stiffness: 300 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSendMessage(action.cmd)}
                      className="flex flex-col items-center gap-2.5 px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: action.bg, border: `1px solid ${action.color}20` }}
                      >
                        <Icon size={18} style={{ color: action.color }} />
                      </div>
                      <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{action.label}</span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Agent indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center gap-1.5"
              >
                {['#FF6B35','#2E86AB','#A23B72','#1B998B','#F77F00','#6C5B7B','#2D6A4F','#E63946','#9B5DE5','#06D6A0'].map((c, i) => (
                  <motion.div
                    key={c}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.65 + i * 0.03, type: 'spring', damping: 20 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: c, opacity: 0.6 }}
                  />
                ))}
                <span className="text-[10px] text-zinc-600 ml-2">10 agents ready</span>
              </motion.div>
            </motion.div>
          )}

          {/* Messages */}
          {!isWelcome && (
            <div className="space-y-6">
              {messages.map((msg) => {
                const color = getAgentColor(msg.agentTag)
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="group"
                  >
                    {msg.role === 'user' && (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[11px] text-zinc-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-xs font-semibold text-zinc-400">You</span>
                        </div>
                        <div className="bg-blue-600/80 backdrop-blur-sm rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] border border-blue-500/20">
                          <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-2 px-1">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                          >
                            {msg.agentTag === '[MAF]' ? <Sparkles size={12} style={{ color }} /> :
                             msg.agentTag === '[ERR]' ? <Zap size={12} style={{ color }} /> :
                             <span className="text-[10px] font-bold" style={{ color }}>{msg.agentTag?.slice(1, 4)}</span>}
                          </div>
                          <span className="text-xs font-semibold" style={{ color }}>
                            {msg.agentTag || 'MAF'}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] bg-zinc-800/50 backdrop-blur-sm border border-white/[0.07]">
                          <div className="text-sm leading-relaxed text-zinc-200">
                            {formatContent(msg.content)}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}

              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 text-zinc-400 px-2"
                  >
                    <div className="w-6 h-6 rounded-lg bg-zinc-800/60 flex items-center justify-center border border-white/[0.08]">
                      <Loader2 size={14} className="animate-spin text-orange-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-300">Mafalia is thinking...</span>
                      <span className="text-xs text-zinc-500">Selecting optimal model</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar — Script.io inspired with action row */}
      <div className="border-t border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-black/30 rounded-2xl border border-white/[0.08] backdrop-blur-sm focus-within:border-orange-500/30 transition-all overflow-hidden">
            <div className="flex items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your business..."
                className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm px-5 py-4 resize-none outline-none min-h-[52px] max-h-[120px]"
                rows={1}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="mr-3 mb-3 p-2.5 rounded-xl bg-orange-600/90 hover:bg-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send size={16} className="text-white" />
              </motion.button>
            </div>

            <div className="flex items-center gap-0.5 px-3 pb-2.5 pt-0">
              <ActionChip icon={Paperclip} label="Attach" onClick={() => setInputAndFocus('/browse ')} />
              <ActionChip icon={Slash} label="Commands" onClick={onCommandPaletteOpen} />
              <ActionChip icon={FolderOpen} label="Find CSVs" onClick={() => setInputAndFocus('/csvs ')} />
              <div className="flex-1" />
              <span className="text-[11px] text-zinc-600 tabular-nums select-none">{input.length}</span>
            </div>
          </div>
        
        </div>
      </div>
    </div>
  )
}

function ActionChip({ icon: Icon, label, onClick }: { icon: React.ComponentType<any>; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors text-xs"
    >
      <Icon size={13} />
      <span>{label}</span>
    </motion.button>
  )
}

export default ChatArea
