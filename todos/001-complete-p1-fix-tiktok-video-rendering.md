---
status: complete
priority: p1
issue_id: "001"
tags: [tiktok, thumbnails, embeds, search, supabase]
dependencies: []
---

# Fix TikTok video rendering

## Problem Statement

TikTok videos render as black thumbnails because signed TikTok CDN thumbnail URLs expire. Search still returns old mock placeholders instead of real database posts.

## Findings

- `posts.thumbnail_url` stores TikTok CDN URLs with expiring signatures.
- `Thumb` renders thumbnails as a CSS background, so failed image loads degrade to a black rectangle.
- Search uses `src/lib/mock-data.ts` through `getQueryData`.
- TikTok supports durable iframe playback via `https://www.tiktok.com/player/v1/{post_id}`.

## Proposed Solutions

- Cache oEmbed thumbnails in Supabase Storage during ingest.
- Store durable media fields on `posts`.
- Render playable TikTok embeds in the detail panel.
- Search the loaded `posts` array instead of mock fixtures.

## Recommended Action

Execute `docs/plans/2026-05-25-001-fix-tiktok-video-rendering-plan.md` on `main`.

## Acceptance Criteria

- [x] Existing TikTok rows can be backfilled without deleting saved project references.
- [x] Card thumbnails load from app-owned/cached URLs.
- [x] Broken thumbnail loads show a labeled fallback.
- [x] TikTok detail view loads a playable iframe.
- [x] Search results use real DB posts.
- [x] Docs are updated.

## Work Log

### 2026-05-25 - Started Implementation

**By:** Codex

**Actions:**
- Read the plan and repository references.
- Confirmed work is approved directly on `main`.
- Confirmed Supabase Storage upload and public URL APIs from current docs.

**Learnings:**
- Service-key ingest is the right place to cache thumbnails because browser writes are not needed.

### 2026-05-25 - Completed Implementation

**By:** Codex

**Actions:**
- Added durable media fields and a public `post-thumbnails` Storage bucket migration.
- Updated TikTok ingest to fetch oEmbed metadata, upload thumbnails to Supabase Storage, and store TikTok player URLs.
- Replaced CSS background thumbnails with real `<img>` loading and fallback behavior.
- Added TikTok iframe playback in the detail panel.
- Replaced mock search data with real post filtering and real suggestions.
- Applied the migration to the linked remote Supabase project and re-ingested 31 TikTok rows.
- Verified all 31 rows have Storage-backed thumbnail URLs and embed URLs.
- Validated the browser flow on port 3001 with a temporary auth user, then deleted the user.

**Learnings:**
- Including cluster summaries in search over-matched broad topics; post text, profile fields, hashtags, and cluster names give tighter results.
- The project needed the official Next lint migration before `pnpm run lint` could run non-interactively.
