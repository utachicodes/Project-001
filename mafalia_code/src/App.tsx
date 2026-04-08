import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import SetupWizard from './components/SetupWizard'
import PrivacyModal from './components/PrivacyModal'
import CommandPalette from './components/CommandPalette'
import AgentEcosystem from './components/AgentEcosystem'
import AgentHome from './components/AgentHome'
import { Config, Message, Agent } from './types'
import { llmClient } from './llmApi'
import ELECTRON_API from './api'
import { saveScrapedPage, addConnection, getConnections, logAgentTask, saveSnapshot } from './supabaseData'
import { isSupabaseConfigured } from './supabase'

interface ChatSession {
  id: string
  title: string
  date: string
  messages: Message[]
}

const DEFAULT_AGENTS: Agent[] = [
  { id: 'zara', name: 'Zara', tag: '[REV]', title: 'Revenue Strategist', color: '#FF6B35', status: 'idle', room: 'Sales Floor',
    description: 'Analyzes revenue streams, predicts growth, detects pricing anomalies, and suggests strategies.',
    capabilities: [
      { id: 'r1', label: 'Revenue Analysis', command: '/analyze revenue', description: 'Revenue breakdown by product and period' },
      { id: 'r2', label: 'Revenue Forecast', command: '/predict revenue', description: 'Predict next month based on trends' },
      { id: 'r3', label: 'Pricing Strategy', command: '/ask zara pricing optimization', description: 'Optimal pricing suggestions' },
    ],
    quickActions: ['/analyze revenue', '/predict revenue', '/ask zara top products'],
  },
  { id: 'kofi', name: 'Kofi', tag: '[OPS]', title: 'Operations Commander', color: '#2E86AB', status: 'idle', room: 'Ops Center',
    description: 'Monitors workflows, supply chain, logistics. Automates routine operational tasks.',
    capabilities: [
      { id: 'o1', label: 'Workflow Analysis', command: '/analyze operations', description: 'Identify bottlenecks and inefficiencies' },
      { id: 'o2', label: 'Automate Workflow', command: '/automate operations', description: 'Suggest automations for tasks' },
      { id: 'o3', label: 'Ops Health', command: '/ask kofi efficiency report', description: 'Operational health check' },
    ],
    quickActions: ['/analyze operations', '/automate operations', '/ask kofi bottlenecks'],
  },
  { id: 'amara', name: 'Amara', tag: '[CUS]', title: 'Customer Champion', color: '#A23B72', status: 'idle', room: 'CX Lounge',
    description: 'Tracks customer behavior, segments audiences, predicts churn, and optimizes retention.',
    capabilities: [
      { id: 'c1', label: 'Customer Segments', command: '/analyze customers', description: 'Segment by value and behavior' },
      { id: 'c2', label: 'Churn Prediction', command: '/predict churn', description: 'Identify at-risk customers' },
      { id: 'c3', label: 'Lifetime Value', command: '/ask amara CLV analysis', description: 'Calculate and optimize CLV' },
    ],
    quickActions: ['/analyze customers', '/predict churn', '/ask amara top customers'],
  },
  { id: 'idris', name: 'Idris', tag: '[INV]', title: 'Inventory Guardian', color: '#1B998B', status: 'idle', room: 'Warehouse',
    description: 'Tracks stock levels, predicts shortages, suggests restocking, and flags waste.',
    capabilities: [
      { id: 'i1', label: 'Stock Check', command: '/analyze inventory', description: 'Current levels and alerts' },
      { id: 'i2', label: 'Shortage Forecast', command: '/predict inventory', description: 'Predict shortages before they happen' },
      { id: 'i3', label: 'Waste Analysis', command: '/ask idris waste report', description: 'Identify waste and expiry risks' },
    ],
    quickActions: ['/analyze inventory', '/predict inventory', '/ask idris reorder suggestions'],
  },
  { id: 'nala', name: 'Nala', tag: '[MKT]', title: 'Marketing & Creative', color: '#F77F00', status: 'idle', room: 'Creative Lab',
    description: 'Creates campaigns, social content, ads. Tracks ROI. Designs marketing materials.',
    capabilities: [
      { id: 'm1', label: 'Campaign Ideas', command: '/create campaign', description: 'Generate campaign proposals' },
      { id: 'm2', label: 'Social Content', command: '/design social post', description: 'Create social media content' },
      { id: 'm3', label: 'Marketing ROI', command: '/analyze marketing', description: 'Campaign performance analysis' },
    ],
    quickActions: ['/create campaign', '/design social post', '/analyze marketing'],
  },
  { id: 'tariq', name: 'Tariq', tag: '[FIN]', title: 'Finance Wizard', color: '#6C5B7B', status: 'idle', room: 'Finance Vault',
    description: 'Prepares financial reports, forecasts cash flow, budgets, and detects risks.',
    capabilities: [
      { id: 'f1', label: 'Financial Health', command: '/analyze finance', description: 'Full financial health check' },
      { id: 'f2', label: 'Cash Flow Forecast', command: '/predict cashflow', description: 'Predict future cash flow' },
      { id: 'f3', label: 'Budget Analysis', command: '/ask tariq budget optimization', description: 'Optimize spending' },
    ],
    quickActions: ['/analyze finance', '/predict cashflow', '/ask tariq tax report'],
  },
  { id: 'sana', name: 'Sana', tag: '[DAT]', title: 'Market Intelligence', color: '#2D6A4F', status: 'idle', room: 'Analytics Bay',
    description: 'Tracks competitors, market trends, and gaps. Produces data-driven strategic insights.',
    capabilities: [
      { id: 'd1', label: 'Trend Analysis', command: '/research trends', description: 'Spot emerging market trends' },
      { id: 'd2', label: 'Competitor Intel', command: '/research competitors', description: 'Monitor competitor activity' },
      { id: 'd3', label: 'Data Insights', command: '/analyze data', description: 'Find patterns and anomalies' },
    ],
    quickActions: ['/research trends', '/research competitors', '/analyze data'],
  },
  { id: 'ravi', name: 'Ravi', tag: '[TEC]', title: 'Tech & Automation', color: '#E63946', status: 'idle', room: 'Server Room',
    description: 'Writes code, builds automations, connects APIs, and manages technical infrastructure.',
    capabilities: [
      { id: 't1', label: 'Code Generation', command: '/create code', description: 'Write scripts and automation code' },
      { id: 't2', label: 'API Integration', command: '/automate api', description: 'Connect to external services' },
      { id: 't3', label: 'System Audit', command: '/analyze system', description: 'Technical stack health check' },
    ],
    quickActions: ['/create code', '/automate api', '/analyze system'],
  },
  { id: 'luna', name: 'Luna', tag: '[GRO]', title: 'Growth Hacker', color: '#9B5DE5', status: 'idle', room: 'Growth Lab',
    description: 'Designs growth experiments, optimizes funnels, and finds viral acquisition strategies.',
    capabilities: [
      { id: 'g1', label: 'Growth Analysis', command: '/analyze growth', description: 'Funnel and conversion analysis' },
      { id: 'g2', label: 'Experiment Design', command: '/create experiment', description: 'Design A/B tests and experiments' },
      { id: 'g3', label: 'Acquisition Strategy', command: '/predict growth', description: 'Forecast growth trajectories' },
    ],
    quickActions: ['/analyze growth', '/create experiment', '/predict growth'],
  },
  { id: 'omar', name: 'Omar', tag: '[PAR]', title: 'Partnerships & Docs', color: '#06D6A0', status: 'idle', room: 'Deal Room',
    description: 'Manages partnerships, generates business docs, contracts, pitch decks, and SOPs.',
    capabilities: [
      { id: 'p1', label: 'Business Plan', command: '/create business-plan', description: 'Generate a business plan' },
      { id: 'p2', label: 'Pitch Deck', command: '/create pitch-deck', description: 'Create investor-ready pitch deck' },
      { id: 'p3', label: 'Partnership Finder', command: '/research partners', description: 'Find strategic partners' },
    ],
    quickActions: ['/create business-plan', '/create pitch-deck', '/research partners'],
  },
]

const getWelcomeMessage = (hasConfig: boolean): Message => ({
  id: 'welcome',
  role: 'assistant',
  content: hasConfig
    ? ''
    : `**API Key Required**

Configure an AI provider to get started. Click **Settings** or type /config.

• **OpenRouter** — Free tier at openrouter.ai
• **Google Gemini** — Free API at aistudio.google.com`,
  agentTag: '[MAF]',
  timestamp: new Date().toISOString(),
})

function App() {
  const [config, setConfig] = useState<Config | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showAgentGrid, setShowAgentGrid] = useState(false)
  const [activeAgentHome, setActiveAgentHome] = useState<Agent | null>(null)
  const [pendingInput, setPendingInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('Not connected')
  const [currentModel, setCurrentModel] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>('')

  // Load config and chat history on mount
  useEffect(() => {
    loadConfig()
    loadChatHistory()
  }, [])

  // Update welcome message when config changes
  useEffect(() => {
    if (currentChatId === '') {
      setMessages([getWelcomeMessage(!!config?.apiKey)])
    }
  }, [config])

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('mafalia_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        setChatHistory(parsed)
      }
    } catch (e) {
      console.error('Failed to load chat history:', e)
    }
  }

  // Save chat history to localStorage
  const saveChatHistory = (history: ChatSession[]) => {
    try {
      localStorage.setItem('mafalia_chat_history', JSON.stringify(history))
    } catch (e) {
      console.error('Failed to save chat history:', e)
    }
  }

  // Generate chat title from first user message
  const generateChatTitle = (msgs: Message[]): string => {
    const firstUser = msgs.find(m => m.role === 'user')
    if (firstUser) {
      return firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? '...' : '')
    }
    return 'New Chat'
  }

  // Create new chat
  const handleNewChat = () => {
    // Save current chat if it has messages
    if (messages.length > 1 && currentChatId) {
      const updatedHistory = chatHistory.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages, title: generateChatTitle(messages) }
          : chat
      )
      setChatHistory(updatedHistory)
      saveChatHistory(updatedHistory)
    }

    // Start fresh
    const newId = Date.now().toString()
    setCurrentChatId(newId)
    setMessages([getWelcomeMessage(!!config?.apiKey)])
  }

  // Load a chat from history
  const handleLoadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
    }
  }

  // Delete a chat from history
  const handleDeleteChat = (chatId: string) => {
    const updated = chatHistory.filter(c => c.id !== chatId)
    setChatHistory(updated)
    saveChatHistory(updated)
    if (currentChatId === chatId) {
      setCurrentChatId('')
      setMessages([getWelcomeMessage(!!config?.apiKey)])
    }
  }

  const loadConfig = async () => {
    try {
      const saved = await window.electronAPI.config.load()
      if (saved?.apiKey) {
        setConfig(saved)
        llmClient.setConfig(saved)
        setStatus(`Connected: ${saved.provider}`)
      } else {
        setShowSetup(true)
      }
    } catch (e) {
      setShowSetup(true)
    }
  }

  const saveConfig = async (newConfig: Config) => {
    await window.electronAPI.config.save(newConfig)
    setConfig(newConfig)
    llmClient.setConfig(newConfig)
    setStatus(`Connected: ${newConfig.provider}`)
    setShowSetup(false)
    
    // Add confirmation message
    const confirmMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `**Configuration saved.**

Provider: **${newConfig.provider}**
Model: **${newConfig.model}**

Smart model selection is active. I'll automatically choose the best model for each query type.`,
      agentTag: '[MAF]',
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, confirmMsg])
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Check if API key is configured
    if (!config?.apiKey) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, userMsg])
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: llmClient.getMissingConfigMessage(),
        agentTag: '[MAF]',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
      return
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    // Check for slash commands
    if (content.startsWith('/')) {
      await handleCommand(content)
      setIsLoading(false)
      return
    }

    // Use LLM client with smart model selection
    try {
      const strategy = llmClient.selectModelStrategy(content)
      const optimalModel = llmClient.getOptimalModel(strategy)
      setCurrentModel(optimalModel)
      
      const result = await llmClient.chat(content)
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        agentTag: '[MAF]',
        timestamp: new Date().toISOString(),
      }
      const newMessages = [...messages, userMsg, aiMsg]
      setMessages(newMessages)

      // Auto-save to history
      if (currentChatId) {
        const updatedHistory = chatHistory.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: newMessages, title: generateChatTitle(newMessages), date: new Date().toISOString() }
            : chat
        )
        if (!updatedHistory.find(c => c.id === currentChatId)) {
          updatedHistory.unshift({
            id: currentChatId,
            title: generateChatTitle(newMessages),
            date: new Date().toISOString(),
            messages: newMessages
          })
        }
        setChatHistory(updatedHistory)
        saveChatHistory(updatedHistory)
      }
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**Error:** ${error instanceof Error ? error.message : 'Failed to get response'}\n\nPlease check your API key and try again.`,
        agentTag: '[ERR]',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      setCurrentModel('')
    }
  }

  const formatOrchestratorResponse = (result: any): string => {
    if (!result.results || result.results.length === 0) {
      return 'No response from agents.'
    }
    
    let response = `**Request:** ${result.request}\n\n`
    response += `**Agents consulted:** ${result.agents_consulted} | **Time:** ${result.execution_time}\n\n`
    
    for (const r of result.results) {
      response += `### ${r.tag} ${r.agent} (${r.title})\n`
      response += `Confidence: ${(r.confidence * 100).toFixed(0)}%\n\n`
      
      const data = r.response
      if (data && typeof data === 'object') {
        for (const [key, value] of Object.entries(data)) {
          if (key === 'error') {
            response += `${value}\n`
          } else if (typeof value === 'object') {
            response += `**${key}:**\n${JSON.stringify(value, null, 2)}\n\n`
          } else {
            response += `**${key}:** ${value}\n`
          }
        }
      }
      response += '\n---\n\n'
    }
    
    return response
  }

  const handleCommand = async (command: string) => {
    const parts = command.split(' ')
    const cmd = parts[0].toLowerCase()
    
    let response = ''
    let agentTag = '[MAF]'

    switch (cmd) {
      case '/help':
        response = `**Available Commands:**

### Business Intelligence
• /agents - List all 10 agents
• /summary - Full business health check
• /metrics - Live KPI dashboard
• /ask <agent> <question> - Ask a specific agent

### Desktop (full access)
• /browse [path] - Browse any directory (default: home)
• /read <path> - Read any file
• /write <path> <content> - Write content to a file
• /open <path> - Open in system viewer
• /csvs [path] - Find CSV files recursively (default: home)
• /system - System info, paths, memory

### Knowledge Graph
• /graph-build - Build graph from your data
• /graph-query <question> - Query the graph
• /graph-explain <concept> - Explain a concept
• /graph-report - Full graph report
• /graph-status - Graph stats

### Actions
• /analyze <domain> - Deep analysis (revenue, customers, inventory, finance, growth...)
• /predict <target> - Forecast future (revenue, churn, inventory, cashflow, growth)
• /create <type> - Generate content (campaign, code, business-plan, pitch-deck, report)
• /design <type> - Creative brief (social post, flyer, ad, banner, logo concept)
• /automate <workflow> - Build automation (operations, restocking, reports, api)
• /research <topic> - Market intelligence (trends, competitors, partners, gaps)

### Web & Data
• /scrape <url> - Scrape a webpage and save to Supabase
• /search <query> - Search the web for a topic
• /connect <name> | <company> | <role> - Add a business connection
• /connections - List saved connections

### Ecosystem
• /boss - Open agent ecosystem with boss oversight
• /rooms - Show all agent room assignments

### General
• /config - Open settings
• /clear - Clear history
• /help - This list`
        break

      case '/scrape': {
        const scrapeUrl = parts.slice(1).join(' ')
        if (!scrapeUrl) {
          response = 'Usage: /scrape <url>\nExample: /scrape https://example.com'
          break
        }
        try {
          response = `**Scraping:** ${scrapeUrl}...\n\n`
          const result = await ELECTRON_API.scrapeUrl(scrapeUrl, true, true)
          response = `**Scraped:** ${result.title}\n\n`
          response += `• **URL:** ${result.url}\n`
          response += `• **Words:** ${result.word_count.toLocaleString()}\n`
          if (result.links?.length > 0) response += `• **Links found:** ${result.links.length}\n`
          if (result.emails?.length > 0) response += `• **Emails:** ${result.emails.join(', ')}\n`
          response += `\n### Content Preview\n${result.content.slice(0, 1500)}`
          if (result.content.length > 1500) response += '\n\n*[Content truncated for display]*'
          // Save to Supabase
          await saveScrapedPage({
            url: result.url,
            title: result.title,
            content: result.content,
            word_count: result.word_count,
            status: 'scraped',
            scraped_by: 'user',
          })
        } catch (error) {
          response = `**Error scraping:** ${error instanceof Error ? error.message : 'Failed'}`
        }
        agentTag = '[TEC]'
        break
      }

      case '/search': {
        const searchQuery = parts.slice(1).join(' ')
        if (!searchQuery) {
          response = 'Usage: /search <query>\nExample: /search best CRM tools for small business'
          break
        }
        try {
          const searchResult = await ELECTRON_API.webSearch(searchQuery)
          if (searchResult.urls.length === 0) {
            response = `**No results found** for "${searchQuery}"`
          } else {
            response = `**Web search:** "${searchQuery}"\n\n`
            response += searchResult.urls.map((u: string, i: number) => `${i + 1}. ${u}`).join('\n')
            response += '\n\nUse /scrape <url> to read any of these pages.'
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Search failed'}`
        }
        agentTag = '[TEC]'
        break
      }

      case '/connect': {
        const connectArgs = parts.slice(1).join(' ')
        if (!connectArgs) {
          response = 'Usage: /connect <name> | <company> | <role>\nExample: /connect Ahmed Diallo | Mafalia Corp | CEO'
          break
        }
        const connectParts = connectArgs.split('|').map(s => s.trim())
        const connName = connectParts[0] || ''
        const connCompany = connectParts[1] || ''
        const connRole = connectParts[2] || ''
        if (!connName) {
          response = '**Error:** Name is required. Usage: /connect <name> | <company> | <role>'
          break
        }
        try {
          await addConnection({ name: connName, company: connCompany, role: connRole, source: 'chat' })
          response = `**Connection saved:**\n• **Name:** ${connName}`
          if (connCompany) response += `\n• **Company:** ${connCompany}`
          if (connRole) response += `\n• **Role:** ${connRole}`
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Failed to save connection'}`
        }
        agentTag = '[PAR]'
        break
      }

      case '/connections': {
        try {
          const conns = await getConnections()
          if (conns.length === 0) {
            response = '**No connections yet.** Use /connect <name> | <company> | <role> to add one.'
          } else {
            response = `**Connections (${conns.length}):**\n\n`
            response += conns.map((c: any) => {
              let line = `• **${c.name}**`
              if (c.role) line += ` - ${c.role}`
              if (c.company) line += ` at ${c.company}`
              return line
            }).join('\n')
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Failed to load connections'}`
        }
        agentTag = '[PAR]'
        break
      }

      case '/analyze': {
        const analyzeTarget = parts.slice(1).join(' ') || 'business'
        const analyzeMap: Record<string, string> = { revenue: 'zara', operations: 'kofi', customers: 'amara', inventory: 'idris', marketing: 'nala', finance: 'tariq', data: 'sana', system: 'ravi', growth: 'luna' }
        const analyzeAgent = analyzeMap[analyzeTarget.toLowerCase()] || 'sana'
        try {
          const result = await ELECTRON_API.askAgent(analyzeAgent, `analyze ${analyzeTarget} in detail`)
          response = formatAgentResponse(result)
          agentTag = result.tag || '[DAT]'
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Analysis failed'}`
        }
        break
      }

      case '/predict': {
        const predictTarget = parts.slice(1).join(' ') || 'revenue'
        const predictMap: Record<string, string> = { revenue: 'zara', churn: 'amara', inventory: 'idris', cashflow: 'tariq', growth: 'luna' }
        const predictAgent = predictMap[predictTarget.toLowerCase()] || 'sana'
        try {
          const result = await ELECTRON_API.askAgent(predictAgent, `predict future ${predictTarget} with forecasting`)
          response = formatAgentResponse(result)
          agentTag = result.tag || '[DAT]'
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Prediction failed'}`
        }
        break
      }

      case '/create': {
        const createTarget = parts.slice(1).join(' ') || ''
        if (!createTarget) {
          response = 'Usage: /create <type>\n\nTypes: campaign, code, experiment, business-plan, pitch-deck, report, sop'
          break
        }
        const createMap: Record<string, string> = { campaign: 'nala', code: 'ravi', experiment: 'luna', 'business-plan': 'omar', 'pitch-deck': 'omar', report: 'sana', sop: 'omar' }
        const createAgentKey = Object.keys(createMap).find(k => createTarget.toLowerCase().startsWith(k))
        const createAgent = createAgentKey ? createMap[createAgentKey] : 'omar'
        try {
          const result = await ELECTRON_API.askAgent(createAgent, `create a detailed ${createTarget}`)
          response = formatAgentResponse(result)
          agentTag = result.tag || '[MAF]'
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Creation failed'}`
        }
        break
      }

      case '/design': {
        const designTarget = parts.slice(1).join(' ') || ''
        if (!designTarget) {
          response = 'Usage: /design <type>\n\nTypes: social post, flyer, ad, logo concept, banner'
          break
        }
        try {
          const result = await ELECTRON_API.askAgent('nala', `design a ${designTarget} with detailed creative brief, copy, layout, and color suggestions`)
          response = formatAgentResponse(result)
          agentTag = '[MKT]'
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Design failed'}`
        }
        break
      }

      case '/automate': {
        const autoTarget = parts.slice(1).join(' ') || ''
        if (!autoTarget) {
          response = 'Usage: /automate <workflow>\n\nExamples: operations, restocking, reports, api, notifications'
          break
        }
        try {
          const result = await ELECTRON_API.askAgent('ravi', `design an automation workflow for ${autoTarget} with triggers, actions, and monitoring`)
          response = formatAgentResponse(result)
          agentTag = '[TEC]'
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Automation failed'}`
        }
        break
      }

      case '/research': {
        const researchTarget = parts.slice(1).join(' ') || ''
        if (!researchTarget) {
          response = 'Usage: /research <topic>\n\nExamples: trends, competitors, partners, market gaps'
          break
        }
        try {
          const result = await ELECTRON_API.askAgent('sana', `research ${researchTarget} with data-driven insights and actionable recommendations`)
          response = formatAgentResponse(result)
          agentTag = '[DAT]'
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Research failed'}`
        }
        break
      }

      case '/boss': {
        setShowAgentGrid(true)
        response = '**Boss dashboard opened.** Monitoring all 10 agent rooms.'
        agentTag = '[MAF]'
        break
      }

      case '/rooms': {
        response = '**Agent Rooms:**\n\n' + DEFAULT_AGENTS.map(a => `• **${a.name}** ${a.tag} -- ${a.room}`).join('\n')
        agentTag = '[MAF]'
        break
      }

      case '/agents':
        try {
          const result: any = await ELECTRON_API.getAgents()
          const agentsList = Array.isArray(result) ? result : (result?.agents || [])
          response = agentsList.length > 0 
            ? agentsList.map((a: any) => `${a.tag} **${a.name}** - ${a.title}`).join('\n')
            : DEFAULT_AGENTS.map(a => `${a.tag} **${a.name}** - ${a.title}`).join('\n')
        } catch {
          response = DEFAULT_AGENTS.map(a => `${a.tag} **${a.name}** - ${a.title}`).join('\n')
        }
        agentTag = '[MAF]'
        break
      case '/summary':
        try {
          const summary = await ELECTRON_API.getSummary()
          response = formatSummaryResponse(summary)
        } catch (error) {
          response = `**Error fetching summary:** ${error instanceof Error ? error.message : 'Failed to connect'}`
        }
        break
      case '/metrics':
        try {
          const metrics = await ELECTRON_API.getMetrics()
          response = formatMetricsResponse(metrics)
        } catch (error) {
          response = `**Error fetching metrics:** ${error instanceof Error ? error.message : 'Failed to connect'}`
        }
        break
      case '/ask':
        if (parts.length >= 3) {
          const agentName = parts[1]
          const question = parts.slice(2).join(' ')
          try {
            const result = await ELECTRON_API.askAgent(agentName, question)
            response = formatAgentResponse(result)
            agentTag = result.tag || '[MAF]'
          } catch (error) {
            response = `**Error:** ${error instanceof Error ? error.message : 'Agent request failed'}`
          }
        } else {
          response = 'Usage: /ask <agent_name> <question>\nExample: /ask zara revenue analysis'
        }
        break

      // ── Desktop Access Commands ─────────────────────────

      case '/browse': {
        const browsePath = parts.slice(1).join(' ')
        try {
          // Try Electron IPC first, fall back to Python bridge
          let result: any
          if (window.electronAPI?.fs) {
            result = await window.electronAPI.fs.readDir(browsePath || '')
          } else {
            result = await ELECTRON_API.browseDirectory(browsePath)
            // Normalize Python API response
            result = { path: result.path, entries: result.entries.map((e: any) => ({ ...e, isDirectory: e.is_directory, isFile: e.is_file })) }
          }
          if (result.error) {
            response = `**Error:** ${result.error}`
          } else {
            const dirs = result.entries.filter((e: any) => e.isDirectory)
            const files = result.entries.filter((e: any) => e.isFile)
            response = `**Browsing:** ${result.path}\n\n`
            if (dirs.length > 0) {
              response += `### Folders (${dirs.length})\n`
              response += dirs.slice(0, 30).map((d: any) => `• ${d.name}/`).join('\n')
              if (dirs.length > 30) response += `\n• ... and ${dirs.length - 30} more`
              response += '\n\n'
            }
            if (files.length > 0) {
              response += `### Files (${files.length})\n`
              response += files.slice(0, 30).map((f: any) => {
                const sizeStr = f.size < 1024 ? `${f.size} B` : f.size < 1024 * 1024 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / (1024 * 1024)).toFixed(1)} MB`
                return `• ${f.name} (${sizeStr})`
              }).join('\n')
              if (files.length > 30) response += `\n• ... and ${files.length - 30} more`
            }
            if (dirs.length === 0 && files.length === 0) {
              response += 'Empty directory'
            }
          }
        } catch (error) {
          response = `**Error browsing directory:** ${error instanceof Error ? error.message : 'Failed'}\n\nMake sure the Python bridge is running or you're in Electron.`
        }
        agentTag = '[TEC]'
        break
      }

      case '/read': {
        const filePath = parts.slice(1).join(' ')
        if (!filePath) {
          response = 'Usage: /read <file_path>\nExample: /read C:\\Users\\Documents\\data.csv'
          break
        }
        try {
          let result: any
          if (window.electronAPI?.fs) {
            result = await window.electronAPI.fs.readFile(filePath)
          } else {
            result = await ELECTRON_API.readDesktopFile(filePath)
          }
          if (result.error) {
            response = `**Error:** ${result.error}`
          } else {
            const preview = result.content.length > 3000 ? result.content.slice(0, 3000) + '\n\n... (truncated)' : result.content
            const sizeStr = result.size < 1024 ? `${result.size} B` : `${(result.size / 1024).toFixed(1)} KB`
            response = `**File:** ${filePath} (${sizeStr})\n\n${preview}`
          }
        } catch (error) {
          response = `**Error reading file:** ${error instanceof Error ? error.message : 'Failed'}`
        }
        agentTag = '[TEC]'
        break
      }

      case '/open': {
        const openPath = parts.slice(1).join(' ')
        if (!openPath) {
          response = 'Usage: /open <path>\nExample: /open C:\\Users\\Desktop'
          break
        }
        try {
          if (window.electronAPI?.shell) {
            await window.electronAPI.shell.openPath(openPath)
            response = `**Opened:** ${openPath}`
          } else {
            response = '**Error:** Desktop shell access requires Electron. Run the app as a desktop application.'
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Failed to open path'}`
        }
        agentTag = '[TEC]'
        break
      }

      case '/write': {
        const writePath = parts[1]
        const writeContent = parts.slice(2).join(' ')
        if (!writePath || !writeContent) {
          response = 'Usage: /write <path> <content>\nExample: /write C:\\Users\\notes.txt Hello world'
          break
        }
        try {
          if (window.electronAPI?.fs) {
            await window.electronAPI.fs.writeFile(writePath, writeContent)
          } else {
            await ELECTRON_API.writeDesktopFile(writePath, writeContent)
          }
          response = `**Written to:** ${writePath}`
        } catch (error) {
          response = `**Error writing file:** ${error instanceof Error ? error.message : 'Failed'}`
        }
        agentTag = '[TEC]'
        break
      }

      case '/csvs': {
        const csvDir = parts.slice(1).join(' ')
        try {
          const result = await ELECTRON_API.findCsvFiles(csvDir)
          if (result.csv_files.length === 0) {
            response = `**No CSV files found** in ${result.path}`
          } else {
            response = `**Found ${result.count} CSV files** in ${result.path}\n\n`
            response += result.csv_files.map((f: any) => `• **${f.name}** - ${f.size_human}\n  ${f.path}`).join('\n\n')
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Failed to scan for CSVs'}`
        }
        agentTag = '[DAT]'
        break
      }

      case '/system': {
        try {
          let info: any
          if (window.electronAPI?.system) {
            info = await window.electronAPI.system.info()
            response = `**System Information**\n\n`
            response += `• **Platform:** ${info.platform} (${info.arch})\n`
            response += `• **Hostname:** ${info.hostname}\n`
            response += `• **Node:** ${info.nodeVersion}\n`
            response += `• **Electron:** ${info.electronVersion}\n`
            response += `• **CPUs:** ${info.cpus}\n`
            response += `• **Memory:** ${(info.freeMemory / (1024 * 1024 * 1024)).toFixed(1)} GB free / ${(info.totalMemory / (1024 * 1024 * 1024)).toFixed(1)} GB total\n\n`
            response += `### Directories\n`
            response += `• **Home:** ${info.homeDir}\n`
            response += `• **Desktop:** ${info.desktopDir}\n`
            response += `• **Documents:** ${info.documentsDir}\n`
            response += `• **Downloads:** ${info.downloadsDir}\n`
            response += `• **Temp:** ${info.tempDir}`
          } else {
            info = await ELECTRON_API.getDesktopInfo()
            response = `**System Information**\n\n`
            response += `• **Platform:** ${info.platform}\n`
            response += `• **Hostname:** ${info.hostname}\n`
            response += `• **Python:** ${info.python_version}\n\n`
            response += `### Directories\n`
            response += `• **Home:** ${info.home_dir}\n`
            response += `• **Desktop:** ${info.desktop_dir}\n`
            response += `• **Documents:** ${info.documents_dir}\n`
            response += `• **Downloads:** ${info.downloads_dir}\n`
            response += `• **Data:** ${info.data_dir}`
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Failed to get system info'}`
        }
        agentTag = '[TEC]'
        break
      }

      // ── Knowledge Graph Commands ──────────────────────────

      case '/graph-build': {
        try {
          const buildMode = parts[1] || 'default'
          const isUpdate = parts.includes('--update')
          response = '**Building knowledge graph...** This may take a few minutes.\n\n'
          const result = await ELECTRON_API.graphBuild(undefined, buildMode, isUpdate)
          if (result.stats) {
            response += `**Graph built successfully!**\n\n`
            response += `• **Nodes:** ${result.stats.total_nodes}\n`
            response += `• **Edges:** ${result.stats.total_edges}\n`
            response += `• **Communities:** ${result.stats.communities}\n\n`
            response += `Output: ${result.output_dir}\n\n`
            response += `Use **/graph-query** to ask questions about your data.`
          } else {
            response += 'Graph built. Use /graph-status to check details.'
          }
        } catch (error) {
          response = `**Error building graph:** ${error instanceof Error ? error.message : 'Failed'}\n\nMake sure graphifyy is installed: \`pip install graphifyy && graphify install\``
        }
        agentTag = '[DAT]'
        break
      }

      case '/graph-query': {
        const gqQuestion = parts.slice(1).join(' ')
        if (!gqQuestion) {
          response = 'Usage: /graph-query <question>\nExample: /graph-query what connects revenue to customer retention?'
          break
        }
        try {
          const result = await ELECTRON_API.graphQuery(gqQuestion)
          if (result.answer) {
            response = `**Graph Query:** ${gqQuestion}\n\n${result.answer}`
          } else if (result.matches && result.matches.length > 0) {
            response = `**Graph Query:** ${gqQuestion}\n\n**Found ${result.total_matches} matches** (showing top ${Math.min(result.matches.length, 10)}):\n\n`
            response += result.matches.slice(0, 10).map((m: any) =>
              `• **${m.node}** (${m.type}) - ${m.description || 'No description'}\n  Connections: ${m.connections?.slice(0, 5).join(', ') || 'none'}`
            ).join('\n\n')
          } else {
            response = `**No results** for: ${gqQuestion}\n\nTry building the graph first with /graph-build`
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Query failed'}`
        }
        agentTag = '[DAT]'
        break
      }

      case '/graph-explain': {
        const concept = parts.slice(1).join(' ')
        if (!concept) {
          response = 'Usage: /graph-explain <concept>\nExample: /graph-explain transactions'
          break
        }
        try {
          const result = await ELECTRON_API.graphExplain(concept)
          if (result.explanation) {
            response = `**Explaining:** ${concept}\n\n${result.explanation}`
          } else if (result.concept) {
            response = `**${result.concept}** (degree: ${result.degree})\n\n`
            if (result.attributes) {
              const attrs = result.attributes
              if (attrs.type) response += `• **Type:** ${attrs.type}\n`
              if (attrs.description) response += `• **Description:** ${attrs.description}\n`
              if (attrs.community !== undefined) response += `• **Community:** ${attrs.community}\n`
            }
            if (result.connections && result.connections.length > 0) {
              response += `\n### Connections (${result.connections.length})\n`
              response += result.connections.slice(0, 15).map((c: any) =>
                `• ${c.relationship} → **${c.node}** (confidence: ${(c.confidence * 100).toFixed(0)}%)`
              ).join('\n')
            }
          } else {
            response = `Concept "${concept}" not found in graph.`
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Explain failed'}`
        }
        agentTag = '[DAT]'
        break
      }

      case '/graph-report': {
        try {
          const result = await ELECTRON_API.graphReport()
          if (result.report) {
            const preview = result.report.length > 4000 ? result.report.slice(0, 4000) + '\n\n... (truncated)' : result.report
            response = preview
          } else {
            response = 'No report available. Build the graph first with /graph-build'
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Failed to load report'}`
        }
        agentTag = '[DAT]'
        break
      }

      case '/graph-status': {
        try {
          const result = await ELECTRON_API.graphStatus()
          if (!result.available) {
            response = `**graphifyy not installed**\n\nInstall with:\n\`\`\`\npip install graphifyy && graphify install\n\`\`\``
          } else if (!result.built) {
            response = `**Knowledge Graph:** Not built yet\n\nRun **/graph-build** to create a knowledge graph from your business data.`
          } else {
            response = `**Knowledge Graph Status**\n\n`
            response += `• **Status:** Built\n`
            response += `• **Last Updated:** ${result.age}\n`
            response += `• **Data Dir:** ${result.data_dir}\n`
            if (result.stats) {
              response += `• **Nodes:** ${result.stats.total_nodes}\n`
              response += `• **Edges:** ${result.stats.total_edges}\n`
              response += `• **Communities:** ${result.stats.communities}\n`
              if (result.stats.node_types && Object.keys(result.stats.node_types).length > 0) {
                response += `\n### Node Types\n`
                response += Object.entries(result.stats.node_types).map(([t, c]) => `• **${t}:** ${c}`).join('\n')
              }
            }
          }
        } catch (error) {
          response = `**Error:** ${error instanceof Error ? error.message : 'Failed'}`
        }
        agentTag = '[DAT]'
        break
      }

      case '/clear':
        handleNewChat()
        return
      case '/config':
        setShowSetup(true)
        return
      default:
        response = `Unknown command: ${cmd}\n\nType /help to see available commands.`
    }

    const aiMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      agentTag,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, aiMsg])
  }

  const formatAgentResponse = (result: any): string => {
    let response = `**${result.agent}** - ${result.agent_title}\n\n`
    const data = result.data || result.response
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object') {
          response += `**${key}:**\n${JSON.stringify(value, null, 2)}\n\n`
        } else {
          response += `**${key}:** ${value}\n`
        }
      }
    }
    return response
  }

  const formatSummaryResponse = (summary: any): string => {
    let response = '**Full Business Health Check**\n\n'
    response += `Generated: ${summary.generated_at || new Date().toISOString()}\n`
    response += `Agents Active: ${summary.agents_active || 0}\n\n`
    
    if (summary.agent_reports) {
      for (const [agent, report] of Object.entries(summary.agent_reports)) {
        const r = report as any
        response += `### ${r.tag || '[AGT]'} ${agent}\n`
        if (r.data && typeof r.data === 'object') {
          for (const [key, value] of Object.entries(r.data)) {
            if (typeof value !== 'object') {
              response += `• ${key}: ${value}\n`
            }
          }
        }
        response += '\n'
      }
    }
    
    if (summary.cross_agent_alerts?.length > 0) {
      response += '**Alerts:**\n'
      for (const alert of summary.cross_agent_alerts) {
        response += `• [${alert.severity?.toUpperCase()}] ${alert.message}\n`
      }
    }
    
    return response
  }

  const formatMetricsResponse = (metrics: any): string => {
    let response = '**Live Business Metrics**\n\n'
    
    if (metrics.revenue) {
      response += `### Revenue\n`
      response += `• Total: ${metrics.revenue.total}\n`
      response += `• Transactions: ${metrics.revenue.transactions}\n`
      response += `• Avg Order: ${metrics.revenue.avg_order}\n\n`
    }
    
    if (metrics.customers) {
      response += `### Customers\n`
      response += `• Total: ${metrics.customers.total}\n`
      response += `• Active: ${metrics.customers.active}\n`
      response += `• Avg Spent: ${metrics.customers.avg_spent}\n\n`
    }
    
    if (metrics.operations) {
      response += `### Operations\n`
      response += `• Total Orders: ${metrics.operations.total_orders}\n\n`
    }
    
    if (metrics.inventory) {
      response += `### Inventory\n`
      response += `• Total Items: ${metrics.inventory.total_items}\n`
      response += `• Critical: ${metrics.inventory.critical}\n`
      response += `• Low Stock: ${metrics.inventory.low_stock}\n\n`
    }
    
    if (metrics.finance) {
      response += `### Finance\n`
      response += `• Health Score: ${metrics.finance.health_score}\n`
      response += `• Rating: ${metrics.finance.rating}\n`
    }
    
    return response
  }

  const handleAgentClick = (agentId: string) => {
    const agent = DEFAULT_AGENTS.find(a => a.id === agentId)
    if (!agent) return
    setActiveAgentHome(agent)
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0e14] text-zinc-100 font-sans overflow-hidden">
      <Sidebar 
        agents={DEFAULT_AGENTS}
        status={status}
        onAgentClick={handleAgentClick}
        onSettingsClick={() => setShowSetup(true)}
        onQuickAction={(action) => {
          if (action === 'summary') handleSendMessage('/summary')
          if (action === 'metrics') handleSendMessage('/metrics')
          if (action === 'create') handleSendMessage('/create campaign')
          if (action === 'research') handleSendMessage('/research trends')
        }}
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        currentChatId={currentChatId}
        onPrivacyClick={() => setShowPrivacy(true)}
        onAgentGridOpen={() => setShowAgentGrid(true)}
        onCommandPaletteOpen={() => setShowCommandPalette(true)}
      />
      
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        currentModel={currentModel}
        onSendMessage={handleSendMessage}
        onCommandPaletteOpen={() => setShowCommandPalette(true)}
        pendingInput={pendingInput}
        onPendingInputConsumed={() => setPendingInput('')}
        onAgentGridOpen={() => setShowAgentGrid(true)}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelect={(cmd, needsArgs) => {
          setShowCommandPalette(false)
          if (needsArgs) {
            setPendingInput(cmd)
          } else {
            handleSendMessage(cmd)
          }
        }}
      />

      <AgentEcosystem
        agents={DEFAULT_AGENTS}
        isOpen={showAgentGrid}
        onClose={() => setShowAgentGrid(false)}
        onAgentClick={handleAgentClick}
        onSendMessage={handleSendMessage}
      />

      {showSetup && (
        <SetupWizard
          config={config}
          onSave={saveConfig}
          onClose={() => setShowSetup(false)}
        />
      )}

      {showPrivacy && (
        <PrivacyModal onClose={() => setShowPrivacy(false)} />
      )}

      {activeAgentHome && (
        <AgentHome
          agent={activeAgentHome}
          isOpen={!!activeAgentHome}
          onClose={() => setActiveAgentHome(null)}
          onSendCommand={(cmd) => { setActiveAgentHome(null); handleSendMessage(cmd) }}
        />
      )}

    </div>
  )
}

export default App
