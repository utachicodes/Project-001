import { useState, useEffect } from 'react'
import SimpleChat from './components/SimpleChat'
import { mafaliaApi, MafaliaUser } from './mafaliaApi'
import { Message } from './types'
import { Menu, X, User as UserIcon, LogOut, Settings, ChevronRight } from 'lucide-react'

const AGENTS = [
  { id: 'zara', name: 'Zara', tag: '[REV]', title: 'Revenue', color: '#FF6B35' },
  { id: 'kofi', name: 'Kofi', tag: '[OPS]', title: 'Operations', color: '#2E86AB' },
  { id: 'amara', name: 'Amara', tag: '[CUS]', title: 'Customers', color: '#A23B72' },
  { id: 'idris', name: 'Idris', tag: '[INV]', title: 'Inventory', color: '#1B998B' },
]

function SimpleApp() {
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<MafaliaUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Check connection on mount
  useEffect(() => {
    const connected = mafaliaApi.isConnected()
    setIsConnected(connected)
    if (connected) {
      mafaliaApi.getUser().then(setUser)
    }
  }, [])

  const handleLogin = async () => {
    try {
      const connection = await mafaliaApi.login(loginEmail, loginPassword)
      setUser(connection.user)
      setIsConnected(true)
      setShowLogin(false)
    } catch (e) {
      alert('Login failed. Try demo@mafalia.com / password')
    }
  }

  const handleLogout = () => {
    mafaliaApi.logout()
    setIsConnected(false)
    setUser(null)
    setMessages([])
  }

  const handleSendMessage = async (content: string) => {
    if (!isConnected) {
      setShowLogin(true)
      return
    }

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      // Get AI response from mafalia API
      const result = await mafaliaApi.chat(content)
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I could not connect to your mafalia.com data. Please check your connection.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    if (action === 'revenue') handleSendMessage("What's my revenue summary?")
    if (action === 'customers') handleSendMessage("Show me customer insights")
    if (action === 'inventory') handleSendMessage("Check inventory levels")
    if (action === 'orders') handleSendMessage("Show recent orders")
  }

  return (
    <div className="flex h-screen w-full bg-mafalia-bg text-mafalia-text font-sans overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-mafalia-card rounded-lg border border-mafalia-border"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static w-[240px] h-full bg-mafalia-sidebar border-r border-mafalia-border flex flex-col z-40 transition-transform duration-200`}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-mafalia-border">
          <img src="/mafalia-logo.png" alt="Mafalia" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <span className="font-bold text-mafalia-accent">MAFALIA</span>
            <span className="font-bold text-white ml-1">CODE</span>
          </div>
        </div>

        {/* User Info */}
        {isConnected && user && (
          <div className="p-4 border-b border-mafalia-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-mafalia-accent/20 flex items-center justify-center">
                <UserIcon size={16} className="text-mafalia-accent" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-mafalia-text-dim truncate">{user.businessName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-4 space-y-1">
          <p className="text-[10px] uppercase text-mafalia-text-dim font-semibold tracking-wider mb-2">Quick Actions</p>
          {[
            { id: 'revenue', label: 'Revenue', icon: '💰' },
            { id: 'customers', label: 'Customers', icon: '👥' },
            { id: 'inventory', label: 'Inventory', icon: '📦' },
            { id: 'orders', label: 'Orders', icon: '📋' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleQuickAction(item.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-mafalia-text hover:bg-mafalia-card transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
              <ChevronRight size={14} className="ml-auto text-mafalia-text-dim" />
            </button>
          ))}
        </div>

        {/* Agents */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] uppercase text-mafalia-text-dim font-semibold tracking-wider mb-2">Your Agents</p>
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => handleSendMessage(`Ask ${agent.name}: give me a quick update`)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-mafalia-card transition-colors"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} />
              <span className="text-mafalia-text">{agent.name}</span>
              <span className="text-[10px] text-mafalia-text-dim ml-auto">{agent.tag}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-mafalia-border space-y-1">
          {isConnected ? (
            <>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-mafalia-text-dim hover:bg-mafalia-card transition-colors">
                <Settings size={16} />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-mafalia-error hover:bg-mafalia-card transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full px-3 py-2 bg-mafalia-accent hover:bg-mafalia-accent-hover text-white text-sm rounded-lg transition-colors"
            >
              Connect to mafalia.com
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <SimpleChat
        messages={messages}
        isLoading={isLoading}
        isConnected={isConnected}
        onSendMessage={handleSendMessage}
        onConnect={() => setShowLogin(true)}
        userName={user?.name}
      />

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-mafalia-sidebar rounded-2xl w-full max-w-sm p-6 border border-mafalia-border">
            <div className="text-center mb-6">
              <img src="/mafalia-logo.png" alt="Mafalia" className="w-12 h-12 mx-auto mb-3 rounded-lg" />
              <h2 className="text-xl font-bold text-white">Connect to mafalia.com</h2>
              <p className="text-sm text-mafalia-text-dim mt-1">Access your business data</p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-mafalia-card border border-mafalia-border rounded-lg text-white placeholder-mafalia-text-dim outline-none focus:border-mafalia-accent"
              />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-mafalia-card border border-mafalia-border rounded-lg text-white placeholder-mafalia-text-dim outline-none focus:border-mafalia-accent"
              />
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-mafalia-accent hover:bg-mafalia-accent-hover text-white font-semibold rounded-lg transition-colors"
              >
                Connect
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="w-full py-3 text-mafalia-text-dim hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-mafalia-text-dim text-center mt-4">
              Demo: use any email/password
            </p>
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default SimpleApp
