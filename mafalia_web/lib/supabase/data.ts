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
  if (error) console.error("addConnection:", error.message);
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
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
      return [];
    }
    console.error("getConnections:", error.message);
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
}

export async function saveScrapedPage(page: Omit<DbScrapedPage, "id">) {
  if (!isSupabaseConfigured) return null;
  const supabase = createClient();
  const { data, error } = await supabase.from("scraped_pages").insert(page).select().single();
  if (error) console.error("saveScrapedPage:", error.message);
  return data;
}
