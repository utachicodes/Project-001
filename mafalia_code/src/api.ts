// API client for communicating with Python bridge API
const ELECTRON_API = {
  // Base URL for Python bridge API
  baseUrl: 'http://127.0.0.1:9777',
  
  // Check if Python backend is running
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`)
      return res.ok
    } catch {
      return false
    }
  },

  // Get all agents
  async getAgents(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/agents`)
    if (!res.ok) throw new Error('Failed to fetch agents')
    return res.json()
  },

  // Ask a specific agent
  async askAgent(agent: string, message: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/agents/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, message })
    })
    if (!res.ok) throw new Error('Agent request failed')
    return res.json()
  },

  // Orchestrate across agents
  async orchestrate(request: string, maxAgents: number = 3): Promise<any> {
    const res = await fetch(`${this.baseUrl}/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, max_agents: maxAgents })
    })
    if (!res.ok) throw new Error('Orchestration failed')
    return res.json()
  },

  // Get business summary
  async getSummary(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/summary`)
    if (!res.ok) throw new Error('Summary failed')
    return res.json()
  },

  // Get metrics
  async getMetrics(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/metrics`)
    if (!res.ok) throw new Error('Metrics failed')
    return res.json()
  }
}

export default ELECTRON_API
