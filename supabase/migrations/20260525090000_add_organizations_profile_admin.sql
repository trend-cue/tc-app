create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_color text not null default 'oklch(0.72 0.18 210)',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_email text not null,
  role text not null check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  removed_at timestamptz,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists organization_memberships_one_active
  on organization_memberships(organization_id, user_id)
  where removed_at is null;

create index if not exists idx_organization_memberships_user_active
  on organization_memberships(user_id, organization_id)
  where removed_at is null;

create table if not exists member_preferences (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  industry_keys text[] not null default '{}',
  onboarding_step text not null default 'industries',
  first_search_query text,
  first_saved_post_id text,
  first_saved_project_id uuid,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists workspace_invitations_one_pending_email
  on workspace_invitations(organization_id, lower(email))
  where accepted_at is null and revoked_at is null;

create table if not exists organization_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade unique,
  tier_key text not null default 'starter' check (tier_key in ('starter', 'growth', 'scale')),
  status text not null default 'active',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default now() + interval '1 month',
  stripe_subscription_id text,
  mock_provider_id text not null default 'mock_subscription',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_payment_methods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  brand text not null,
  last4 text not null check (last4 ~ '^[0-9]{4}$'),
  exp_month int not null check (exp_month between 1 and 12),
  exp_year int not null check (exp_year between 2024 and 2100),
  billing_name text,
  billing_email text,
  is_default boolean not null default true,
  stripe_payment_method_id text,
  mock_provider_id text not null default 'mock_payment_method',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payment_methods_org_default
  on organization_payment_methods(organization_id, is_default);

create table if not exists billing_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  subscription_id uuid references organization_subscriptions(id) on delete set null,
  invoice_number text not null unique,
  period_start timestamptz not null,
  period_end timestamptz not null,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null default 'paid',
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  stripe_invoice_id text,
  hosted_invoice_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_invoices_org_issued
  on billing_invoices(organization_id, issued_at desc);

alter table projects
  add column if not exists organization_id uuid references organizations(id) on delete cascade,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

insert into organizations (name, created_by)
select
  coalesce(nullif(split_part(u.email, '@', 1), ''), 'TrendCue') || '''s workspace',
  u.id
from auth.users u
where not exists (
  select 1
  from organization_memberships m
  where m.user_id = u.id
    and m.removed_at is null
);

insert into profiles (user_id, display_name)
select u.id, nullif(split_part(u.email, '@', 1), '')
from auth.users u
on conflict (user_id) do nothing;

insert into organization_memberships (organization_id, user_id, member_email, role)
select o.id, o.created_by, lower(coalesce(u.email, 'unknown@example.invalid')), 'admin'
from organizations o
join auth.users u on u.id = o.created_by
where o.created_by is not null
  and not exists (
    select 1
    from organization_memberships m
    where m.organization_id = o.id
      and m.user_id = o.created_by
      and m.removed_at is null
  );

insert into member_preferences (organization_id, user_id)
select m.organization_id, m.user_id
from organization_memberships m
where m.removed_at is null
on conflict (organization_id, user_id) do nothing;

insert into organization_subscriptions (organization_id, tier_key, status)
select o.id, 'starter', 'active'
from organizations o
on conflict (organization_id) do nothing;

update projects p
set
  organization_id = m.organization_id,
  created_by = coalesce(p.created_by, p.user_id)
from organization_memberships m
where p.user_id = m.user_id
  and m.removed_at is null
  and p.organization_id is null;

update projects
set created_by = user_id
where created_by is null;

alter table projects
  alter column organization_id set not null,
  alter column created_by set not null;

create or replace function private.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function private.is_org_member(check_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = check_org_id
      and m.user_id = (select auth.uid())
      and m.removed_at is null
  );
$$;

create or replace function private.has_org_role(check_org_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = check_org_id
      and m.user_id = (select auth.uid())
      and m.role = any(allowed_roles)
      and m.removed_at is null
  );
$$;

create or replace function private.active_admin_count(check_org_id uuid)
returns int
language sql
stable
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
  select count(*)::int
  from public.organization_memberships m
  where m.organization_id = check_org_id
    and m.role = 'admin'
    and m.removed_at is null;
$$;

create or replace function public.create_organisation_for_current_user(org_name text)
returns table (organization_id uuid, membership_id uuid)
language plpgsql
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := private.current_user_email();
  clean_name text := nullif(trim(org_name), '');
  existing_membership organization_memberships%rowtype;
  new_org_id uuid;
  new_membership_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into existing_membership
  from organization_memberships
  where user_id = current_user_id
    and removed_at is null
  order by joined_at
  limit 1;

  if found then
    organization_id := existing_membership.organization_id;
    membership_id := existing_membership.id;
    return next;
    return;
  end if;

  if clean_name is null then
    raise exception 'Organisation name is required';
  end if;

  insert into profiles (user_id, display_name)
  values (current_user_id, nullif(split_part(current_email, '@', 1), ''))
  on conflict (user_id) do nothing;

  insert into organizations (name, created_by)
  values (clean_name, current_user_id)
  returning id into new_org_id;

  insert into organization_memberships (organization_id, user_id, member_email, role)
  values (new_org_id, current_user_id, coalesce(nullif(current_email, ''), 'unknown@example.invalid'), 'admin')
  returning id into new_membership_id;

  insert into member_preferences (organization_id, user_id)
  values (new_org_id, current_user_id)
  on conflict (organization_id, user_id) do nothing;

  insert into organization_subscriptions (organization_id, tier_key, status)
  values (new_org_id, 'starter', 'active')
  on conflict (organization_id) do nothing;

  organization_id := new_org_id;
  membership_id := new_membership_id;
  return next;
end;
$$;

create or replace function public.create_workspace_invitation(
  check_org_id uuid,
  invite_email text,
  invite_role text default 'member'
)
returns table (
  id uuid,
  email text,
  role text,
  expires_at timestamptz,
  invite_token text
)
language plpgsql
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_email text := lower(trim(invite_email));
  clean_role text := coalesce(nullif(invite_role, ''), 'member');
  raw_token text;
  hashed_token text;
begin
  if current_user_id is null or not private.has_org_role(check_org_id, array['admin']) then
    raise exception 'Admin access required';
  end if;

  if normalized_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid invite email is required';
  end if;

  if clean_role not in ('admin', 'member') then
    raise exception 'Invalid invitation role';
  end if;

  update workspace_invitations wi
  set revoked_at = now(), updated_at = now()
  where wi.organization_id = check_org_id
    and lower(wi.email) = normalized_email
    and wi.accepted_at is null
    and wi.revoked_at is null;

  raw_token := replace(replace(replace(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_'), '=', '');
  hashed_token := encode(digest(raw_token, 'sha256'), 'hex');

  return query
  insert into workspace_invitations (organization_id, email, role, token_hash, expires_at, invited_by)
  values (check_org_id, normalized_email, clean_role, hashed_token, now() + interval '14 days', current_user_id)
  returning
    workspace_invitations.id,
    workspace_invitations.email,
    workspace_invitations.role,
    workspace_invitations.expires_at,
    raw_token;
end;
$$;

create or replace function public.accept_workspace_invitation(invite_token text)
returns table (organization_id uuid, membership_id uuid)
language plpgsql
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := private.current_user_email();
  hashed_token text := encode(digest(coalesce(invite_token, ''), 'sha256'), 'hex');
  invite workspace_invitations%rowtype;
  existing_membership organization_memberships%rowtype;
  new_membership_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into invite
  from workspace_invitations
  where token_hash = hashed_token
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
  limit 1;

  if not found then
    raise exception 'Invitation is invalid or expired';
  end if;

  if current_email <> lower(invite.email) then
    raise exception 'Invitation email does not match the signed-in user';
  end if;

  insert into profiles (user_id, display_name)
  values (current_user_id, nullif(split_part(current_email, '@', 1), ''))
  on conflict (user_id) do nothing;

  select *
  into existing_membership
  from organization_memberships
  where organization_id = invite.organization_id
    and user_id = current_user_id
    and removed_at is null
  limit 1;

  if found then
    new_membership_id := existing_membership.id;
  else
    insert into organization_memberships (
      organization_id,
      user_id,
      member_email,
      role,
      invited_by
    )
    values (
      invite.organization_id,
      current_user_id,
      current_email,
      invite.role,
      invite.invited_by
    )
    returning organization_memberships.id into new_membership_id;
  end if;

  insert into member_preferences (organization_id, user_id)
  values (invite.organization_id, current_user_id)
  on conflict (organization_id, user_id) do nothing;

  update workspace_invitations
  set accepted_at = now(), updated_at = now()
  where workspace_invitations.id = invite.id;

  organization_id := invite.organization_id;
  membership_id := new_membership_id;
  return next;
end;
$$;

create or replace function public.revoke_workspace_invitation(invitation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
declare
  invite workspace_invitations%rowtype;
begin
  select *
  into invite
  from workspace_invitations
  where id = invitation_id
  limit 1;

  if not found or not private.has_org_role(invite.organization_id, array['admin']) then
    raise exception 'Admin access required';
  end if;

  update workspace_invitations
  set revoked_at = now(), updated_at = now()
  where id = invitation_id
    and accepted_at is null
    and revoked_at is null;

  return invitation_id;
end;
$$;

create or replace function public.remove_organization_member(member_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
declare
  target organization_memberships%rowtype;
begin
  select *
  into target
  from organization_memberships
  where id = member_id
    and removed_at is null
  limit 1;

  if not found or not private.has_org_role(target.organization_id, array['admin']) then
    raise exception 'Admin access required';
  end if;

  if target.role = 'admin' and private.active_admin_count(target.organization_id) <= 1 then
    raise exception 'Cannot remove the last active admin';
  end if;

  update organization_memberships
  set removed_at = now(), updated_at = now()
  where id = member_id;

  return member_id;
end;
$$;

create or replace function public.update_organization_member_role(member_id uuid, new_role text)
returns uuid
language plpgsql
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
declare
  target organization_memberships%rowtype;
  clean_role text := coalesce(nullif(new_role, ''), 'member');
begin
  select *
  into target
  from organization_memberships
  where id = member_id
    and removed_at is null
  limit 1;

  if not found or not private.has_org_role(target.organization_id, array['admin']) then
    raise exception 'Admin access required';
  end if;

  if clean_role not in ('admin', 'member') then
    raise exception 'Invalid member role';
  end if;

  if target.role = 'admin' and clean_role <> 'admin' and private.active_admin_count(target.organization_id) <= 1 then
    raise exception 'Cannot demote the last active admin';
  end if;

  update organization_memberships
  set role = clean_role, updated_at = now()
  where id = member_id;

  return member_id;
end;
$$;

create or replace function public.update_mock_subscription(
  check_org_id uuid,
  selected_tier text,
  card_brand text default null,
  card_last4 text default null,
  card_exp_month int default null,
  card_exp_year int default null,
  billing_name text default null,
  billing_email text default null
)
returns table (subscription_id uuid, tier_key text)
language plpgsql
security definer
set search_path = public, private, auth, extensions, pg_temp
as $$
declare
  clean_tier text := coalesce(nullif(selected_tier, ''), 'starter');
  amount_cents int;
  sub_id uuid;
  invoice_offset int;
  issued timestamptz;
begin
  if not private.has_org_role(check_org_id, array['admin']) then
    raise exception 'Admin access required';
  end if;

  if clean_tier not in ('starter', 'growth', 'scale') then
    raise exception 'Invalid subscription tier';
  end if;

  if clean_tier <> 'starter' and (
    card_last4 is null or card_last4 !~ '^[0-9]{4}$' or
    card_exp_month is null or card_exp_month not between 1 and 12 or
    card_exp_year is null or card_exp_year < extract(year from now())::int
  ) then
    raise exception 'Valid mock payment details are required for paid tiers';
  end if;

  insert into organization_subscriptions (
    organization_id,
    tier_key,
    status,
    current_period_start,
    current_period_end,
    mock_provider_id
  )
  values (
    check_org_id,
    clean_tier,
    'active',
    now(),
    now() + interval '1 month',
    'mock_sub_' || replace(gen_random_uuid()::text, '-', '')
  )
  on conflict (organization_id) do update
  set
    tier_key = excluded.tier_key,
    status = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    mock_provider_id = excluded.mock_provider_id,
    updated_at = now()
  returning id into sub_id;

  if clean_tier <> 'starter' then
    update organization_payment_methods
    set is_default = false, updated_at = now()
    where organization_id = check_org_id
      and is_default;

    insert into organization_payment_methods (
      organization_id,
      brand,
      last4,
      exp_month,
      exp_year,
      billing_name,
      billing_email,
      is_default,
      mock_provider_id
    )
    values (
      check_org_id,
      coalesce(nullif(card_brand, ''), 'Card'),
      card_last4,
      card_exp_month,
      card_exp_year,
      nullif(trim(billing_name), ''),
      nullif(lower(trim(billing_email)), ''),
      true,
      'mock_pm_' || replace(gen_random_uuid()::text, '-', '')
    );

    amount_cents := case clean_tier when 'growth' then 2900 when 'scale' then 9900 else 0 end;

    if not exists (select 1 from billing_invoices where organization_id = check_org_id) then
      for invoice_offset in 0..2 loop
        issued := now() - make_interval(months => invoice_offset);
        insert into billing_invoices (
          organization_id,
          subscription_id,
          invoice_number,
          period_start,
          period_end,
          amount_cents,
          currency,
          status,
          issued_at,
          paid_at
        )
        values (
          check_org_id,
          sub_id,
          'TC-' || to_char(issued, 'YYYYMM') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
          issued - interval '1 month',
          issued,
          amount_cents,
          'usd',
          'paid',
          issued,
          issued
        );
      end loop;
    else
      insert into billing_invoices (
        organization_id,
        subscription_id,
        invoice_number,
        period_start,
        period_end,
        amount_cents,
        currency,
        status,
        issued_at,
        paid_at
      )
      values (
        check_org_id,
        sub_id,
        'TC-' || to_char(now(), 'YYYYMM') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
        now(),
        now() + interval '1 month',
        amount_cents,
        'usd',
        'paid',
        now(),
        now()
      );
    end if;
  end if;

  subscription_id := sub_id;
  tier_key := clean_tier;
  return next;
end;
$$;

alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_memberships enable row level security;
alter table member_preferences enable row level security;
alter table workspace_invitations enable row level security;
alter table organization_subscriptions enable row level security;
alter table organization_payment_methods enable row level security;
alter table billing_invoices enable row level security;

drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can create own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users can create own profile"
  on profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users can update own profile"
  on profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Organizations readable by active members" on organizations;
drop policy if exists "Organizations editable by admins" on organizations;
create policy "Organizations readable by active members"
  on organizations for select to authenticated
  using (private.is_org_member(id));
create policy "Organizations editable by admins"
  on organizations for update to authenticated
  using (private.has_org_role(id, array['admin']))
  with check (private.has_org_role(id, array['admin']));

drop policy if exists "Users can view own membership and admins can view organization memberships" on organization_memberships;
create policy "Users can view own membership and admins can view organization memberships"
  on organization_memberships for select to authenticated
  using (
    (user_id = (select auth.uid()))
    or private.has_org_role(organization_id, array['admin'])
  );

drop policy if exists "Users manage own organization preferences" on member_preferences;
create policy "Users manage own organization preferences"
  on member_preferences for all to authenticated
  using (
    user_id = (select auth.uid())
    and private.is_org_member(organization_id)
  )
  with check (
    user_id = (select auth.uid())
    and private.is_org_member(organization_id)
  );

drop policy if exists "Admins manage workspace invitations" on workspace_invitations;
create policy "Admins manage workspace invitations"
  on workspace_invitations for all to authenticated
  using (private.has_org_role(organization_id, array['admin']))
  with check (private.has_org_role(organization_id, array['admin']));

drop policy if exists "Admins manage subscriptions" on organization_subscriptions;
create policy "Admins manage subscriptions"
  on organization_subscriptions for all to authenticated
  using (private.has_org_role(organization_id, array['admin']))
  with check (private.has_org_role(organization_id, array['admin']));

drop policy if exists "Admins manage payment methods" on organization_payment_methods;
create policy "Admins manage payment methods"
  on organization_payment_methods for all to authenticated
  using (private.has_org_role(organization_id, array['admin']))
  with check (private.has_org_role(organization_id, array['admin']));

drop policy if exists "Admins manage billing invoices" on billing_invoices;
create policy "Admins manage billing invoices"
  on billing_invoices for select to authenticated
  using (private.has_org_role(organization_id, array['admin']));

drop policy if exists "Users can view own projects" on projects;
drop policy if exists "Users can create own projects" on projects;
drop policy if exists "Users can update own projects" on projects;
drop policy if exists "Users can delete own projects" on projects;
create policy "Members can view organization projects"
  on projects for select to authenticated
  using (private.is_org_member(organization_id));
create policy "Members can create organization projects"
  on projects for insert to authenticated
  with check (
    private.is_org_member(organization_id)
    and created_by = (select auth.uid())
    and user_id = (select auth.uid())
  );
create policy "Members can update organization projects"
  on projects for update to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));
create policy "Members can delete organization projects"
  on projects for delete to authenticated
  using (private.is_org_member(organization_id));

drop policy if exists "Users can view saved posts in own projects" on project_posts;
drop policy if exists "Users can save posts to own projects" on project_posts;
drop policy if exists "Users can remove saved posts from own projects" on project_posts;
create policy "Members can view organization saved posts"
  on project_posts for select to authenticated
  using (
    exists (
      select 1
      from projects p
      where p.id = project_posts.project_id
        and private.is_org_member(p.organization_id)
    )
  );
create policy "Members can save organization posts"
  on project_posts for insert to authenticated
  with check (
    exists (
      select 1
      from projects p
      where p.id = project_posts.project_id
        and private.is_org_member(p.organization_id)
    )
  );
create policy "Members can remove organization saved posts"
  on project_posts for delete to authenticated
  using (
    exists (
      select 1
      from projects p
      where p.id = project_posts.project_id
        and private.is_org_member(p.organization_id)
    )
  );

create index if not exists idx_projects_organization_id on projects(organization_id);
create index if not exists idx_projects_created_by on projects(created_by);

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

drop trigger if exists organizations_updated_at on organizations;
create trigger organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

drop trigger if exists organization_memberships_updated_at on organization_memberships;
create trigger organization_memberships_updated_at
  before update on organization_memberships
  for each row execute function update_updated_at();

drop trigger if exists member_preferences_updated_at on member_preferences;
create trigger member_preferences_updated_at
  before update on member_preferences
  for each row execute function update_updated_at();

drop trigger if exists workspace_invitations_updated_at on workspace_invitations;
create trigger workspace_invitations_updated_at
  before update on workspace_invitations
  for each row execute function update_updated_at();

drop trigger if exists organization_subscriptions_updated_at on organization_subscriptions;
create trigger organization_subscriptions_updated_at
  before update on organization_subscriptions
  for each row execute function update_updated_at();

drop trigger if exists organization_payment_methods_updated_at on organization_payment_methods;
create trigger organization_payment_methods_updated_at
  before update on organization_payment_methods
  for each row execute function update_updated_at();

drop trigger if exists billing_invoices_updated_at on billing_invoices;
create trigger billing_invoices_updated_at
  before update on billing_invoices
  for each row execute function update_updated_at();

revoke all on function private.current_user_email() from public;
revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.has_org_role(uuid, text[]) from public;
revoke all on function private.active_admin_count(uuid) from public;

revoke all on function public.create_organisation_for_current_user(text) from public;
revoke all on function public.create_workspace_invitation(uuid, text, text) from public;
revoke all on function public.accept_workspace_invitation(text) from public;
revoke all on function public.revoke_workspace_invitation(uuid) from public;
revoke all on function public.remove_organization_member(uuid) from public;
revoke all on function public.update_organization_member_role(uuid, text) from public;
revoke all on function public.update_mock_subscription(uuid, text, text, text, int, int, text, text) from public;

grant execute on function public.create_organisation_for_current_user(text) to authenticated;
grant execute on function public.create_workspace_invitation(uuid, text, text) to authenticated;
grant execute on function public.accept_workspace_invitation(text) to authenticated;
grant execute on function public.revoke_workspace_invitation(uuid) to authenticated;
grant execute on function public.remove_organization_member(uuid) to authenticated;
grant execute on function public.update_organization_member_role(uuid, text) to authenticated;
grant execute on function public.update_mock_subscription(uuid, text, text, text, int, int, text, text) to authenticated;
