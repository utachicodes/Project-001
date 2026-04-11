import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import SetupWizard from './components/SetupWizard'
import PrivacyModal from './components/PrivacyModal'
import CommandPalette from './components/CommandPalette'
import { Config, Message, Agent } from './types'
import { llmClient } from './llmApi'
import ELECTRON_API from './api'
import { saveScrapedPage, addConnection, getConnections } from './supabaseData'

interface ChatSession {
  id: string
  title: string
  date: string
  messages: Message[]
}

const DEFAULT_AGENTS: Agent[] = [
  { id: 'zara',  name: 'Zara',  tag: '[REV]', title: 'Revenue Strategist',    color: '#FF6B35', status: 'idle', room: 'Sales Floor',   description: 'Analyzes revenue streams, predicts growth, detects pricing anomalies.', quickActions: ['/analyze revenue', '/predict revenue', '/ask zara top products'] },
  { id: 'kofi',  name: 'Kofi',  tag: '[OPS]', title: 'Operations Commander',  color: '#2E86AB', status: 'idle', room: 'Ops Center',    description: 'Monitors workflows, supply chain, logistics. Automates routine operational tasks.', quickActions: ['/analyze operations', '/automate operations', '/ask kofi bottlenecks'] },
  { id: 'amara', name: 'Amara', tag: '[CUS]', title: 'Customer Champion',     color: '#A23B72', status: 'idle', room: 'CX Lounge',     description: 'Tracks customer behavior, segments audiences, predicts churn.', quickActions: ['/analyze customers', '/predict churn', '/ask amara top customers'] },
  { id: 'idris', name: 'Idris', tag: '[INV]', title: 'Inventory Guardian',    color: '#1B998B', status: 'idle', room: 'Warehouse',     description: 'Tracks stock levels, predicts shortages, suggests restocking, flags waste.', quickActions: ['/analyze inventory', '/predict inventory', '/ask idris reorder'] },
  { id: 'nala',  name: 'Nala',  tag: '[MKT]', title: 'Marketing & Creative',  color: '#F77F00', status: 'idle', room: 'Creative Lab',  description: 'Creates campaigns, social content, ads. Tracks ROI.', quickActions: ['/create campaign', '/design social post', '/analyze marketing'] },
  { id: 'tariq', name: 'Tariq', tag: '[FIN]', title: 'Finance Wizard',        color: '#6C5B7B', status: 'idle', room: 'Finance Vault', description: 'Prepares financial reports, forecasts cash flow, budgets, detects risks.', quickActions: ['/analyze finance', '/predict cashflow', '/ask tariq tax report'] },
  { id: 'sana',  name: 'Sana',  tag: '[DAT]', title: 'Market Intelligence',   color: '#2D6A4F', status: 'idle', room: 'Analytics Bay', description: 'Tracks competitors, market trends, gaps. Produces data-driven insights.', quickActions: ['/research trends', '/research competitors', '/analyze data'] },
  { id: 'ravi',  name: 'Ravi',  tag: '[TEC]', title: 'Tech & Automation',     color: '#E63946', status: 'idle', room: 'Server Room',   description: 'Writes code, builds automations, connects APIs, manages infrastructure.', quickActions: ['/create code', '/automate api', '/analyze system'] },
  { id: 'luna',  name: 'Luna',  tag: '[GRO]', title: 'Growth Hacker',         color: '#9B5DE5', status: 'idle', room: 'Growth Lab',   description: 'Designs growth experiments, optimizes funnels, finds viral strategies.', quickActions: ['/analyze growth', '/create experiment', '/predict growth'] },
  { id: 'omar',  name: 'Omar',  tag: '[PAR]', title: 'Partnerships & Docs',   color: '#06D6A0', status: 'idle', room: 'Deal Room',    description: 'Manages partnerships, generates business docs, contracts, pitch decks.', quickActions: ['/create business-plan', '/create pitch-deck', '/research partners'] },
]

const ANALYZE_MAP: Record<string, string> = { revenue: 'zara', operations: 'kofi', customers: 'amara', inventory: 'idris', marketing: 'nala', finance: 'tariq', data: 'sana', system: 'ravi', growth: 'luna' }
const PREDICT_MAP: Record<string, string> = { revenue: 'zara', churn: 'amara', inventory: 'idris', cashflow: 'tariq', growth: 'luna' }
const CREATE_MAP:  Record<string, string> = { campaign: 'nala', code: 'ravi', experiment: 'luna', 'business-plan': 'omar', 'pitch-deck': 'omar', report: 'sana', sop: 'omar' }

const mkMsg = (content: string, agentTag = '[MAF]'): Message => ({
  id: Date.now().toString(),
  role: 'assistant',
  content,
  agentTag,
  timestamp: new Date().toISOString(),
})

const welcomeMsg = (hasKey: boolean): Message => mkMsg(
  hasKey
    ? ''
    : `**API Key Required**\n\nConfigure an AI provider to get started. Click **Settings** or type /config.\n\n• **OpenRouter** — Free tier at openrouter.ai\n• **Google Gemini** — Free API at aistudio.google.com`,
)

function App() {
  const [config, setConfig]               = useState<Config | null>(null)
  const [showSetup, setShowSetup]         = useState(false)
  const [showPrivacy, setShowPrivacy]     = useState(false)
  const [showCmdPalette, setShowCmdPalette] = useState(false)
  const [pendingInput, setPendingInput]   = useState('')
  const [messages, setMessages]           = useState<Message[]>([])
  const [isLoading, setIsLoading]         = useState(false)
  const [status, setStatus]               = useState('Not connected')
  const [currentModel, setCurrentModel]   = useState('')
  const [chatHistory, setChatHistory]     = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState('')

  useEffect(() => { loadConfig(); loadChatHistory() }, [])
  useEffect(() => { if (!currentChatId) setMessages([welcomeMsg(!!config?.apiKey)]) }, [config])

  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('mafalia_chat_history')
      if (saved) setChatHistory(JSON.parse(saved))
    } catch {}
  }

  const saveChatHistory = (h: ChatSession[]) => {
    try { localStorage.setItem('mafalia_chat_history', JSON.stringify(h)) } catch {}
  }

  const chatTitle = (msgs: Message[]) => {
    const first = msgs.find(m => m.role === 'user')
    return first ? first.content.slice(0, 40) + (first.content.length > 40 ? '…' : '') : 'New Chat'
  }

  const handleNewChat = () => {
    if (messages.length > 1 && currentChatId) {
      const updated = chatHistory.map(c => c.id === currentChatId ? { ...c, messages, title: chatTitle(messages) } : c)
      setChatHistory(updated); saveChatHistory(updated)
    }
    const id = Date.now().toString()
    setCurrentChatId(id)
    setMessages([welcomeMsg(!!config?.apiKey)])
  }

  const handleLoadChat = (id: string) => {
    const c = chatHistory.find(c => c.id === id)
    if (c) { setCurrentChatId(id); setMessages(c.messages) }
  }

  const handleDeleteChat = (id: string) => {
    const updated = chatHistory.filter(c => c.id !== id)
    setChatHistory(updated); saveChatHistory(updated)
    if (currentChatId === id) { setCurrentChatId(''); setMessages([welcomeMsg(!!config?.apiKey)]) }
  }

  const loadConfig = async () => {
    try {
      const saved = await window.electronAPI.config.load()
      if (saved?.apiKey) { setConfig(saved); llmClient.setConfig(saved); setStatus(`Connected: ${saved.provider}`) }
      else setShowSetup(true)
    } catch { setShowSetup(true) }
  }

  const saveConfig = async (cfg: Config) => {
    await window.electronAPI.config.save(cfg)
    setConfig(cfg); llmClient.setConfig(cfg); setStatus(`Connected: ${cfg.provider}`); setShowSetup(false)
    addMsg(mkMsg(`**Configuration saved.**\n\nProvider: **${cfg.provider}**\nModel: **${cfg.model}**`))
  }

  const addMsg = (msg: Message) => setMessages(prev => [...prev, msg])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: content.trim(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])

    if (!config?.apiKey) {
      addMsg(mkMsg(llmClient.getMissingConfigMessage()))
      return
    }

    setIsLoading(true)
    if (content.startsWith('/')) { await handleCommand(content, userMsg); setIsLoading(false); return }

    try {
      const strategy = llmClient.selectModelStrategy(content)
      setCurrentModel(llmClient.getOptimalModel(strategy))
      const result = await llmClient.chat(content)
      const aiMsg = mkMsg(result.content)
      setMessages(prev => {
        const newMsgs = [...prev, aiMsg]
        autoSaveChat(newMsgs)
        return newMsgs
      })
    } catch (e) {
      addMsg(mkMsg(`**Error:** ${e instanceof Error ? e.message : 'Failed to get response'}\n\nCheck your API key.`, '[ERR]'))
    } finally {
      setIsLoading(false); setCurrentModel('')
    }
  }

  const autoSaveChat = (msgs: Message[]) => {
    if (!currentChatId) return
    setChatHistory(prev => {
      const updated = prev.map(c => c.id === currentChatId ? { ...c, messages: msgs, title: chatTitle(msgs), date: new Date().toISOString() } : c)
      if (!updated.find(c => c.id === currentChatId)) {
        updated.unshift({ id: currentChatId, title: chatTitle(msgs), date: new Date().toISOString(), messages: msgs })
      }
      saveChatHistory(updated)
      return updated
    })
  }

  const fmtAgent = (r: any) => {
    let s = `**${r.agent}** - ${r.agent_title}\n\n`
    const d = r.data || r.response
    if (d && typeof d === 'object') {
      for (const [k, v] of Object.entries(d))
        s += typeof v === 'object' ? `**${k}:**\n${JSON.stringify(v, null, 2)}\n\n` : `**${k}:** ${v}\n`
    }
    return s
  }

  const handleCommand = async (cmd: string, _userMsg?: Message) => {
    const parts  = cmd.split(' ')
    const name   = parts[0].toLowerCase()
    let response = ''
    let tag      = '[MAF]'

    switch (name) {
      case '/help':
        response = `**Available Commands:**

### Business Intelligence
• /agents — List all 10 agents
• /summary — Full business health check
• /metrics — Live KPI dashboard
• /ask <agent> <question> — Ask a specific agent

### Desktop
• /browse [path] — Browse directory
• /read <path> — Read any file
• /write <path> <content> — Write to file
• /open <path> — Open in system viewer
• /csvs [path] — Find CSV files
• /system — System information

### Knowledge Graph
• /graph-build — Build graph from data
• /graph-query <q> — Query the graph
• /graph-explain <concept> — Explain a concept
• /graph-report — Full graph report
• /graph-status — Graph stats

### Actions
• /analyze <domain> — Deep analysis
• /predict <target> — Forecast future
• /create <type> — Generate content
• /design <type> — Creative brief
• /automate <workflow> — Build automation
• /research <topic> — Market intelligence

### Web & Data
• /scrape <url> — Scrape a webpage
• /search <query> — Web search
• /connect <name> | <company> | <role> — Add connection
• /connections — View connections

### Ecosystem
• /boss — Open boss dashboard
• /rooms — Agent room assignments

### General
• /config — Settings  • /clear — Clear chat`
        break

      case '/scrape': {
        const url = parts.slice(1).join(' ')
        if (!url) { response = 'Usage: /scrape <url>'; break }
        try {
          const r = await ELECTRON_API.scrapeUrl(url, true, true)
          response = `**Scraped:** ${r.title}\n\n• **URL:** ${r.url}\n• **Words:** ${r.word_count.toLocaleString()}\n\n### Content Preview\n${r.content.slice(0, 1500)}`
          if (r.content.length > 1500) response += '\n\n*[Content truncated]*'
          await saveScrapedPage({ url: r.url, title: r.title, content: r.content, word_count: r.word_count, status: 'scraped', scraped_by: 'user' })
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[TEC]'; break
      }

      case '/search': {
        const q = parts.slice(1).join(' ')
        if (!q) { response = 'Usage: /search <query>'; break }
        try {
          const r = await ELECTRON_API.webSearch(q)
          response = r.urls.length === 0
            ? `**No results** for "${q}"`
            : `**Web search:** "${q}"\n\n${r.urls.map((u: string, i: number) => `${i + 1}. ${u}`).join('\n')}\n\nUse /scrape <url> to read any page.`
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Search failed'}` }
        tag = '[TEC]'; break
      }

      case '/connect': {
        const args = parts.slice(1).join(' ').split('|').map((s: string) => s.trim())
        if (!args[0]) { response = 'Usage: /connect <name> | <company> | <role>'; break }
        try {
          await addConnection({ name: args[0], company: args[1] || '', role: args[2] || '', source: 'chat' })
          response = `**Connection saved:** ${args[0]}${args[2] ? ` — ${args[2]}` : ''}${args[1] ? ` at ${args[1]}` : ''}`
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[PAR]'; break
      }

      case '/connections': {
        try {
          const conns = await getConnections()
          response = conns.length === 0
            ? '**No connections yet.** Use /connect <name> | <company> | <role>'
            : `**Connections (${conns.length}):**\n\n` + conns.map((c: any) => `• **${c.name}**${c.role ? ` — ${c.role}` : ''}${c.company ? ` at ${c.company}` : ''}`).join('\n')
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[PAR]'; break
      }

      case '/analyze': {
        const target = parts.slice(1).join(' ') || 'business'
        try {
          const r = await ELECTRON_API.askAgent(ANALYZE_MAP[target.toLowerCase()] || 'sana', `analyze ${target} in detail`)
          response = fmtAgent(r); tag = r.tag || '[DAT]'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/predict': {
        const target = parts.slice(1).join(' ') || 'revenue'
        try {
          const r = await ELECTRON_API.askAgent(PREDICT_MAP[target.toLowerCase()] || 'sana', `predict future ${target}`)
          response = fmtAgent(r); tag = r.tag || '[DAT]'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/create': {
        const target = parts.slice(1).join(' ')
        if (!target) { response = 'Usage: /create <type>\n\nTypes: campaign, code, experiment, business-plan, pitch-deck, report, sop'; break }
        const agentKey = Object.keys(CREATE_MAP).find(k => target.toLowerCase().startsWith(k))
        try {
          const r = await ELECTRON_API.askAgent(agentKey ? CREATE_MAP[agentKey] : 'omar', `create a detailed ${target}`)
          response = fmtAgent(r); tag = r.tag || '[MAF]'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/design': {
        const target = parts.slice(1).join(' ')
        if (!target) { response = 'Usage: /design <type>\n\nTypes: social post, flyer, ad, logo concept, banner'; break }
        try {
          const r = await ELECTRON_API.askAgent('nala', `design a ${target} with detailed creative brief`)
          response = fmtAgent(r); tag = '[MKT]'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/automate': {
        const target = parts.slice(1).join(' ')
        if (!target) { response = 'Usage: /automate <workflow>'; break }
        try {
          const r = await ELECTRON_API.askAgent('ravi', `design an automation workflow for ${target}`)
          response = fmtAgent(r); tag = '[TEC]'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/research': {
        const target = parts.slice(1).join(' ')
        if (!target) { response = 'Usage: /research <topic>'; break }
        try {
          const r = await ELECTRON_API.askAgent('sana', `research ${target} with data-driven insights`)
          response = fmtAgent(r); tag = '[DAT]'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/boss':
        response = '**Boss dashboard** — use /rooms to see all agent rooms.'; break

      case '/rooms':
        response = '**Agent Rooms:**\n\n' + DEFAULT_AGENTS.map(a => `• **${a.name}** ${a.tag} — ${a.room}`).join('\n'); break

      case '/agents': {
        try {
          const r: any = await ELECTRON_API.getAgents()
          const list = Array.isArray(r) ? r : (r?.agents || [])
          response = (list.length > 0 ? list : DEFAULT_AGENTS).map((a: any) => `${a.tag} **${a.name}** — ${a.title}`).join('\n')
        } catch { response = DEFAULT_AGENTS.map(a => `${a.tag} **${a.name}** — ${a.title}`).join('\n') }
        break
      }

      case '/summary': {
        try {
          const s = await ELECTRON_API.getSummary()
          let r = `**Full Business Health Check**\n\nAgents Active: ${s.agents_active || 0}\n\n`
          if (s.agent_reports) {
            for (const [ag, rep] of Object.entries(s.agent_reports)) {
              const rr = rep as any
              r += `### ${rr.tag || '[AGT]'} ${ag}\n`
              if (rr.data && typeof rr.data === 'object')
                for (const [k, v] of Object.entries(rr.data))
                  if (typeof v !== 'object') r += `• ${k}: ${v}\n`
              r += '\n'
            }
          }
          if (s.cross_agent_alerts?.length > 0) {
            r += '**Alerts:**\n'
            for (const al of s.cross_agent_alerts) r += `• [${al.severity?.toUpperCase()}] ${al.message}\n`
          }
          response = r
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/metrics': {
        try {
          const m = await ELECTRON_API.getMetrics()
          let r = '**Live Business Metrics**\n\n'
          if (m.revenue)    r += `### Revenue\n• Total: ${m.revenue.total}\n• Transactions: ${m.revenue.transactions}\n• Avg Order: ${m.revenue.avg_order}\n\n`
          if (m.customers)  r += `### Customers\n• Total: ${m.customers.total}\n• Active: ${m.customers.active}\n\n`
          if (m.operations) r += `### Operations\n• Total Orders: ${m.operations.total_orders}\n\n`
          if (m.inventory)  r += `### Inventory\n• Total Items: ${m.inventory.total_items}\n• Critical: ${m.inventory.critical}\n\n`
          if (m.finance)    r += `### Finance\n• Health Score: ${m.finance.health_score}\n• Rating: ${m.finance.rating}`
          response = r
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        break
      }

      case '/ask': {
        if (parts.length >= 3) {
          try {
            const r = await ELECTRON_API.askAgent(parts[1], parts.slice(2).join(' '))
            response = fmtAgent(r); tag = r.tag || '[MAF]'
          } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        } else { response = 'Usage: /ask <agent_name> <question>' }
        break
      }

      case '/browse': {
        const path = parts.slice(1).join(' ')
        try {
          let r: any
          if (window.electronAPI?.fs) {
            r = await window.electronAPI.fs.readDir(path || '')
          } else {
            const pr = await ELECTRON_API.browseDirectory(path)
            r = { path: pr.path, entries: pr.entries.map((e: any) => ({ ...e, isDirectory: e.is_directory, isFile: e.is_file })) }
          }
          if (r.error) { response = `**Error:** ${r.error}`; break }
          const dirs  = r.entries.filter((e: any) => e.isDirectory)
          const files = r.entries.filter((e: any) => e.isFile)
          response = `**Browsing:** ${r.path}\n\n`
          if (dirs.length)  response += `### Folders (${dirs.length})\n${dirs.slice(0,30).map((d: any) => `• ${d.name}/`).join('\n')}${dirs.length > 30 ? `\n• … +${dirs.length-30} more` : ''}\n\n`
          if (files.length) response += `### Files (${files.length})\n${files.slice(0,30).map((f: any) => `• ${f.name}`).join('\n')}${files.length > 30 ? `\n• … +${files.length-30} more` : ''}`
          if (!dirs.length && !files.length) response += 'Empty directory'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[TEC]'; break
      }

      case '/read': {
        const fp = parts.slice(1).join(' ')
        if (!fp) { response = 'Usage: /read <file_path>'; break }
        try {
          const r: any = window.electronAPI?.fs
            ? await window.electronAPI.fs.readFile(fp)
            : await ELECTRON_API.readDesktopFile(fp)
          if (r.error) { response = `**Error:** ${r.error}`; break }
          const preview = r.content.length > 3000 ? r.content.slice(0, 3000) + '\n\n…(truncated)' : r.content
          response = `**File:** ${fp}\n\n${preview}`
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[TEC]'; break
      }

      case '/write': {
        const wp = parts[1]; const wc = parts.slice(2).join(' ')
        if (!wp || !wc) { response = 'Usage: /write <path> <content>'; break }
        try {
          window.electronAPI?.fs ? await window.electronAPI.fs.writeFile(wp, wc) : await ELECTRON_API.writeDesktopFile(wp, wc)
          response = `**Written to:** ${wp}`
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[TEC]'; break
      }

      case '/open': {
        const op = parts.slice(1).join(' ')
        if (!op) { response = 'Usage: /open <path>'; break }
        try {
          if (window.electronAPI?.shell) { await window.electronAPI.shell.openPath(op); response = `**Opened:** ${op}` }
          else response = '**Error:** Desktop shell requires Electron.'
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[TEC]'; break
      }

      case '/csvs': {
        const dir = parts.slice(1).join(' ')
        try {
          const r = await ELECTRON_API.findCsvFiles(dir)
          response = r.csv_files.length === 0
            ? `**No CSV files found** in ${r.path}`
            : `**Found ${r.count} CSV files** in ${r.path}\n\n` + r.csv_files.map((f: any) => `• **${f.name}** — ${f.size_human}\n  ${f.path}`).join('\n\n')
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[DAT]'; break
      }

      case '/system': {
        try {
          const info = window.electronAPI?.system
            ? await window.electronAPI.system.info()
            : await ELECTRON_API.getDesktopInfo()
          const i: any = info
          response = `**System Information**\n\n• **Platform:** ${i.platform}\n• **Hostname:** ${i.hostname || i.host || '—'}\n• **Home:** ${i.homeDir || i.home_dir || '—'}`
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[TEC]'; break
      }

      case '/graph-build': case '/graph-query': case '/graph-explain':
      case '/graph-report': case '/graph-status': {
        try {
          let r: any
          if (name === '/graph-build')   r = await ELECTRON_API.graphBuild(undefined, parts[1] || 'default', parts.includes('--update'))
          if (name === '/graph-query')   r = await ELECTRON_API.graphQuery(parts.slice(1).join(' '))
          if (name === '/graph-explain') r = await ELECTRON_API.graphExplain(parts.slice(1).join(' '))
          if (name === '/graph-report')  r = await ELECTRON_API.graphReport()
          if (name === '/graph-status')  r = await ELECTRON_API.graphStatus()
          response = r?.answer || r?.explanation || r?.report || JSON.stringify(r, null, 2).slice(0, 2000)
        } catch (e) { response = `**Error:** ${e instanceof Error ? e.message : 'Failed'}` }
        tag = '[DAT]'; break
      }

      case '/clear': handleNewChat(); return
      case '/config': setShowSetup(true); return
      default: response = `Unknown command: ${name}\n\nType /help to see all commands.`
    }

    addMsg({ id: Date.now().toString(), role: 'assistant', content: response, agentTag: tag, timestamp: new Date().toISOString() })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#050810' }}>
      {/* Ambient background orbs */}
      <div className="orb-bg" />

      <Sidebar
        agents={DEFAULT_AGENTS}
        status={status}
        onAgentClick={(id) => {
          const a = DEFAULT_AGENTS.find(a => a.id === id)
          if (a) addMsg(mkMsg(`### ${a.tag} ${a.name} — ${a.title}\n\n${a.description}\n\n**Quick actions:**\n${(a.quickActions || []).map(q => `• \`${q}\``).join('\n')}`))
        }}
        onSettingsClick={() => setShowSetup(true)}
        onQuickAction={(action) => {
          if (action === 'summary')  handleSendMessage('/summary')
          if (action === 'metrics')  handleSendMessage('/metrics')
          if (action === 'create')   handleSendMessage('/create campaign')
          if (action === 'research') handleSendMessage('/research trends')
        }}
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        currentChatId={currentChatId}
        onPrivacyClick={() => setShowPrivacy(true)}
        onAgentGridOpen={() => {}}
        onCommandPaletteOpen={() => setShowCmdPalette(true)}
      />

      <ChatArea
        messages={messages}
        isLoading={isLoading}
        currentModel={currentModel}
        onSendMessage={handleSendMessage}
        onCommandPaletteOpen={() => setShowCmdPalette(true)}
        pendingInput={pendingInput}
        onPendingInputConsumed={() => setPendingInput('')}
      />

      <CommandPalette
        isOpen={showCmdPalette}
        onClose={() => setShowCmdPalette(false)}
        onSelect={(cmd, needsArgs) => {
          setShowCmdPalette(false)
          if (needsArgs) setPendingInput(cmd)
          else handleSendMessage(cmd)
        }}
      />

      {showSetup  && <SetupWizard config={config} onSave={saveConfig} onClose={() => setShowSetup(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  )
}

export default App
