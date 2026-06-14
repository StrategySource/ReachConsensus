create table if not exists public.proposal_intake_access_tokens (
  id text primary key,
  draft_id uuid not null references public.proposal_intake_drafts(id) on delete cascade,
  token_hash text not null,
  role text not null check (role in ('owner', 'cisco', 'partner', 'customer')),
  label text not null,
  capabilities text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique (draft_id, token_hash)
);

alter table public.proposal_intake_access_tokens enable row level security;

revoke all on table public.proposal_intake_access_tokens from anon, authenticated;

create policy proposal_intake_access_tokens_server_only
  on public.proposal_intake_access_tokens
  for all
  to anon, authenticated
  using (false)
  with check (false);

create index if not exists proposal_intake_access_tokens_draft_id_idx
  on public.proposal_intake_access_tokens (draft_id);

create index if not exists proposal_intake_access_tokens_token_hash_idx
  on public.proposal_intake_access_tokens (token_hash);
