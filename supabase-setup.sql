-- ETICO Waitlist — run once in the Supabase SQL Editor of the EXISTING project.
-- Creates the waitlist tables. All access goes through the server (service-role),
-- so RLS stays ON with no public policies — the anon/public key can't read or
-- write these tables directly. The Next.js API routes use the service-role key.

create extension if not exists "pgcrypto";

-- ── Entries ────────────────────────────────────────────────────────────────
create table if not exists public.waitlist_entries (
  id                uuid primary key default gen_random_uuid(),
  name              text        not null,
  email             text        not null unique,
  phone             text        not null,
  location          text        not null,             -- geographical area (state)
  invested_before   text        not null,             -- one of the radio options
  interests         jsonb       not null default '[]', -- multi-select
  motivations       jsonb       not null default '[]', -- up to 3
  heard_from        text,                              -- single choice
  other_notes       text,                              -- free text for any "Other"
  consent_updates   boolean     not null default false,
  consent_policy    boolean     not null default false,
  notified_at       timestamptz,                       -- set when launch email sent
  created_at        timestamptz not null default now()
);

create index if not exists waitlist_entries_created_idx on public.waitlist_entries (created_at desc);

-- ── Settings (single row: the waitlist cap) ──────────────────────────────────
create table if not exists public.waitlist_settings (
  id   int  primary key default 1,
  cap  int  not null default 0,          -- 0 = unlimited
  constraint single_row check (id = 1)
);
insert into public.waitlist_settings (id, cap) values (1, 0)
  on conflict (id) do nothing;

-- Lock both tables down: RLS on, no public policies (service-role bypasses RLS).
alter table public.waitlist_entries  enable row level security;
alter table public.waitlist_settings enable row level security;
