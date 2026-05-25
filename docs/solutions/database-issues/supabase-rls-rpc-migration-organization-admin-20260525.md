---
module: Supabase Organisation Admin
date: 2026-05-25
problem_type: database_issue
component: database
symptoms:
  - "Supabase RPC smoke test failed with column reference \"organization_id\" is ambiguous"
  - "Authenticated RLS reads failed with permission denied for function is_org_member"
  - "Supabase CLI reported remote migration versions not found in local migrations directory"
root_cause: missing_permission
resolution_type: migration
severity: high
tags: [supabase, rls, rpc, migrations, organization-admin, postgres]
---

# Troubleshooting: Supabase RLS, RPC, and Migration History During Organisation Rollout

## Problem

Adding organisation memberships, admin-only billing, invitations, and project ownership through Supabase RLS exposed three remote-only issues: ambiguous PL/pgSQL names, private helper function permissions, and a date-only migration history mismatch.

## Environment

- Module: Supabase Organisation Admin
- Framework: Next.js 15, React 19, Supabase Auth/Postgres/RLS
- Affected files: `supabase/migrations/*`, `src/lib/organization.ts`
- Date solved: 2026-05-25

## Symptoms

- Remote smoke test for `create_organisation_for_current_user` failed with:

```text
column reference "organization_id" is ambiguous
```

- RLS-protected reads failed for authenticated users with:

```text
permission denied for function is_org_member
```

- `supabase db push` failed after a local migration was renamed away from a date-only version:

```text
Remote migration versions not found in local migrations directory.
```

## Root Cause

PL/pgSQL output column names such as `organization_id` can collide with table column names inside the same function. RLS policies also execute helper functions as part of the caller's query, so authenticated callers need `execute` permission on helper functions referenced by policies, even when those helpers live in a non-exposed `private` schema.

The migration mismatch came from a previously applied date-only migration version (`20260525`) that no longer matched the timestamped local migration naming scheme.

## Solution

Qualify table references inside RPCs and avoid ambiguous `on conflict` targets:

```sql
select *
into existing_membership
from organization_memberships m
where m.user_id = current_user_id
  and m.removed_at is null
order by m.joined_at
limit 1;

insert into member_preferences (organization_id, user_id)
values (new_org_id, current_user_id)
on conflict on constraint member_preferences_pkey do nothing;
```

Grant execution on RLS helper functions to authenticated users:

```sql
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, text[]) to authenticated;
```

Normalize migration versions and repair stale remote history before pushing:

```bash
mv supabase/migrations/20260525_add_post_media_fields.sql \
  supabase/migrations/20260525080000_add_post_media_fields.sql

supabase migration repair --status reverted 20260525
supabase db push --include-all --yes
supabase migration list
```

## Verification

Run a remote smoke test with temporary Supabase Auth users rather than only relying on local build/type checks. The useful checks were:

- New sign-up RPC creates exactly one organisation and admin membership.
- Invited user accepts a hashed-token invitation and reads organisation projects.
- Member reads zero rows from `billing_invoices`, `organization_payment_methods`, and `workspace_invitations`.
- Removing the final admin fails.
- Removed member reads zero organisation projects.
- Authenticated non-admin receives `403` from `/api/invoices/[invoiceId]`.

Also confirm project backfill health after migration:

```text
projects: 9
projectPosts: 17
nullOrgProjects: 0
nullCreatorProjects: 0
```

## Prevention

When adding Supabase RLS helpers and RPCs:

- Prefix table aliases in PL/pgSQL functions whenever return column names overlap table columns.
- Prefer `on conflict on constraint ...` for composite keys inside RPCs.
- Grant `execute` on any function directly referenced by RLS policies to the roles that will hit those policies.
- Use timestamped migration versions consistently; avoid mixing date-only and timestamped migration filenames.
- Always run at least one remote RLS smoke test with real authenticated anon clients and a service-role cleanup client.

## Related Issues

- Feature plan: `docs/plans/2026-05-25-002-feat-profile-onboarding-org-admin-plan.md`
- Completed todo: `todos/002-complete-p1-profile-onboarding-org-admin.md`
