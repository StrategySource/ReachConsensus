create type public.proposal_role as enum (
  'workspace_owner',
  'cisco_contributor',
  'partner_contributor',
  'customer_commenter',
  'admin'
);

create type public.section_status as enum (
  'draft',
  'needs_review',
  'approved',
  'published'
);

create type public.asset_visibility as enum (
  'source_material',
  'published_asset'
);

create type public.change_request_status as enum (
  'open',
  'in_review',
  'resolved'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null check (organization_type in ('cisco', 'partner', 'customer')),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id),
  display_name text,
  created_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id),
  slug text not null unique,
  customer_name text not null,
  title text not null,
  opportunity_summary text not null,
  one_cisco_story text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposal_members (
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.proposal_role not null,
  created_at timestamptz not null default now(),
  primary key (proposal_id, profile_id)
);

create table public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  title text not null,
  slug text not null,
  status public.section_status not null default 'draft',
  owner_name text not null,
  summary text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (proposal_id, slug)
);

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.proposal_sections(id) on delete cascade,
  block_type text not null,
  title text not null,
  body text not null,
  source_asset_ids uuid[] not null default '{}'::uuid[],
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.proposal_assets (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  storage_path text not null,
  name text not null,
  file_type text not null,
  visibility public.asset_visibility not null default 'source_material',
  digest_status text not null check (digest_status in ('queued', 'digested', 'manual_review')),
  customer_download_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.published_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  version_number integer not null,
  published_by uuid not null references public.profiles(id),
  snapshot jsonb not null,
  published_at timestamptz not null default now(),
  unique (proposal_id, version_number)
);

create table public.proposal_comments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  section_id uuid not null references public.proposal_sections(id) on delete cascade,
  block_id uuid references public.content_blocks(id) on delete set null,
  author_profile_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.change_requests (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  section_id uuid not null references public.proposal_sections(id) on delete cascade,
  title text not null,
  body text not null,
  owner_name text not null,
  status public.change_request_status not null default 'open',
  due_date date,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  label text not null,
  occurred_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_members enable row level security;
alter table public.proposal_sections enable row level security;
alter table public.content_blocks enable row level security;
alter table public.proposal_assets enable row level security;
alter table public.published_versions enable row level security;
alter table public.proposal_comments enable row level security;
alter table public.change_requests enable row level security;
alter table public.analytics_events enable row level security;

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.is_proposal_member(proposal_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.proposal_members pm
    where pm.proposal_id = proposal_uuid
      and pm.profile_id = (select auth.uid())
  );
$$;

create or replace function private.proposal_role_for(proposal_uuid uuid)
returns public.proposal_role
language sql
stable
security definer
set search_path = public
as $$
  select pm.role
  from public.proposal_members pm
  where pm.proposal_id = proposal_uuid
    and pm.profile_id = (select auth.uid())
  limit 1;
$$;

revoke execute on function private.is_proposal_member(uuid) from public;
revoke execute on function private.proposal_role_for(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_proposal_member(uuid) to authenticated;
grant execute on function private.proposal_role_for(uuid) to authenticated;

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.proposals from anon, authenticated;
revoke all on table public.proposal_members from anon, authenticated;
revoke all on table public.proposal_sections from anon, authenticated;
revoke all on table public.content_blocks from anon, authenticated;
revoke all on table public.proposal_assets from anon, authenticated;
revoke all on table public.published_versions from anon, authenticated;
revoke all on table public.proposal_comments from anon, authenticated;
revoke all on table public.change_requests from anon, authenticated;
revoke all on table public.analytics_events from anon, authenticated;

revoke all on type public.proposal_role from public;
revoke all on type public.section_status from public;
revoke all on type public.asset_visibility from public;
revoke all on type public.change_request_status from public;

grant usage on schema public to authenticated;
grant usage on type public.proposal_role to authenticated;
grant usage on type public.section_status to authenticated;
grant usage on type public.asset_visibility to authenticated;
grant usage on type public.change_request_status to authenticated;
grant select on table public.organizations to authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.proposals to authenticated;
grant select, insert, update, delete on table public.proposal_members to authenticated;
grant select, insert, update, delete on table public.proposal_sections to authenticated;
grant select, insert, update, delete on table public.content_blocks to authenticated;
grant select, insert, update, delete on table public.proposal_assets to authenticated;
grant select, insert on table public.published_versions to authenticated;
grant select, insert on table public.proposal_comments to authenticated;
grant select, insert, update, delete on table public.change_requests to authenticated;
grant select, insert on table public.analytics_events to authenticated;

create policy "users can read their own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "users can read their own organization"
on public.organizations for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.organization_id = organizations.id
      and p.id = (select auth.uid())
  )
);

create policy "authenticated users can create owned proposals"
on public.proposals for insert
to authenticated
with check (owner_profile_id = (select auth.uid()));

create policy "owners can read owned proposals before membership"
on public.proposals for select
to authenticated
using (owner_profile_id = (select auth.uid()));

create policy "members can read their proposals"
on public.proposals for select
to authenticated
using (private.is_proposal_member(id));

create policy "owners and admins can update proposals"
on public.proposals for update
to authenticated
using (private.proposal_role_for(id) in ('workspace_owner', 'admin'))
with check (private.proposal_role_for(id) in ('workspace_owner', 'admin'));

create policy "owners and admins can delete proposals"
on public.proposals for delete
to authenticated
using (private.proposal_role_for(id) in ('workspace_owner', 'admin'));

create policy "members can read proposal membership"
on public.proposal_members for select
to authenticated
using (private.is_proposal_member(proposal_id));

create policy "owners and admins can add proposal members"
on public.proposal_members for insert
to authenticated
with check (
  private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin')
  or (
    profile_id = (select auth.uid())
    and role = 'workspace_owner'
    and exists (
      select 1
      from public.proposals p
      where p.id = proposal_members.proposal_id
        and p.owner_profile_id = (select auth.uid())
    )
  )
);

create policy "owners and admins can update proposal members"
on public.proposal_members for update
to authenticated
using (private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin'))
with check (private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin'));

create policy "owners and admins can delete proposal members"
on public.proposal_members for delete
to authenticated
using (private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin'));

create policy "members can read proposal sections"
on public.proposal_sections for select
to authenticated
using (private.is_proposal_member(proposal_id));

create policy "contributors can insert proposal sections"
on public.proposal_sections for insert
to authenticated
with check (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
);

create policy "contributors can update proposal sections"
on public.proposal_sections for update
to authenticated
using (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
)
with check (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
);

create policy "contributors can delete proposal sections"
on public.proposal_sections for delete
to authenticated
using (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
);

create policy "members can read content blocks"
on public.content_blocks for select
to authenticated
using (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.is_proposal_member(ps.proposal_id)
  )
);

create policy "contributors can insert content blocks"
on public.content_blocks for insert
to authenticated
with check (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.proposal_role_for(ps.proposal_id) in (
        'workspace_owner',
        'cisco_contributor',
        'partner_contributor',
        'admin'
      )
  )
);

create policy "contributors can update content blocks"
on public.content_blocks for update
to authenticated
using (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.proposal_role_for(ps.proposal_id) in (
        'workspace_owner',
        'cisco_contributor',
        'partner_contributor',
        'admin'
      )
  )
)
with check (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.proposal_role_for(ps.proposal_id) in (
        'workspace_owner',
        'cisco_contributor',
        'partner_contributor',
        'admin'
      )
  )
);

create policy "contributors can delete content blocks"
on public.content_blocks for delete
to authenticated
using (
  exists (
    select 1
    from public.proposal_sections ps
    where ps.id = content_blocks.section_id
      and private.proposal_role_for(ps.proposal_id) in (
        'workspace_owner',
        'cisco_contributor',
        'partner_contributor',
        'admin'
      )
  )
);

create policy "members can read proposal assets"
on public.proposal_assets for select
to authenticated
using (private.is_proposal_member(proposal_id));

create policy "contributors can insert proposal assets"
on public.proposal_assets for insert
to authenticated
with check (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
);

create policy "contributors can update proposal assets"
on public.proposal_assets for update
to authenticated
using (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
)
with check (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
);

create policy "contributors can delete proposal assets"
on public.proposal_assets for delete
to authenticated
using (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
);

create policy "members can read published versions"
on public.published_versions for select
to authenticated
using (private.is_proposal_member(proposal_id));

create policy "owners and admins can create published versions"
on public.published_versions for insert
to authenticated
with check (private.proposal_role_for(proposal_id) in ('workspace_owner', 'admin'));

create policy "members can read proposal comments"
on public.proposal_comments for select
to authenticated
using (private.is_proposal_member(proposal_id));

create policy "members can create proposal comments"
on public.proposal_comments for insert
to authenticated
with check (
  private.is_proposal_member(proposal_id)
  and author_profile_id = (select auth.uid())
  and exists (
    select 1
    from public.proposal_sections ps
    where ps.id = proposal_comments.section_id
      and ps.proposal_id = proposal_comments.proposal_id
  )
  and (
    block_id is null
    or exists (
      select 1
      from public.content_blocks cb
      where cb.id = proposal_comments.block_id
        and cb.section_id = proposal_comments.section_id
    )
  )
);

create policy "members can read change requests"
on public.change_requests for select
to authenticated
using (private.is_proposal_member(proposal_id));

create policy "contributors can insert change requests"
on public.change_requests for insert
to authenticated
with check (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
  and exists (
    select 1
    from public.proposal_sections ps
    where ps.id = change_requests.section_id
      and ps.proposal_id = change_requests.proposal_id
  )
);

create policy "contributors can update change requests"
on public.change_requests for update
to authenticated
using (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
)
with check (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
  and exists (
    select 1
    from public.proposal_sections ps
    where ps.id = change_requests.section_id
      and ps.proposal_id = change_requests.proposal_id
  )
);

create policy "contributors can delete change requests"
on public.change_requests for delete
to authenticated
using (
  private.proposal_role_for(proposal_id) in (
    'workspace_owner',
    'cisco_contributor',
    'partner_contributor',
    'admin'
  )
);

create policy "members can read analytics events"
on public.analytics_events for select
to authenticated
using (private.is_proposal_member(proposal_id));

create policy "members can create analytics events"
on public.analytics_events for insert
to authenticated
with check (
  private.is_proposal_member(proposal_id)
  and (
    actor_profile_id is null
    or actor_profile_id = (select auth.uid())
  )
);

create index profiles_organization_id_idx on public.profiles(organization_id);
create index proposals_owner_profile_id_idx on public.proposals(owner_profile_id);
create index proposal_members_profile_id_idx on public.proposal_members(profile_id);
create index proposal_sections_proposal_id_sort_order_idx on public.proposal_sections(proposal_id, sort_order);
create index proposal_sections_slug_idx on public.proposal_sections(slug);
create index content_blocks_section_id_sort_order_idx on public.content_blocks(section_id, sort_order);
create index proposal_assets_proposal_id_idx on public.proposal_assets(proposal_id);
create index published_versions_proposal_id_published_at_idx on public.published_versions(proposal_id, published_at desc);
create index proposal_comments_proposal_id_created_at_idx on public.proposal_comments(proposal_id, created_at desc);
create index proposal_comments_section_id_created_at_idx on public.proposal_comments(section_id, created_at desc);
create index proposal_comments_block_id_idx on public.proposal_comments(block_id);
create index change_requests_proposal_id_created_at_idx on public.change_requests(proposal_id, created_at desc);
create index change_requests_section_id_idx on public.change_requests(section_id);
create index analytics_events_proposal_id_occurred_at_idx on public.analytics_events(proposal_id, occurred_at desc);
create index analytics_events_actor_profile_id_occurred_at_idx on public.analytics_events(actor_profile_id, occurred_at desc);
