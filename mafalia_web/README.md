# Mafalia Intelligence — Web

Web port of the Mafalia Intelligence desktop platform. Sibling product to `mafalia-ui` (the restaurant SaaS) — shares the same brand identity, design tokens, and component conventions.

## What it is

A web-based AI agent copilot. 11 specialized agents (Zara, Kofi, Amara, Idris, Nala, Tariq, Sana, Ravi, Luna, Omar, Malik) answer business questions across revenue, operations, customers, inventory, marketing, finance, data, tech, growth, partnerships, and governance. Multi-provider LLM support — bring your own key (OpenRouter, Google, OpenAI, Anthropic, Ollama, custom).

## Stack

- **Next.js 15** (App Router, Turbopack)
- **React 18** + TypeScript
- **Tailwind 3.4** + Radix UI primitives + shadcn-style components
- **Geist** font (matches `mafalia-ui`)
- **Supabase** Auth (magic link) + Storage (file uploads) + Postgres (connections, scraped pages)
- **next-themes** for light/dark
- **framer-motion** for transitions
- **sonner** for toasts

## Setup

### 1. Install
```bash
cd mafalia_web
npm install
```

### 2. Configure Supabase

Create a Supabase project, then in your project copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000` for dev)

**In your Supabase dashboard:**
1. **Auth → URL Configuration** — add `http://localhost:3000/auth/callback` to redirect URLs.
2. **Storage → Create bucket** named `mafalia-uploads` (private). Add RLS policies so each user can only read/write their own folder (`auth.uid()::text = (storage.foldername(name))[1]`).
3. **Database → SQL Editor** — run the schema below to create `connections` and `scraped_pages` tables.

### 3. Run schema (optional — only needed for `/connect`, `/scrape` features)

```sql
create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  notes text,
  source text,
  created_at timestamptz default now()
);
alter table connections enable row level security;
create policy "users_own_connections" on connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists scraped_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  url text not null,
  title text,
  content text,
  word_count int,
  status text,
  created_at timestamptz default now()
);
alter table scraped_pages enable row level security;
create policy "users_own_scrapes" on scraped_pages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### 4. Dev
```bash
npm run dev
```
Open http://localhost:3000 — you'll be redirected to `/login`.

## Design system

This app inherits its design DNA from `mafalia-ui`. If you need to tweak the visual language, **edit `mafalia-ui` first** and copy tokens here:
- Colors / theme tokens → `app/globals.css`
- Tailwind shape & radii → `tailwind.config.ts`
- Component conventions → `components/ui/*`

Do not introduce new accent colors. Mafalia red `#FE0000` is the only brand accent; everything else is slate neutrals.

## Differences vs. desktop (`mafalia_code`)

| Feature | Desktop | Web |
|---|---|---|
| File system access | Full Electron IPC (`fs:readDir`, etc.) | Drag-drop upload to Supabase Storage |
| Config storage | `~/.mafalia/config.json` | localStorage (per browser) |
| Auth | None (single-user app) | Supabase magic link |
| Web scraping (`/scrape`) | Built-in | Removed (no backend proxy yet) |
| `/browse`, `/read`, `/write`, `/open`, `/csvs`, `/system` | Available | Removed |
| Knowledge graph commands | Available | Removed |
| Multi-device sync | No | Yes (via Supabase Auth) |

## Folder map
```
app/                    — Next.js App Router routes
  layout.tsx            — Geist font, theme provider, toaster
  page.tsx              — auth gate → <Workspace />
  globals.css           — CSS variables (mafalia-ui palette)
  login/page.tsx        — magic link sign-in
  auth/callback/        — Supabase OAuth/OTP callback
components/
  workspace.tsx         — main app shell, ports App.tsx logic
  layout/sidebar.tsx
  chat/                 — chat-area, command-palette, markdown
  setup/                — setup-wizard, provider-selector
  modals/               — privacy-modal
  ui/                   — button, card, dialog, input, label, kbd
  theme-provider.tsx
  theme-toggle.tsx
lib/
  types.ts              — Config, Message, Agent, Provider
  agents.ts             — DEFAULT_AGENTS, ANALYZE_MAP, etc.
  llm-api.ts            — multi-provider LLM client
  config-store.ts       — localStorage helpers
  utils.ts              — cn() helper
  supabase/
    client.ts           — browser client
    server.ts           — server client
    middleware.ts       — session refresh middleware
    storage.ts          — upload to mafalia-uploads bucket
    data.ts             — connections, scraped_pages
middleware.ts           — Next.js middleware (auth gate)
```

## Verification
```bash
npm run typecheck     # TypeScript check
npm run lint          # Next.js lint
npm run build         # Production build
```
