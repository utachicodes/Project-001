import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, BarChart3, TrendingUp, Users, MessageSquare, Settings,
  FolderOpen, FileText, Terminal, Network, HardDrive, Brain,
  Sparkles, Trash2, Cpu, Globe, Database, Package,
  ArrowRight, Crown, Link2, UserPlus, BookOpen,
  Wand2, Palette, Bot, Compass, Repeat,
} from 'lucide-react'

interface Command {
  id: string
  label: string
  description: string
  icon: React.ComponentType<any>
  category: 'agents' | 'business' | 'actions' | 'desktop' | 'graph' | 'web' | 'ecosystem' | 'general'
  color: string
}

const COMMANDS: Command[] = [
  // Business Intelligence
  { id: '/summary',    label: 'Business Summary',  description: 'Full health check across all domains',            icon: BarChart3,    category: 'business',   color: '#7C3AED' },
  { id: '/metrics',    label: 'Live Metrics',       description: 'Real-time KPI dashboard',                        icon: TrendingUp,   category: 'business',   color: '#00D4FF' },
  { id: '/agents',     label: 'List Agents',        description: 'All 10 agents and their superpowers',            icon: Users,        category: 'business',   color: '#A855F7' },
  { id: '/ask',        label: 'Ask Agent',          description: '/ask <agent> <question>',                        icon: MessageSquare,category: 'agents',     color: '#8B5CF6' },
  // Desktop
  { id: '/browse',     label: 'Browse Files',       description: 'Browse any directory on your system',            icon: FolderOpen,   category: 'desktop',    color: '#F59E0B' },
  { id: '/read',       label: 'Read File',          description: 'Read any file up to 10 MB',                     icon: FileText,     category: 'desktop',    color: '#06B6D4' },
  { id: '/write',      label: 'Write File',         description: 'Write content to any path',                     icon: Terminal,     category: 'desktop',    color: '#22C55E' },
  { id: '/open',       label: 'Open in System',     description: 'Open file/folder in default app',               icon: Globe,        category: 'desktop',    color: '#EC4899' },
  { id: '/csvs',       label: 'Find CSVs',          description: 'Recursively find CSV files',                    icon: Database,     category: 'desktop',    color: '#14B8A6' },
  { id: '/system',     label: 'System Info',        description: 'Platform, memory, paths',                       icon: HardDrive,    category: 'desktop',    color: '#6366F1' },
  // Knowledge Graph
  { id: '/graph-build',   label: 'Build Graph',     description: 'Build knowledge graph from your data',          icon: Network,      category: 'graph',      color: '#A855F7' },
  { id: '/graph-query',   label: 'Query Graph',     description: 'Ask the knowledge graph a question',            icon: Brain,        category: 'graph',      color: '#8B5CF6' },
  { id: '/graph-explain', label: 'Explain Concept', description: 'Deep dive on a graph node',                    icon: Sparkles,     category: 'graph',      color: '#D946EF' },
  { id: '/graph-report',  label: 'Graph Report',    description: 'God nodes, surprising connections',             icon: Package,      category: 'graph',      color: '#7C3AED' },
  { id: '/graph-status',  label: 'Graph Status',    description: 'Check graph stats and age',                    icon: Cpu,          category: 'graph',      color: '#6D28D9' },
  // Actions
  { id: '/analyze',    label: 'Analyze',            description: 'Deep analysis (revenue, customers, inventory…)', icon: BarChart3,    category: 'actions',    color: '#10B981' },
  { id: '/predict',    label: 'Predict',            description: 'Forecast future (revenue, churn, cashflow…)',   icon: TrendingUp,   category: 'actions',    color: '#3B82F6' },
  { id: '/create',     label: 'Create',             description: 'Generate content (campaign, code, plan…)',      icon: Wand2,        category: 'actions',    color: '#F97316' },
  { id: '/design',     label: 'Design',             description: 'Creative brief (social post, flyer, ad…)',      icon: Palette,      category: 'actions',    color: '#EC4899' },
  { id: '/automate',   label: 'Automate',           description: 'Build workflow (operations, restocking, api)',  icon: Repeat,       category: 'actions',    color: '#8B5CF6' },
  { id: '/research',   label: 'Research',           description: 'Market intelligence (trends, competitors…)',    icon: Compass,      category: 'actions',    color: '#06B6D4' },
  // Web & Data
  { id: '/scrape',     label: 'Scrape URL',         description: 'Scrape a webpage and save to database',        icon: Link2,        category: 'web',        color: '#10B981' },
  { id: '/search',     label: 'Web Search',         description: 'Search the web for a topic',                   icon: Globe,        category: 'web',        color: '#3B82F6' },
  { id: '/connect',    label: 'Add Connection',     description: 'Save a business connection',                   icon: UserPlus,     category: 'web',        color: '#F97316' },
  { id: '/connections',label: 'View Connections',   description: 'List saved business connections',              icon: BookOpen,     category: 'web',        color: '#8B5CF6' },
  // Ecosystem
  { id: '/boss',       label: 'Boss Dashboard',     description: 'Open agent ecosystem with boss oversight',     icon: Crown,        category: 'ecosystem',  color: '#F59E0B' },
  { id: '/rooms',      label: 'Agent Rooms',        description: 'Show all agent room assignments',              icon: Bot,          category: 'ecosystem',  color: '#06B6D4' },
  // General
  { id: '/config',     label: 'Settings',           description: 'Configure AI provider and model',              icon: Settings,     category: 'general',    color: '#94A3B8' },
  { id: '/clear',      label: 'Clear Chat',         description: 'Start a fresh conversation',                   icon: Trash2,       category: 'general',    color: '#EF4444' },
  { id: '/help',       label: 'Help',               description: 'Show all available commands',                  icon: Terminal,     category: 'general',    color: '#A1A1AA' },
]

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  business:  { label: 'Business Intelligence', color: '#7C3AED' },
  agents:    { label: 'AI Agents',             color: '#8B5CF6' },
  desktop:   { label: 'Desktop Access',        color: '#F59E0B' },
  graph:     { label: 'Knowledge Graph',       color: '#A855F7' },
  actions:   { label: 'Actions',               color: '#00D4FF' },
  web:       { label: 'Web & Data',            color: '#3B82F6' },
  ecosystem: { label: 'Agent Ecosystem',       color: '#F59E0B' },
  general:   { label: 'General',              color: '#94A3B8' },
}

const NEEDS_ARGS = new Set([
  '/ask','/browse','/read','/write','/open','/csvs',
  '/graph-query','/graph-explain','/scrape','/search',
  '/connect','/analyze','/predict','/create','/design','/automate','/research',
])

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (command: string, needsArgs: boolean) => void
}

export default function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

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

  const grouped = useMemo(() => {
    const g: Record<string, Command[]> = {}
    filtered.forEach(c => { (g[c.category] ??= []).push(c) })
    return g
  }, [filtered])

  const flatList = useMemo(() => {
    const items: Command[] = []
    Object.values(grouped).forEach(g => items.push(...g))
    return items
  }, [grouped])

  useEffect(() => {
    if (isOpen) { setQuery(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [isOpen])

  useEffect(() => { setSelectedIndex(0) }, [query])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, flatList.length - 1)) }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter')      { e.preventDefault(); if (flatList[selectedIndex]) handleSelect(flatList[selectedIndex]) }
    if (e.key === 'Escape')     { e.preventDefault(); onClose() }
  }

  const handleSelect = (cmd: Command) => { onSelect(cmd.id, NEEDS_ARGS.has(cmd.id)); onClose() }

  let itemIndex = -1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 420 }}
            className="fixed top-[14%] left-1/2 -translate-x-1/2 w-full max-w-[540px] z-50 px-4"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200">

              <div className="h-1 bg-[#E63946]" />

              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-[15px] font-medium outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600"
                     style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[380px] overflow-y-auto py-2" style={{ scrollbarWidth: 'thin' }}>
                {flatList.length === 0 && (
                  <div className="px-4 py-10 text-center text-slate-600 text-[13px]">No commands found</div>
                )}

                {Object.entries(grouped).map(([cat, cmds]) => {
                  const meta = CATEGORY_META[cat] || { label: cat, color: '#94A3B8' }
                  return (
                    <div key={cat}>
                      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: meta.color + '99' }}>
                          {meta.label}
                        </span>
                      </div>
                      {cmds.map((cmd) => {
                        itemIndex++
                        const idx = itemIndex
                        const isSelected = idx === selectedIndex
                        const Icon = cmd.icon
                        return (
                          <button
                            key={cmd.id}
                            data-index={idx}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-[3px]"
                            style={{
                              background: isSelected ? 'var(--bg-app)' : 'transparent',
                              borderLeftColor: isSelected ? cmd.color : 'transparent',
                            }}
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 border border-slate-200">
                              <Icon size={16} className="text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-bold text-slate-900">{cmd.label}</span>
                                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-tighter">{cmd.id}</span>
                              </div>
                              <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5">{cmd.description}</p>
                            </div>
                            {isSelected && <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 flex items-center gap-4 text-[10px] text-slate-700"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[['↑↓','navigate'],['↵','select'],['esc','close']].map(([key, label]) => (
                  <span key={key} className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded font-mono"
                         style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {key}
                    </kbd>
                    {label}
                  </span>
                ))}
                <span className="ml-auto">{filtered.length} commands</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
