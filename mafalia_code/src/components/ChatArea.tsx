import { useState, useRef, useEffect } from 'react'
import { Message } from '../types'
import { Send, Loader2 } from 'lucide-react'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (content: string) => void
}

function ChatArea({ messages, isLoading, onSendMessage }: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-mafalia-text mt-2">{line.slice(2, -2)}</p>
        }
        // Bullet points
        if (line.startsWith('• ')) {
          return <p key={i} className="text-mafalia-text ml-4 mt-1">{line}</p>
        }
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold text-mafalia-accent mt-4 mb-2">{line.slice(4)}</h3>
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-mafalia-text mt-4 mb-2">{line.slice(3)}</h2>
        }
        // Empty lines
        if (line.trim() === '') {
          return <div key={i} className="h-2" />
        }
        return <p key={i} className="text-mafalia-text mt-1 leading-relaxed">{line}</p>
      })
  }

  const getAgentColor = (tag?: string) => {
    if (!tag) return '#FF6B35'
    const colors: Record<string, string> = {
      '[REV]': '#FF6B35',
      '[OPS]': '#2E86AB',
      '[CUS]': '#A23B72',
      '[INV]': '#1B998B',
      '[MKT]': '#F77F00',
      '[FIN]': '#6C5B7B',
      '[DAT]': '#2D6A4F',
      '[TEC]': '#E63946',
      '[GRO]': '#9B5DE5',
      '[PAR]': '#06D6A0',
      '[MAF]': '#FF6B35',
    }
    return colors[tag] || '#FF6B35'
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-mafalia-bg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="group">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: msg.role === 'user' ? '#1F3A5F' : getAgentColor(msg.agentTag) + '20',
                    color: msg.role === 'user' ? '#E6EDF3' : getAgentColor(msg.agentTag),
                  }}
                >
                  {msg.role === 'user' ? 'You' : msg.agentTag || 'MAF'}
                </span>
                <span className="text-[11px] text-mafalia-text-dim">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Content */}
              <div
                className={`rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-mafalia-user ml-auto max-w-[85%]'
                    : 'bg-mafalia-ai max-w-[90%]'
                }`}
              >
                <div className="text-sm leading-relaxed">
                  {formatContent(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-mafalia-text-dim">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-mafalia-border bg-mafalia-sidebar px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-mafalia-input rounded-xl border border-mafalia-border focus-within:border-mafalia-accent transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your business... (Press / for commands)"
              className="flex-1 bg-transparent text-mafalia-text placeholder-mafalia-text-dim text-sm px-4 py-3.5 resize-none outline-none min-h-[52px] max-h-[120px]"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="mr-3 mb-2 p-2 rounded-lg bg-mafalia-accent hover:bg-mafalia-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
          <p className="text-[11px] text-mafalia-text-dim mt-2">
            Type <span className="font-mono bg-mafalia-input px-1 rounded">/</span> for commands • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatArea
