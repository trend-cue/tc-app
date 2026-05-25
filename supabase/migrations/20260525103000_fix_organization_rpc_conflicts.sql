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
  from organization_memberships m
  where m.user_id = current_user_id
    and m.removed_at is null
  order by m.joined_at
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
  on conflict on constraint member_preferences_pkey do nothing;

  insert into organization_subscriptions (organization_id, tier_key, status)
  values (new_org_id, 'starter', 'active')
  on conflict on constraint organization_subscriptions_organization_id_key do nothing;

  organization_id := new_org_id;
  membership_id := new_membership_id;
  return next;
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
  from workspace_invitations wi
  where wi.token_hash = hashed_token
    and wi.accepted_at is null
    and wi.revoked_at is null
    and wi.expires_at > now()
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
  from organization_memberships m
  where m.organization_id = invite.organization_id
    and m.user_id = current_user_id
    and m.removed_at is null
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
  on conflict on constraint member_preferences_pkey do nothing;

  update workspace_invitations wi
  set accepted_at = now(), updated_at = now()
  where wi.id = invite.id;

  organization_id := invite.organization_id;
  membership_id := new_membership_id;
  return next;
end;
$$;
