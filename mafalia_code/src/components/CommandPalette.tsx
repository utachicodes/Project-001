import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, BarChart3, TrendingUp, Users, MessageSquare, Settings,
  FolderOpen, FileText, Terminal, Network, HardDrive, Brain,
  Sparkles, Trash2, Cpu, Globe, Database, Package,
  ArrowRight, Hash, Crown, LayoutGrid, Link2, UserPlus, BookOpen,
  Wand2, Palette, Bot, Compass, FlaskConical, Repeat
} from 'lucide-react'

interface Command {
  id: string
  label: string
  description: string
  icon: React.ComponentType<any>
  category: 'agents' | 'business' | 'actions' | 'desktop' | 'graph' | 'web' | 'ecosystem' | 'general'
  shortcut?: string
  color: string
}

const COMMANDS: Command[] = [
  // Business Intelligence
  { id: '/summary', label: 'Business Summary', description: 'Full health check across all domains', icon: BarChart3, category: 'business', color: '#10b981' },
  { id: '/metrics', label: 'Live Metrics', description: 'Real-time KPI dashboard', icon: TrendingUp, category: 'business', color: '#3b82f6' },
  { id: '/agents', label: 'List Agents', description: 'All 10 agents and their superpowers', icon: Users, category: 'business', color: '#f97316' },
  { id: '/ask', label: 'Ask Agent', description: '/ask <agent> <question>', icon: MessageSquare, category: 'agents', color: '#8b5cf6' },

  // Desktop Access (full)
  { id: '/browse', label: 'Browse Files', description: 'Browse any directory on your system', icon: FolderOpen, category: 'desktop', color: '#f59e0b' },
  { id: '/read', label: 'Read File', description: 'Read any file (up to 10 MB)', icon: FileText, category: 'desktop', color: '#06b6d4' },
  { id: '/write', label: 'Write File', description: 'Write content to any path', icon: Terminal, category: 'desktop', color: '#22c55e' },
  { id: '/open', label: 'Open in System', description: 'Open file/folder in default app', icon: Globe, category: 'desktop', color: '#ec4899' },
  { id: '/csvs', label: 'Find CSVs', description: 'Recursively find CSV files', icon: Database, category: 'desktop', color: '#14b8a6' },
  { id: '/system', label: 'System Info', description: 'Platform, memory, paths', icon: HardDrive, category: 'desktop', color: '#6366f1' },

  // Knowledge Graph
  { id: '/graph-build', label: 'Build Graph', description: 'Build knowledge graph from your data', icon: Network, category: 'graph', color: '#a855f7' },
  { id: '/graph-query', label: 'Query Graph', description: 'Ask the knowledge graph a question', icon: Brain, category: 'graph', color: '#8b5cf6' },
  { id: '/graph-explain', label: 'Explain Concept', description: 'Deep dive on a graph node', icon: Sparkles, category: 'graph', color: '#d946ef' },
  { id: '/graph-report', label: 'Graph Report', description: 'God nodes, surprising connections', icon: Package, category: 'graph', color: '#7c3aed' },
  { id: '/graph-status', label: 'Graph Status', description: 'Check graph stats and age', icon: Cpu, category: 'graph', color: '#6d28d9' },

  // Actions
  { id: '/analyze', label: 'Analyze', description: 'Deep analysis (revenue, customers, inventory, finance...)', icon: BarChart3, category: 'actions', color: '#10b981' },
  { id: '/predict', label: 'Predict', description: 'Forecast future (revenue, churn, cashflow, growth)', icon: TrendingUp, category: 'actions', color: '#3b82f6' },
  { id: '/create', label: 'Create', description: 'Generate content (campaign, code, business-plan, report)', icon: Wand2, category: 'actions', color: '#f97316' },
  { id: '/design', label: 'Design', description: 'Creative brief (social post, flyer, ad, banner)', icon: Palette, category: 'actions', color: '#ec4899' },
  { id: '/automate', label: 'Automate', description: 'Build workflow (operations, restocking, api)', icon: Repeat, category: 'actions', color: '#8b5cf6' },
  { id: '/research', label: 'Research', description: 'Market intelligence (trends, competitors, gaps)', icon: Compass, category: 'actions', color: '#06b6d4' },

  // Web & Data
  { id: '/scrape', label: 'Scrape URL', description: 'Scrape a webpage and save to database', icon: Link2, category: 'web', color: '#10b981' },
  { id: '/search', label: 'Web Search', description: 'Search the web for a topic', icon: Globe, category: 'web', color: '#3b82f6' },
  { id: '/connect', label: 'Add Connection', description: 'Save a business connection', icon: UserPlus, category: 'web', color: '#f97316' },
  { id: '/connections', label: 'View Connections', description: 'List saved business connections', icon: BookOpen, category: 'web', color: '#8b5cf6' },

  // Ecosystem
  { id: '/boss', label: 'Boss Dashboard', description: 'Open agent ecosystem with boss oversight', icon: Crown, category: 'ecosystem', color: '#f59e0b' },
  { id: '/rooms', label: 'Agent Rooms', description: 'Show all agent room assignments', icon: LayoutGrid, category: 'ecosystem', color: '#06b6d4' },

  // General
  { id: '/config', label: 'Settings', description: 'Configure AI provider and model', icon: Settings, category: 'general', color: '#71717a' },
  { id: '/clear', label: 'Clear Chat', description: 'Start a fresh conversation', icon: Trash2, category: 'general', color: '#ef4444' },
  { id: '/help', label: 'Help', description: 'Show all available commands', icon: Terminal, category: 'general', color: '#a1a1aa' },
]

const CATEGORY_LABELS: Record<string, string> = {
  business: 'Business Intelligence',
  agents: 'AI Agents',
  desktop: 'Desktop Access',
  graph: 'Knowledge Graph',
  actions: 'Actions',
  web: 'Web & Data',
  ecosystem: 'Agent Ecosystem',
  general: 'General',
}

const NEEDS_ARGS = new Set(['/ask', '/browse', '/read', '/write', '/open', '/csvs', '/graph-query', '/graph-explain', '/scrape', '/search', '/connect', '/analyze', '/predict', '/create', '/design', '/automate', '/research'])

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (command: string, needsArgs: boolean) => void
}

export default function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query) return COMMANDS
    const q = query.toLowerCase()
    return COMMANDS.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    )
  }, [query])

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    filtered.forEach(c => {
      if (!groups[c.category]) groups[c.category] = []
      groups[c.category].push(c)
    })
    return groups
  }, [filtered])

  // Flat list for keyboard nav
  const flatList = useMemo(() => {
    const items: Command[] = []
    Object.values(grouped).forEach(g => items.push(...g))
    return items
  }, [grouped])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, flatList.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (flatList[selectedIndex]) {
          handleSelect(flatList[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  const handleSelect = (cmd: Command) => {
    onSelect(cmd.id, NEEDS_ARGS.has(cmd.id))
    onClose()
  }

  let itemIndex = -1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-[#0d1117]/95 backdrop-blur-xl rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/40 overflow-hidden">
              {/* Search */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                <Search size={18} className="text-zinc-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-500 text-[10px] font-mono border border-white/[0.06]">ESC</kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[360px] overflow-y-auto scrollbar-thin py-2">
                {flatList.length === 0 && (
                  <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                    No commands found
                  </div>
                )}

                {Object.entries(grouped).map(([category, commands]) => (
                  <div key={category}>
                    <div className="px-4 pt-2 pb-1">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {CATEGORY_LABELS[category] || category}
                      </span>
                    </div>
                    {commands.map((cmd) => {
                      itemIndex++
                      const idx = itemIndex
                      const isSelected = idx === selectedIndex
                      const Icon = cmd.icon

                      return (
                        <motion.button
                          key={cmd.id}
                          data-index={idx}
                          onClick={() => handleSelect(cmd)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                          }`}
                          layoutId={cmd.id}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${cmd.color}18`, border: `1px solid ${cmd.color}30` }}
                          >
                            <Icon size={15} style={{ color: cmd.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-200">{cmd.label}</span>
                              <span className="text-[10px] font-mono text-zinc-600">{cmd.id}</span>
                            </div>
                            <p className="text-xs text-zinc-500 truncate">{cmd.description}</p>
                          </div>
                          {isSelected && (
                            <ArrowRight size={14} className="text-zinc-500 shrink-0" />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-zinc-600">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">↵</kbd> select</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
