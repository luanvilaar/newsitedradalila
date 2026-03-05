-- WhatsApp conversation memory structures

create table if not exists public.wa_conversations (
  id uuid primary key default gen_random_uuid(),
  wa_phone text not null unique,
  messages jsonb,
  memory_summary text,
  updated_at timestamptz not null default now()
);

create table if not exists public.wa_messages (
  id uuid primary key default gen_random_uuid(),
  wa_phone text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_wa_messages_wa_phone on public.wa_messages (wa_phone);
create index if not exists idx_wa_messages_created_at on public.wa_messages (created_at desc);

create table if not exists public.wa_patient_profile (
  wa_phone text primary key,
  patient_name text,
  city_preference text,
  main_goal text,
  preferred_period text,
  requested_service text,
  notes text,
  updated_at timestamptz not null default now()
);
