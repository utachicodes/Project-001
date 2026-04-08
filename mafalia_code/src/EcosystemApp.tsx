import { useState, useEffect, useRef } from 'react'
import { mafaliaApi } from './mafaliaApi'
import { Message } from './types'

// Agent definitions with their MemPalace wings
const AGENTS = [
  { 
    id: 'zara', 
    name: 'Zara', 
    tag: '[REV]', 
    title: 'Revenue Strategist',
    color: '#FF6B35',
    wing: 'North Tower',
    currentTask: 'Analyzing revenue streams...',
    icon: '💰',
    x: 20, y: 20
  },
  { 
    id: 'kofi', 
    name: 'Kofi', 
    tag: '[OPS]', 
    title: 'Operations Commander',
    color: '#2E86AB',
    wing: 'East Wing',
    currentTask: 'Monitoring operations...',
    icon: '⚡',
    x: 80, y: 20
  },
  { 
    id: 'amara', 
    name: 'Amara', 
    tag: '[CUS]', 
    title: 'Customer Champion',
    color: '#A23B72',
    wing: 'South Garden',
    currentTask: 'Checking customer sentiment...',
    icon: '💝',
    x: 20, y: 50
  },
  { 
    id: 'idris', 
    name: 'Idris', 
    tag: '[INV]', 
    title: 'Inventory Guardian',
    color: '#1B998B',
    wing: 'West Wing',
    currentTask: 'Tracking stock levels...',
    icon: '📦',
    x: 80, y: 50
  },
  { 
    id: 'nala', 
    name: 'Nala', 
    tag: '[MKT]', 
    title: 'Marketing Maven',
    color: '#F77F00',
    wing: 'Creative Loft',
    currentTask: 'Designing campaigns...',
    icon: '📢',
    x: 35, y: 35
  },
  { 
    id: 'tariq', 
    name: 'Tariq', 
    tag: '[FIN]', 
    title: 'Finance Wizard',
    color: '#6C5B7B',
    wing: 'Vault Room',
    currentTask: 'Calculating cash flow...',
    icon: '💎',
    x: 65, y: 35
  },
  { 
    id: 'sana', 
    name: 'Sana', 
    tag: '[DAT]', 
    title: 'Data Scientist',
    color: '#2D6A4F',
    wing: 'Observatory',
    currentTask: 'Mining insights...',
    icon: '🔬',
    x: 35, y: 65
  },
  { 
    id: 'ravi', 
    name: 'Ravi', 
    tag: '[TEC]', 
    title: 'Tech Architect',
    color: '#E63946',
    wing: 'Engineering Bay',
    currentTask: 'Optimizing systems...',
    icon: '🔧',
    x: 65, y: 65
  },
  { 
    id: 'luna', 
    name: 'Luna', 
    tag: '[GRO]', 
    title: 'Growth Hacker',
    color: '#9B5DE5',
    wing: 'Innovation Lab',
    currentTask: 'Running experiments...',
    icon: '🚀',
    x: 50, y: 15
  },
  { 
    id: 'omar', 
    name: 'Omar', 
    tag: '[PAR]', 
    title: 'Partnership Connector',
    color: '#06D6A0',
    wing: 'Diplomatic Hall',
    currentTask: 'Negotiating deals...',
    icon: '🤝',
    x: 50, y: 85
  },
]

// Activity log entry
interface Activity {
  id: string
  agent: string
  action: string
  timestamp: Date
  type: 'work' | 'collab' | 'alert' | 'idle'
}

// Agent state
interface AgentState {
  id: string
  status: 'working' | 'idle' | 'collaborating' | 'alert'
  currentTask: string
  lastActivity: Date
  diary: string[]
  connections: string[]  // IDs of agents they're connected to
}

function EcosystemApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({})
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [globalPulse, setGlobalPulse] = useState(0)
  const activityLogRef = useRef<HTMLDivElement>(null)

  // Initialize agent states
  useEffect(() => {
    const initialStates: Record<string, AgentState> = {}
    AGENTS.forEach(agent => {
      initialStates[agent.id] = {
        id: agent.id,
        status: 'idle',
        currentTask: agent.currentTask,
        lastActivity: new Date(),
        diary: [`${agent.name} initialized and ready`],
        connections: []
      }
    })
    setAgentStates(initialStates)

    // Check connection
    const connected = mafaliaApi.isConnected()
    setIsConnected(connected)
    if (connected) {
      mafaliaApi.getUser().then(setUser)
    }
  }, [])

  // Simulation loop - agents work 24/7
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      setGlobalPulse(p => p + 1)
      
      setAgentStates(prev => {
        const next = { ...prev }
        
        // Randomly update agents
        AGENTS.forEach(agent => {
          const state = next[agent.id]
          const rand = Math.random()
          
          if (rand < 0.3) {
            // Agent starts working
            state.status = 'working'
            state.currentTask = generateTask(agent.id)
            state.lastActivity = new Date()
            addActivity(agent.id, state.currentTask, 'work')
            
            // Add to diary
            state.diary.push(`[${new Date().toLocaleTimeString()}] ${state.currentTask}`)
            if (state.diary.length > 10) state.diary.shift()
            
          } else if (rand < 0.4) {
            // Agent collaborates with another
            const otherAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
            if (otherAgent.id !== agent.id) {
              state.status = 'collaborating'
              state.currentTask = `Collaborating with ${otherAgent.name}...`
              state.connections = [otherAgent.id]
              state.lastActivity = new Date()
              addActivity(agent.id, `Started collaboration with ${otherAgent.name}`, 'collab')
            }
          } else if (rand < 0.5) {
            // Agent goes idle briefly
            state.status = 'idle'
            state.currentTask = 'Monitoring...'
            state.connections = []
          }
        })
        
        return next
      })
    }, 3000)  // Update every 3 seconds

    return () => clearInterval(interval)
  }, [isConnected])

  // Auto-scroll activity log
  useEffect(() => {
    if (activityLogRef.current) {
      activityLogRef.current.scrollTop = activityLogRef.current.scrollHeight
    }
  }, [activities])

  const addActivity = (agentId: string, action: string, type: Activity['type']) => {
    const agent = AGENTS.find(a => a.id === agentId)
    setActivities(prev => [...prev, {
      id: Date.now().toString(),
      agent: agent?.name || agentId,
      action,
      timestamp: new Date(),
      type
    }].slice(-50))  // Keep last 50
  }

  const generateTask = (agentId: string): string => {
    const tasks: Record<string, string[]> = {
      zara: ['Analyzing Q3 revenue...', 'Calculating profit margins...', 'Forecasting sales...', 'Price optimization...'],
      kofi: ['Checking kitchen efficiency...', 'Monitoring delivery times...', 'Staff scheduling...', 'Quality control...'],
      amara: ['Reading customer reviews...', 'Updating loyalty program...', 'Checking churn rate...', 'Personalizing offers...'],
      idris: ['Scanning inventory...', 'Detecting low stock...', 'Optimizing storage...', 'Waste analysis...'],
      nala: ['Designing new campaign...', 'A/B testing ads...', 'Social media monitoring...', 'ROI calculation...'],
      tariq: ['Cash flow projection...', 'Expense tracking...', 'Budget variance...', 'Financial reporting...'],
      sana: ['Data pattern detection...', 'Trend analysis...', 'Anomaly scanning...', 'Predictive modeling...'],
      ravi: ['Security scan...', 'System optimization...', 'API monitoring...', 'Performance tuning...'],
      luna: ['Growth experiment #47...', 'Funnel analysis...', 'Conversion tracking...', 'Viral loop design...'],
      omar: ['Partner outreach...', 'Deal negotiation...', 'Contract review...', 'Supplier evaluation...']
    }
    const list = tasks[agentId] || ['Processing...']
    return list[Math.floor(Math.random() * list.length)]
  }

  const handleLogin = async () => {
    try {
      const connection = await mafaliaApi.login(loginEmail, 'password')
      setUser(connection.user)
      setIsConnected(true)
      setShowLogin(false)
      addActivity('system', `${connection.user.name} connected to ecosystem`, 'work')
    } catch (e) {
      // Demo mode - accept anything
      setUser({ name: loginEmail.split('@')[0] || 'User', business: 'Mafalia' })
      setIsConnected(true)
      setShowLogin(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return '#3FB950'
      case 'collaborating': return '#9B5DE5'
      case 'alert': return '#F85149'
      default: return '#8B949E'
    }
  }

  return (
    <div className="h-screen bg-mafalia-bg text-mafalia-text overflow-hidden flex flex-col">
      {/* Header */}
      <header className="h-14 bg-mafalia-sidebar border-b border-mafalia-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src="/mafalia-logo.png" alt="Mafalia" className="w-8 h-8 rounded" />
          <div>
            <h1 className="font-bold text-mafalia-accent">MAFALIA</h1>
            <span className="text-xs text-mafalia-text-dim">AI Ecosystem Monitor</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-mafalia-card rounded-full">
            <span className={`w-2 h-2 rounded-full animate-pulse`} 
                  style={{ backgroundColor: isConnected ? '#3FB950' : '#F85149' }} />
            <span className="text-sm">{isConnected ? 'ECOSYSTEM ACTIVE' : 'OFFLINE'}</span>
          </div>
          
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-mafalia-text-dim">{user?.name}</span>
              <button onClick={() => { setIsConnected(false); setUser(null) }}
                      className="text-xs px-2 py-1 bg-mafalia-card rounded hover:bg-mafalia-border">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)}
                    className="px-4 py-1.5 bg-mafalia-accent hover:bg-mafalia-accent-hover rounded text-sm font-medium">
              Connect
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ecosystem Map */}
        <div className="flex-1 relative bg-gradient-to-br from-mafalia-bg via-mafalia-sidebar to-mafalia-bg p-6">
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center">
                <p className="text-xl mb-4">Connect to activate the ecosystem</p>
                <button onClick={() => setShowLogin(true)}
                        className="px-6 py-3 bg-mafalia-accent hover:bg-mafalia-accent-hover rounded-lg font-bold">
                  Connect to mafalia.com
                </button>
              </div>
            </div>
          )}

          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {Object.values(agentStates).map(state => 
              state.connections.map(connId => {
                const agent1 = AGENTS.find(a => a.id === state.id)
                const agent2 = AGENTS.find(a => a.id === connId)
                if (!agent1 || !agent2) return null
                return (
                  <line
                    key={`${state.id}-${connId}`}
                    x1={`${agent1.x}%`} y1={`${agent1.y}%`}
                    x2={`${agent2.x}%`} y2={`${agent2.y}%`}
                    stroke="#9B5DE5"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                )
              })
            )}
          </svg>

          {/* Agent Houses */}
          {AGENTS.map(agent => {
            const state = agentStates[agent.id]
            if (!state) return null
            
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ${
                  selectedAgent === agent.id ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                }`}
                style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
              >
                {/* House/Building */}
                <div 
                  className="relative w-24 h-24 rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-1 transition-all"
                  style={{ 
                    backgroundColor: `${agent.color}15`,
                    borderColor: state.status === 'working' ? agent.color : '#30363D',
                    boxShadow: state.status === 'working' ? `0 0 20px ${agent.color}40` : 'none'
                  }}
                >
                  {/* Status Indicator */}
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-mafalia-bg"
                    style={{ backgroundColor: getStatusColor(state.status) }}
                  />
                  
                  {/* Icon */}
                  <span className="text-2xl">{agent.icon}</span>
                  
                  {/* Name */}
                  <span className="text-xs font-bold text-center leading-tight">{agent.name}</span>
                  
                  {/* Status Badge */}
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ 
                      backgroundColor: `${getStatusColor(state.status)}20`,
                      color: getStatusColor(state.status)
                    }}
                  >
                    {state.status}
                  </span>
                </div>

                {/* Task Tooltip */}
                {state.status === 'working' && (
                  <div 
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-mafalia-card rounded-lg text-xs whitespace-nowrap border border-mafalia-border z-30"
                  >
                    {state.currentTask}
                  </div>
                )}
              </div>
            )
          })}

          {/* Center Hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-mafalia-card border-2 border-mafalia-accent flex items-center justify-center animate-pulse">
            <span className="text-3xl">🏛️</span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-mafalia-card/90 backdrop-blur rounded-lg p-3 border border-mafalia-border text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3FB950]" /> Working
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9B5DE5]" /> Collaborating
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B949E]" /> Monitoring
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-80 bg-mafalia-sidebar border-l border-mafalia-border flex flex-col">
          {/* Selected Agent Detail */}
          {selectedAgent ? (
            <div className="p-4 border-b border-mafalia-border">
              {(() => {
                const agent = AGENTS.find(a => a.id === selectedAgent)
                const state = agentStates[selectedAgent]
                if (!agent || !state) return null
                
                return (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{agent.icon}</span>
                      <div>
                        <h3 className="font-bold">{agent.name}</h3>
                        <p className="text-xs text-mafalia-text-dim">{agent.wing}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-mafalia-text-dim">Status:</span>
                        <span style={{ color: getStatusColor(state.status) }} className="capitalize">
                          {state.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mafalia-text-dim">Current Task:</span>
                      </div>
                      <p className="text-xs bg-mafalia-card p-2 rounded">{state.currentTask}</p>
                      
                      <div className="flex justify-between mt-3">
                        <span className="text-mafalia-text-dim">Last Active:</span>
                        <span className="text-xs">{state.lastActivity.toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Diary */}
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-mafalia-text-dim uppercase mb-2">Agent Diary</h4>
                      <div className="bg-mafalia-bg rounded-lg p-2 max-h-32 overflow-y-auto text-xs space-y-1">
                        {state.diary.map((entry, i) => (
                          <p key={i} className="text-mafalia-text-dim border-l-2 border-mafalia-border pl-2">
                            {entry}
                          </p>
                        ))}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          ) : (
            <div className="p-4 border-b border-mafalia-border text-center text-sm text-mafalia-text-dim">
              Click an agent to view their activity
            </div>
          )}

          {/* Activity Feed */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 bg-mafalia-card border-b border-mafalia-border">
              <h3 className="text-sm font-bold">Live Activity Feed</h3>
            </div>
            
            <div ref={activityLogRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {activities.length === 0 ? (
                <p className="text-xs text-mafalia-text-dim text-center py-8">
                  {isConnected ? 'Agents initializing...' : 'Connect to see activity'}
                </p>
              ) : (
                activities.slice().reverse().map(activity => (
                  <div 
                    key={activity.id}
                    className="text-xs p-2 rounded bg-mafalia-card border-l-2 animate-in slide-in-from-right"
                    style={{ 
                      borderLeftColor: 
                        activity.type === 'work' ? '#3FB950' : 
                        activity.type === 'collab' ? '#9B5DE5' : '#8B949E'
                    }}
                  >
                    <span className="font-bold" style={{ color: AGENTS.find(a => a.name === activity.agent)?.color }}>
                      {activity.agent}
                    </span>
                    <span className="text-mafalia-text-dim ml-1">{activity.action}</span>
                    <span className="text-mafalia-text-dim/50 block mt-0.5">
                      {activity.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Global Stats */}
          <div className="p-4 border-t border-mafalia-border">
            <h4 className="text-xs font-bold text-mafalia-text-dim uppercase mb-2">Ecosystem Health</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-mafalia-card rounded p-2">
                <div className="text-lg font-bold text-mafalia-accent">
                  {Object.values(agentStates).filter(s => s.status === 'working').length}
                </div>
                <div className="text-[10px] text-mafalia-text-dim">Active</div>
              </div>
              <div className="bg-mafalia-card rounded p-2">
                <div className="text-lg font-bold text-mafalia-success">
                  {activities.filter(a => a.type === 'collab').length}
                </div>
                <div className="text-[10px] text-mafalia-text-dim">Collabs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-mafalia-sidebar rounded-2xl p-6 border border-mafalia-border w-80">
            <div className="text-center mb-4">
              <img src="/mafalia-logo.png" alt="Mafalia" className="w-16 h-16 mx-auto mb-3 rounded" />
              <h2 className="text-xl font-bold">Enter the Ecosystem</h2>
              <p className="text-sm text-mafalia-text-dim">Watch your 10 AI agents live</p>
            </div>
            
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-mafalia-card border border-mafalia-border rounded-lg mb-3 text-sm outline-none focus:border-mafalia-accent"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-mafalia-accent hover:bg-mafalia-accent-hover rounded-lg font-bold mb-2"
            >
              Connect
            </button>
            
            <button
              onClick={() => setShowLogin(false)}
              className="w-full py-2 text-sm text-mafalia-text-dim hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EcosystemApp
