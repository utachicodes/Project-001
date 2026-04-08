import { supabase, isSupabaseConfigured } from './supabase'

// ── Agent Tasks ─────────────────────────────────────────────

export interface DbAgentTask {
  id?: string
  agent_id: string
  agent_name: string
  room?: string
  description: string
  status: 'queued' | 'running' | 'done' | 'failed'
  result?: string
  dispatched_by?: string
  created_at?: string
  completed_at?: string
}

export async function logAgentTask(task: Omit<DbAgentTask, 'id' | 'created_at'>) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from('agent_tasks').insert(task).select().single()
  if (error) console.error('logAgentTask:', error.message)
  return data
}

export async function updateAgentTask(id: string, updates: Partial<DbAgentTask>) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from('agent_tasks').update(updates).eq('id', id).select().single()
  if (error) console.error('updateAgentTask:', error.message)
  return data
}

export async function getAgentTasks(agentId?: string, limit = 20) {
  if (!isSupabaseConfigured) return []
  let q = supabase.from('agent_tasks').select('*').order('created_at', { ascending: false }).limit(limit)
  if (agentId) q = q.eq('agent_id', agentId)
  const { data, error } = await q
  if (error) console.error('getAgentTasks:', error.message)
  return data || []
}

// ── Web Scraping Results ────────────────────────────────────

export interface DbScrapedPage {
  id?: string
  url: string
  title?: string
  content?: string
  summary?: string
  status: 'pending' | 'scraped' | 'failed'
  scraped_by?: string
  word_count?: number
  created_at?: string
}

export async function saveScrapedPage(page: Omit<DbScrapedPage, 'id' | 'created_at'>) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from('scraped_pages').insert(page).select().single()
  if (error) console.error('saveScrapedPage:', error.message)
  return data
}

export async function getScrapedPages(limit = 20) {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('scraped_pages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) console.error('getScrapedPages:', error.message)
  return data || []
}

export async function searchScrapedPages(query: string) {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('scraped_pages')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,url.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) console.error('searchScrapedPages:', error.message)
  return data || []
}

// ── Connections ─────────────────────────────────────────────

export interface DbConnection {
  id?: string
  name: string
  company?: string
  role?: string
  email?: string
  phone?: string
  category?: string
  notes?: string
  source?: string
  agent_id?: string
  created_at?: string
  updated_at?: string
}

export async function addConnection(conn: Omit<DbConnection, 'id' | 'created_at' | 'updated_at'>) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from('connections').insert(conn).select().single()
  if (error) console.error('addConnection:', error.message)
  return data
}

export async function getConnections(category?: string, limit = 50) {
  if (!isSupabaseConfigured) return []
  let q = supabase.from('connections').select('*').order('created_at', { ascending: false }).limit(limit)
  if (category) q = q.eq('category', category)
  const { data, error } = await q
  if (error) console.error('getConnections:', error.message)
  return data || []
}

export async function searchConnections(query: string) {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%,notes.ilike.%${query}%`)
    .limit(20)
  if (error) console.error('searchConnections:', error.message)
  return data || []
}

export async function deleteConnection(id: string) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('connections').delete().eq('id', id)
  if (error) console.error('deleteConnection:', error.message)
}

// ── Agent Memory ────────────────────────────────────────────

export async function setAgentMemory(agentId: string, key: string, value: string, category = 'general') {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('agent_memory')
    .upsert({ agent_id: agentId, key, value, category, updated_at: new Date().toISOString() }, { onConflict: 'agent_id,key' })
    .select()
    .single()
  if (error) console.error('setAgentMemory:', error.message)
  return data
}

export async function getAgentMemory(agentId: string, key?: string) {
  if (!isSupabaseConfigured) return key ? null : []
  if (key) {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agentId)
      .eq('key', key)
      .single()
    if (error) return null
    return data
  }
  const { data, error } = await supabase
    .from('agent_memory')
    .select('*')
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false })
  if (error) console.error('getAgentMemory:', error.message)
  return data || []
}

// ── Data Snapshots ──────────────────────────────────────────

export async function saveSnapshot(type: string, data: any, agentId?: string) {
  if (!isSupabaseConfigured) return null
  const { data: row, error } = await supabase
    .from('data_snapshots')
    .insert({ snapshot_type: type, agent_id: agentId, data })
    .select()
    .single()
  if (error) console.error('saveSnapshot:', error.message)
  return row
}

export async function getSnapshots(type: string, limit = 10) {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('data_snapshots')
    .select('*')
    .eq('snapshot_type', type)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) console.error('getSnapshots:', error.message)
  return data || []
}

// ── Chat Sessions (cloud backup) ────────────────────────────

export async function syncChatSession(id: string, title: string, messages: any[]) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase
    .from('chat_sessions')
    .upsert({ id, title, messages, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single()
  if (error) console.error('syncChatSession:', error.message)
  return data
}

export async function getCloudChatSessions() {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) console.error('getCloudChatSessions:', error.message)
  return data || []
}

// ── Stats / Dashboard ───────────────────────────────────────

export async function getEcosystemStats() {
  if (!isSupabaseConfigured) return null
  const [tasks, pages, conns] = await Promise.all([
    supabase.from('agent_tasks').select('status', { count: 'exact', head: true }),
    supabase.from('scraped_pages').select('status', { count: 'exact', head: true }),
    supabase.from('connections').select('id', { count: 'exact', head: true }),
  ])
  return {
    totalTasks: tasks.count || 0,
    totalScrapedPages: pages.count || 0,
    totalConnections: conns.count || 0,
  }
}
