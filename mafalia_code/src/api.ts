// API client for communicating with Python bridge API
const ELECTRON_API = {
  baseUrl: 'http://127.0.0.1:9777',

  // ── Health & Backend ────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`)
      return res.ok
    } catch {
      return false
    }
  },

  // ── Agents ──────────────────────────────────────────

  async getAgents(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/agents`)
    if (!res.ok) throw new Error('Failed to fetch agents')
    return res.json()
  },

  async askAgent(agent: string, message: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/agents/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, message })
    })
    if (!res.ok) throw new Error('Agent request failed')
    return res.json()
  },

  async orchestrate(request: string, maxAgents: number = 3): Promise<any> {
    const res = await fetch(`${this.baseUrl}/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, max_agents: maxAgents })
    })
    if (!res.ok) throw new Error('Orchestration failed')
    return res.json()
  },

  async getSummary(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/summary`)
    if (!res.ok) throw new Error('Summary failed')
    return res.json()
  },

  async getMetrics(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/metrics`)
    if (!res.ok) throw new Error('Metrics failed')
    return res.json()
  },

  // ── Desktop Access ──────────────────────────────────

  async getDesktopInfo(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/desktop/info`)
    if (!res.ok) throw new Error('Failed to get desktop info')
    return res.json()
  },

  async browseDirectory(dirPath: string = ''): Promise<any> {
    const res = await fetch(`${this.baseUrl}/desktop/browse?path=${encodeURIComponent(dirPath)}`)
    if (!res.ok) throw new Error('Failed to browse directory')
    return res.json()
  },

  async readDesktopFile(filePath: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/desktop/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath })
    })
    if (!res.ok) throw new Error('Failed to read file')
    return res.json()
  },

  async writeDesktopFile(filePath: string, content: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/desktop/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content })
    })
    if (!res.ok) throw new Error('Failed to write file')
    return res.json()
  },

  async previewCsv(filePath: string, rows: number = 20): Promise<any> {
    const res = await fetch(`${this.baseUrl}/desktop/csv-preview?path=${encodeURIComponent(filePath)}&rows=${rows}`)
    if (!res.ok) throw new Error('Failed to preview CSV')
    return res.json()
  },

  async findCsvFiles(dirPath: string = ''): Promise<any> {
    const res = await fetch(`${this.baseUrl}/desktop/find-csvs?path=${encodeURIComponent(dirPath)}`)
    if (!res.ok) throw new Error('Failed to find CSVs')
    return res.json()
  },

  // ── Knowledge Graph (graphifyy) ─────────────────────

  async graphStatus(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/status`)
    if (!res.ok) throw new Error('Failed to get graph status')
    return res.json()
  },

  async graphBuild(path?: string, mode: string = 'default', update: boolean = false): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, mode, update })
    })
    if (!res.ok) throw new Error('Failed to build graph')
    return res.json()
  },

  async graphBuildCsvs(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/build-csvs`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed to build CSV graph')
    return res.json()
  },

  async graphQuery(question: string, budget: number = 2000, dfs: boolean = false): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, budget, dfs })
    })
    if (!res.ok) throw new Error('Failed to query graph')
    return res.json()
  },

  async graphExplain(concept: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept })
    })
    if (!res.ok) throw new Error('Failed to explain concept')
    return res.json()
  },

  async graphPath(source: string, target: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, target })
    })
    if (!res.ok) throw new Error('Failed to find path')
    return res.json()
  },

  async graphReport(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/report`)
    if (!res.ok) throw new Error('Failed to get graph report')
    return res.json()
  },

  async graphAgentContext(agentTag: string, query: string = ''): Promise<any> {
    const res = await fetch(`${this.baseUrl}/graph/context/${agentTag}?query=${encodeURIComponent(query)}`)
    return res.json()
  },

  // ── Web Scraping ─────────────────────────────────────

  async scrapeUrl(url: string, extractLinks = false, extractEmails = false): Promise<any> {
    const res = await fetch(`${this.baseUrl}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, extract_links: extractLinks, extract_emails: extractEmails })
    })
    if (!res.ok) throw new Error('Scrape failed')
    return res.json()
  },

  async scrapeMultiple(urls: string[], extractLinks = false): Promise<any> {
    const res = await fetch(`${this.baseUrl}/scrape/multi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, extract_links: extractLinks })
    })
    if (!res.ok) throw new Error('Multi-scrape failed')
    return res.json()
  },

  async webSearch(query: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/scrape/search?query=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error('Web search failed')
    return res.json()
  },
}

export default ELECTRON_API
