-- Mafalia Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Agent activity & task logs
create table if not exists agent_tasks (
  id uuid default gen_random_uuid() primary key,
  agent_id text not null,
  agent_name text not null,
  room text,
  description text not null,
  status text default 'queued' check (status in ('queued','running','done','failed')),
  result text,
  dispatched_by text default 'boss',
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Web scraping results
create table if not exists scraped_pages (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  title text,
  content text,
  summary text,
  status text default 'pending' check (status in ('pending','scraped','failed')),
  scraped_by text default 'system',
  word_count int default 0,
  created_at timestamptz default now()
);

-- Business connections / contacts
create table if not exists connections (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  category text default 'general',
  notes text,
  source text,
  agent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent memory / notes (persistent across sessions)
create table if not exists agent_memory (
  id uuid default gen_random_uuid() primary key,
  agent_id text not null,
  key text not null,
  value text not null,
  category text default 'general',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agent_id, key)
);

-- Business data snapshots (metrics, summaries)
create table if not exists data_snapshots (
  id uuid default gen_random_uuid() primary key,
  snapshot_type text not null,
  agent_id text,
  data jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Chat sessions (cloud backup)
create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  title text,
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_agent_tasks_agent on agent_tasks(agent_id);
create index if not exists idx_agent_tasks_status on agent_tasks(status);
create index if not exists idx_scraped_pages_url on scraped_pages(url);
create index if not exists idx_connections_category on connections(category);
create index if not exists idx_agent_memory_agent on agent_memory(agent_id);
create index if not exists idx_data_snapshots_type on data_snapshots(snapshot_type);

-- Enable RLS but allow anon access (for local app usage)
alter table agent_tasks enable row level security;
alter table scraped_pages enable row level security;
alter table connections enable row level security;
alter table agent_memory enable row level security;
alter table data_snapshots enable row level security;
alter table chat_sessions enable row level security;

-- Policies: allow all for anon (this is a local-first app, not multi-tenant)
create policy "anon_all" on agent_tasks for all using (true) with check (true);
create policy "anon_all" on scraped_pages for all using (true) with check (true);
create policy "anon_all" on connections for all using (true) with check (true);
create policy "anon_all" on agent_memory for all using (true) with check (true);
create policy "anon_all" on data_snapshots for all using (true) with check (true);
create policy "anon_all" on chat_sessions for all using (true) with check (true);
