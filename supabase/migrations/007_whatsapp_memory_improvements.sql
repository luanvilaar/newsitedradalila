-- Migration 007: WhatsApp Memory Improvements
-- Adiciona campos de memória e perfil para a Claudia ser mais precisa

-- Adiciona nome do perfil WhatsApp em wa_conversations
alter table public.wa_conversations
  add column if not exists profile_name text,
  add column if not exists total_messages int not null default 0,
  add column if not exists last_intent text,
  add column if not exists handoff_requested boolean not null default false;

-- Adiciona campos de qualidade na wa_patient_profile
alter table public.wa_patient_profile
  add column if not exists profile_name text,
  add column if not exists interaction_count int not null default 0,
  add column if not exists last_interaction_at timestamptz;

-- Índice para busca rápida por telefone em wa_patient_profile
create index if not exists idx_wa_patient_profile_phone on public.wa_patient_profile (wa_phone);

-- Índice para busca rápida de conversas com handoff
create index if not exists idx_wa_conversations_handoff on public.wa_conversations (handoff_requested) where handoff_requested = true;

-- View auxiliar para o painel admin ver conversas com contexto completo
create or replace view public.wa_conversations_enriched as
select
  c.id,
  c.wa_phone,
  c.profile_name,
  c.memory_summary,
  c.total_messages,
  c.last_intent,
  c.handoff_requested,
  c.updated_at,
  p.patient_name,
  p.city_preference,
  p.main_goal,
  p.preferred_period,
  p.requested_service,
  p.notes,
  p.interaction_count
from public.wa_conversations c
left join public.wa_patient_profile p on p.wa_phone = c.wa_phone;
