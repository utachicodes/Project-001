import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import SetupWizard from './components/SetupWizard'
import { Config, Message, Agent } from './types'

const DEFAULT_AGENTS: Agent[] = [
  { id: 'zara', name: 'Zara', tag: '[REV]', title: 'Revenue Strategist', color: '#FF6B35' },
  { id: 'kofi', name: 'Kofi', tag: '[OPS]', title: 'Operations Commander', color: '#2E86AB' },
  { id: 'amara', name: 'Amara', tag: '[CUS]', title: 'Customer Champion', color: '#A23B72' },
  { id: 'idris', name: 'Idris', tag: '[INV]', title: 'Inventory Guardian', color: '#1B998B' },
  { id: 'nala', name: 'Nala', tag: '[MKT]', title: 'Marketing Maven', color: '#F77F00' },
  { id: 'tariq', name: 'Tariq', tag: '[FIN]', title: 'Finance Wizard', color: '#6C5B7B' },
  { id: 'sana', name: 'Sana', tag: '[DAT]', title: 'Data Scientist', color: '#2D6A4F' },
  { id: 'ravi', name: 'Ravi', tag: '[TEC]', title: 'Tech Architect', color: '#E63946' },
  { id: 'luna', name: 'Luna', tag: '[GRO]', title: 'Growth Hacker', color: '#9B5DE5' },
  { id: 'omar', name: 'Omar', tag: '[PAR]', title: 'Partnership Connector', color: '#06D6A0' },
]

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome to Mafalia Code!

I'm your business operations CoWork assistant, powered by 10 specialized AI agents. I can help you with:

• Revenue analysis and pricing strategy
• Inventory management and stock alerts  
• Customer insights and churn prevention
• Marketing campaigns and ROI tracking
• Financial health and cash flow
• Growth experiments and partnerships

**Quick actions:**
• Click any agent in the sidebar for a domain briefing
• Type /summary for a full business health check
• Type /metrics for live KPI dashboard
• Type /help to see all commands

How can I help you today?`,
  agentTag: '[MAF]',
  timestamp: new Date().toISOString(),
}

function App() {
  const [config, setConfig] = useState<Config | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('Not connected')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const saved = await window.electronAPI.config.load()
      if (saved) {
        setConfig(saved)
        setStatus(`Connected: ${saved.provider}/${saved.model}`)
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
    setStatus(`Connected: ${newConfig.provider}/${newConfig.model}`)
    setShowSetup(false)
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

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
      handleCommand(content)
      setIsLoading(false)
      return
    }

    // Simulate AI response (in real app, this calls the LLM API)
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your request: "${content}"\n\nTo get real business data, I would route this to the appropriate Mafalia agent and return actual insights from your data.\n\n**Next step:** Configure an API key in settings to enable live data access.`,
        agentTag: '[MAF]',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsLoading(false)
    }, 1000)
  }

  const handleCommand = (command: string) => {
    const parts = command.split(' ')
    const cmd = parts[0].toLowerCase()
    
    let response = ''
    let agentTag = '[MAF]'

    switch (cmd) {
      case '/help':
        response = `**Available Commands:**

/agents - List all 10 agents and their superpowers
/summary - Full business health check across all domains
/metrics - Live KPI dashboard
/ask <agent> <question> - Ask a specific agent
/cost - Show token usage and cost
/config - Open settings
/clear - Clear conversation history
/help - Show this help message

**Tip:** Click any agent in the sidebar for a quick briefing.`
        break
      case '/agents':
        response = DEFAULT_AGENTS.map(a => 
          `${a.tag} **${a.name}** - ${a.title}`
        ).join('\n')
        agentTag = '[MAF]'
        break
      case '/summary':
        response = `**Business Summary (Demo Mode)**

This would run a full health check across all 10 agents:
• Zara [REV]: Revenue trends and pricing opportunities
• Kofi [OPS]: Operational efficiency and bottlenecks  
• Amara [CUS]: Customer health and churn risk
• Idris [INV]: Stock levels and reorder needs
• Nala [MKT]: Campaign performance and ROI
• Tariq [FIN]: Cash flow and financial health
• Sana [DAT]: Data anomalies and forecasts
• Ravi [TEC]: System health and security
• Luna [GRO]: Growth metrics and experiments
• Omar [PAR]: Partnership opportunities

*Connect an API key to see real data.*`
        break
      case '/metrics':
        response = `**Live Metrics (Demo Mode)**

Real-time KPIs would appear here with:
• Revenue today vs yesterday
• Active orders and queue depth
• Stock alerts and critical items
• Customer satisfaction scores
• Marketing campaign CTRs
• Financial ratios and cash position

*Configure API access to enable live metrics.*`
        break
      case '/clear':
        setMessages([WELCOME_MESSAGE])
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

  const handleAgentClick = (agentId: string) => {
    const agent = DEFAULT_AGENTS.find(a => a.id === agentId)
    if (!agent) return

    handleSendMessage(`/ask ${agentId} Give me a quick overview of your domain`)
  }

  return (
    <div className="flex h-screen w-full bg-mafalia-bg text-mafalia-text font-sans overflow-hidden">
      <Sidebar 
        agents={DEFAULT_AGENTS}
        status={status}
        onAgentClick={handleAgentClick}
        onSettingsClick={() => setShowSetup(true)}
        onQuickAction={(action) => {
          if (action === 'summary') handleSendMessage('/summary')
          if (action === 'metrics') handleSendMessage('/metrics')
          if (action === 'clear') handleSendMessage('/clear')
        }}
      />
      
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />

      {showSetup && (
        <SetupWizard
          config={config}
          onSave={saveConfig}
          onClose={() => setShowSetup(false)}
        />
      )}
    </div>
  )
}

export default App
