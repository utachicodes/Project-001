// mafalia.com API Client
// Connects to the mafalia.com platform for real business data

const API_BASE_URL = 'https://api.mafalia.com/v1'  // Replace with actual API URL

export interface MafaliaUser {
  id: string
  name: string
  email: string
  businessName: string
}

export interface MafaliaConnection {
  token: string
  user: MafaliaUser
  expiresAt: string
}

class MafaliaApiClient {
  private token: string | null = null
  private baseUrl: string = API_BASE_URL

  // Set API token after login
  setToken(token: string) {
    this.token = token
    localStorage.setItem('mafalia_token', token)
  }

  // Get stored token
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('mafalia_token')
    }
    return this.token
  }

  // Check if connected
  isConnected(): boolean {
    return !!this.getToken()
  }

  // Get auth headers
  private headers(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  // Login to mafalia.com
  async login(email: string, password: string): Promise<MafaliaConnection> {
    // For demo, simulate login - replace with actual API call
    // const res = await fetch(`${this.baseUrl}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // })
    // const data = await res.json()
    
    // Demo mode - simulate successful login
    const mockConnection: MafaliaConnection = {
      token: 'demo_token_' + Date.now(),
      user: {
        id: 'user_001',
        name: 'Demo User',
        email: email,
        businessName: 'Mafalia Restaurant'
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    
    this.setToken(mockConnection.token)
    return mockConnection
  }

  // Get user profile
  async getUser(): Promise<MafaliaUser | null> {
    if (!this.isConnected()) return null
    
    // Demo mode
    return {
      id: 'user_001',
      name: 'Demo User',
      email: 'user@mafalia.com',
      businessName: 'Mafalia Restaurant'
    }
  }

  // Get business data
  async getBusinessData(endpoint: string): Promise<any> {
    if (!this.isConnected()) {
      throw new Error('Not connected to mafalia.com')
    }

    // In production, this would call the real API
    // const res = await fetch(`${this.baseUrl}${endpoint}`, {
    //   headers: this.headers()
    // })
    // return res.json()

    // For demo, return sample data from local bridge API
    const res = await fetch(`http://127.0.0.1:9777${endpoint}`, {
      headers: { 'Content-Type': 'application/json' }
    })
    return res.json()
  }

  // Quick data queries
  async getRevenue(): Promise<any> {
    return this.getBusinessData('/summary')
  }

  async getOrders(): Promise<any> {
    return this.getBusinessData('/agents/ask')
  }

  async getInventory(): Promise<any> {
    return this.getBusinessData('/agents/ask')
  }

  // Chat with AI (sends to backend which routes to appropriate agent)
  async chat(message: string): Promise<{ response: string; data?: any }> {
    if (!this.isConnected()) {
      throw new Error('Please connect to mafalia.com first')
    }

    // Use local bridge API for now (until real API is ready)
    try {
      // Try orchestrate endpoint
      const res = await fetch('http://127.0.0.1:9777/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: message, max_agents: 3 })
      })
      
      if (res.ok) {
        const data = await res.json()
        return { response: this.formatOrchestratorResponse(data), data }
      }
    } catch (e) {
      console.error('API error:', e)
    }

    return { response: 'I\'m having trouble connecting to your data. Please try again.' }
  }

  private formatOrchestratorResponse(data: any): string {
    if (data.summary) {
      return data.summary
    }
    return JSON.stringify(data, null, 2)
  }

  // Logout
  logout() {
    this.token = null
    localStorage.removeItem('mafalia_token')
  }
}

export const mafaliaApi = new MafaliaApiClient()
export default mafaliaApi
