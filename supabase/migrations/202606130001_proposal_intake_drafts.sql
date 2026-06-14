create table if not exists public.proposal_intake_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  customer_name text not null,
  title text not null,
  problem text not null,
  solution text not null,
  one_cisco_story text not null,
  solution_areas text[] not null default '{}'::text[],
  selected_section_ids text[] not null default '{}'::text[],
  members jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_intake_documents (
  id text not null,
  draft_id uuid not null references public.proposal_intake_drafts(id) on delete cascade,
  category text not null check (category in ('architecture', 'quote', 'services', 'licensing', 'supporting')),
  name text not null,
  file_type text not null,
  size bigint not null default 0,
  storage_path text,
  digest_status text not null default 'queued' check (digest_status in ('queued', 'digested', 'manual_review')),
  customer_download_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (draft_id, id)
);

alter table public.proposal_intake_drafts enable row level security;
alter table public.proposal_intake_documents enable row level security;

revoke all on table public.proposal_intake_drafts from anon, authenticated;
revoke all on table public.proposal_intake_documents from anon, authenticated;

create index if not exists proposal_intake_drafts_created_at_idx
  on public.proposal_intake_drafts(created_at desc);

create index if not exists proposal_intake_documents_draft_id_idx
  on public.proposal_intake_documents(draft_id);

insert into storage.buckets (id, name, public)
values ('proposal-source-materials', 'proposal-source-materials', false)
on conflict (id) do nothing;
