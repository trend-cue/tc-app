---
status: complete
priority: p1
issue_id: "002"
tags: [profile, onboarding, organizations, rls, billing, team-admin]
dependencies: []
---

# Add Profile Onboarding and Organisation Admin

## Problem Statement

TrendCue needs first-class organisations, profile onboarding, industry preferences, mock billing, and team administration while moving saved projects from user-owned rows to organisation-owned rows.

## Findings

- The current dashboard is a single client shell with tab-state navigation.
- Projects are currently scoped by `projects.user_id` and protected by user-owned RLS policies.
- Supabase Auth sign-up only creates the auth user; application workspace setup needs an idempotent RPC.
- The existing design language is compact, dark, dashboard-oriented, and mostly inline styles.

## Proposed Solutions

- Add organisation, membership, profile, preference, invitation, subscription, payment method, and invoice tables with RLS.
- Add RPCs for organisation creation, invitation acceptance, member removal, role changes, invite mutation, and mock billing updates.
- Add a profile view opened by the dashboard avatar, including onboarding, preferences, billing, invoices, and team controls.
- Update sign-up and invite routes to create or join workspaces.
- Boost Discover content from persisted industry preferences while preserving the global fallback.

## Recommended Action

Execute `docs/plans/2026-05-25-002-feat-profile-onboarding-org-admin-plan.md` on `main` as requested.

## Acceptance Criteria

- [x] Organisation schema, RLS policies, and project backfill are in place.
- [x] Sign-up creates an organisation and invited users can join an existing one.
- [x] Profile onboarding can start, resume, run a first search, save a first trend, and complete.
- [x] Industry preferences persist and influence Discover ranking.
- [x] Admin billing, invoice download, invitations, revocation, role changes, and member removal work with server/database checks.
- [x] README, plan checkboxes, build, lint, migration, and smoke validation are complete.

## Work Log

### 2026-05-25 - Started Implementation

**By:** Codex

**Actions:**
- Read the feature plan, repository references, and applicable execution/design/todo skills.
- Confirmed the user explicitly requested working directly on `main` and pushing to remote `main`.
- Pulled `origin/main` and confirmed the branch is up to date.

**Learnings:**
- The app has no generated Supabase Database types, so feature row types should live in the existing local type layer.

### 2026-05-25 - Completed Implementation

**By:** Codex

**Actions:**
- Added organisation, membership, profile, member preference, invitation, mock billing, payment method, and invoice schema with RLS and helper RPCs.
- Migrated projects to organisation ownership while preserving `projects.user_id` for rollback compatibility.
- Added sign-up organisation creation, invite acceptance, `/invite/[token]`, profile onboarding, preferences, admin billing, invoice download, and team management UI.
- Added Discover ranking boosts from persisted industry preferences.
- Applied the Supabase migrations to the linked remote project with the CLI.
- Ran remote RLS smoke tests for member billing denial, removed-member project denial, and last-admin protection.
- Verified the invoice route returns 403 for an authenticated non-admin member.
- Ran `pnpm run lint` and `pnpm run build`.

**Learnings:**
- Supabase RLS policies that call helper functions require authenticated execute grants on those helpers even when the helper schema is not exposed as an API surface.
- The linked remote had an older date-only `20260525` migration history mismatch; `supabase migration repair --status reverted 20260525` was needed before pushing new migrations.
