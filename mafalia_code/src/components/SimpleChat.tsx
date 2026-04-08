import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, RefreshCw, User, Bot, Command, ExternalLink } from 'lucide-react'
import { Message } from '../types'

interface SimpleChatProps {
  messages: Message[]
  isLoading: boolean
  isConnected: boolean
  onSendMessage: (content: string) => void
  onConnect: () => void
  userName?: string
}

const SUGGESTIONS = [
  "How's my revenue this month?",
  "Show customer insights",
  "Check inventory levels",
  "Business health summary",
  "Recent orders",
]

function SimpleChat({ messages, isLoading, isConnected, onSendMessage, onConnect, userName }: SimpleChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Format message with simple markdown
  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-mafalia-text mt-2">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <p key={i} className="text-mafalia-text ml-4 mt-1">{line}</p>
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />
      }
      return <p key={i} className="text-mafalia-text mt-1 leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-mafalia-bg">
      {/* Connection Banner */}
      {!isConnected && (
        <div className="bg-mafalia-warning/10 border-b border-mafalia-warning/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-mafalia-warning" />
            <span className="text-sm text-mafalia-warning">Not connected to mafalia.com</span>
          </div>
          <button
            onClick={onConnect}
            className="px-3 py-1.5 bg-mafalia-accent text-white text-sm rounded-lg hover:bg-mafalia-accent-hover transition-colors flex items-center gap-1"
          >
            <ExternalLink size={14} />
            Connect
          </button>
        </div>
      )}

      {/* Welcome Screen */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold text-mafalia-text mb-2">
              Welcome{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-mafalia-text-dim mb-8">
              Ask anything about your business. I'm connected to your mafalia.com data.
            </p>
            
            <div className="grid grid-cols-1 gap-2 w-full">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(suggestion)}
                  className="text-left px-4 py-3 bg-mafalia-card hover:bg-mafalia-input rounded-xl text-sm text-mafalia-text transition-colors border border-mafalia-border"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-mafalia-user' : 'bg-mafalia-accent/20'
                }`}>
                  {msg.role === 'user' ? (
                    <User size={16} className="text-mafalia-text" />
                  ) : (
                    <Bot size={16} className="text-mafalia-accent" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-mafalia-user text-mafalia-text' 
                    : 'bg-mafalia-card border border-mafalia-border'
                }`}>
                  <div className="text-sm leading-relaxed">
                    {formatMessage(msg.content)}
                  </div>
                  <span className="text-[10px] text-mafalia-text-dim mt-2 block">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-mafalia-accent/20 flex items-center justify-center">
                  <Bot size={16} className="text-mafalia-accent" />
                </div>
                <div className="bg-mafalia-card border border-mafalia-border rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-mafalia-accent" />
                  <span className="text-sm text-mafalia-text-dim">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-mafalia-border bg-mafalia-sidebar p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-mafalia-card rounded-xl border border-mafalia-border p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? "Ask about your business..." : "Connect to mafalia.com to start"}
              disabled={!isConnected || isLoading}
              className="flex-1 bg-transparent text-mafalia-text placeholder-mafalia-text-dim px-3 py-2 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || !isConnected || isLoading}
              className="p-2 bg-mafalia-accent hover:bg-mafalia-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-mafalia-text-dim">
              Press <kbd className="px-1 bg-mafalia-input rounded">Enter</kbd> to send
            </p>
            {isConnected && (
              <p className="text-[11px] text-mafalia-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-mafalia-success" />
                Connected to mafalia.com
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleChat
