import { createClient, isSupabaseConfigured } from "./client";

export interface DbConnection {
  id?: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  notes?: string;
  source?: string;
  user_id?: string;
  created_at?: string;
}

export async function addConnection(conn: Omit<DbConnection, "id" | "created_at">) {
  if (!isSupabaseConfigured) return null;
  const supabase = createClient();
  const { data, error } = await supabase.from("connections").insert(conn).select().single();
  if (error) { /* error handled by caller */ }
  return data;
}

export async function getConnections(limit = 50) {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) return [];
    // error handled by caller
  }
  return data ?? [];
}

export interface DbScrapedPage {
  id?: string;
  url: string;
  title?: string;
  content?: string;
  word_count?: number;
  status: "pending" | "scraped" | "failed";
  user_id?: string;
  created_at?: string;
}

export async function saveScrapedPage(page: Omit<DbScrapedPage, "id">) {
  if (!isSupabaseConfigured) return null;
  const supabase = createClient();
  const { data, error } = await supabase.from("scraped_pages").insert(page).select().single();
  if (error) { /* error handled by caller */ }
  return data;
}

export async function getScrapedPages(limit = 20) {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scraped_pages")
    .select("url, title, content, word_count, status, created_at")
    .eq("status", "scraped")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) return [];
    // error handled by caller
  }
  return data ?? [];
}

// Generic table fetcher — tries to read any table the user has added
export async function tryFetchTable(table: string, limit = 30): Promise<any[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return []; // silently skip tables that don't exist or have no access
  return data ?? [];
}

// Known business data tables to probe beyond the defaults
export const BUSINESS_TABLES = [
  "products", "orders", "customers", "sales", "inventory",
  "transactions", "invoices", "leads", "tasks", "projects",
  "employees", "campaigns", "events", "feedback", "tickets",
] as const;
