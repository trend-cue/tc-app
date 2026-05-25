# Sample Data

Real TikTok posts are loaded into the `posts` table by [scripts/ingest-tiktok.ts](../scripts/ingest-tiktok.ts). Discover, search, clusters, topics, and saved projects all read from this table.

Engagement metrics (likes, comments, shares, views) are real — pulled live from TikTok via `yt-dlp`. Editorial fields (`cluster_id`, `trend_score`, `why_trending`) are randomized per post, deterministic from post id. TikTok thumbnails are fetched through oEmbed, copied into the public `post-thumbnails` Supabase Storage bucket, and then served from that app-owned URL so cards do not depend on expiring TikTok CDN signatures.

---

## Running the ingest

### 1. Prereqs (one-time)

```bash
brew install yt-dlp        # if missing
brew install supabase/tap/supabase   # if migrations need pushing
```

`.env.local` must contain:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...      # bypasses RLS, never ship to browser
```

### 2. Apply the schema

The `posts` table is created by [supabase/migrations/20260430_add_posts_table.sql](../supabase/migrations/20260430_add_posts_table.sql). Durable media fields and the `post-thumbnails` Storage bucket are added by [supabase/migrations/20260525_add_post_media_fields.sql](../supabase/migrations/20260525_add_post_media_fields.sql). Push them with:

```bash
supabase db push
```

(`supabase link --project-ref <ref>` first if the project isn't linked yet.)

### 3. Edit the URL list, then run

URLs live in the `TIKTOK_URLS` array at the top of [scripts/ingest-tiktok.ts](../scripts/ingest-tiktok.ts).

```bash
pnpm run ingest:tiktok -- --dry   # fetch + normalize, print, no DB write
pnpm run ingest:tiktok            # fetch + upsert into posts
```

Re-running is safe: rows are upserted on `id` (= `tiktok:<video_id>`), so the same URL list refreshes engagement counts.

---

## What the script does

For each URL:

1. `yt-dlp --dump-json --skip-download` extracts caption, uploader, like/comment/share/view counts, upload timestamp, and the TikTok video id.
2. TikTok oEmbed fetches embeddable metadata and a fresh thumbnail source.
3. The thumbnail is downloaded and uploaded to the `post-thumbnails` Supabase Storage bucket; `thumbnail_url` stores the public Storage URL.
4. `embed_url` is built as `https://www.tiktok.com/player/v1/{video_id}?controls=1&description=0&music_info=0`.
5. Hashtags are parsed from the caption.
6. A cluster is picked deterministically from [src/lib/clusters.ts](../src/lib/clusters.ts) (six clusters: Sports, Beauty, Gaming/VFX, Food, Comedy/POV, Pop Culture).
7. `trend_score` (65–95) and a `why_trending` JSON blob (summary + signals + related hashtags) are generated from the post id hash.
8. Lone UTF-16 surrogates (broken emoji from TikTok captions) are stripped before the upsert — Postgres `jsonb` rejects them otherwise.

---

## Adding more URLs

Append to `TIKTOK_URLS` in the script and re-run. The ingest is idempotent.

To add new clusters:

1. Add an entry to `CLUSTERS` in [scripts/ingest-tiktok.ts](../scripts/ingest-tiktok.ts).
2. Add a matching entry to `CLUSTER_DIRECTORY` in [src/lib/clusters.ts](../src/lib/clusters.ts) so the app knows the name/accent/summary.

The two arrays must stay aligned by `id`. (Future cleanup: move them to a shared module the script imports from.)

---

## Schema

```sql
posts (
  id            text primary key,           -- "tiktok:<video_id>"
  platform      text,                       -- 'tiktok' for now
  external_id   text,                       -- TikTok video id
  source_url    text unique,
  embed_url     text,                       -- TikTok player iframe URL
  handle        text,                       -- "@username"
  display_name  text,
  content       text,                       -- caption
  hashtags      text[],
  is_video      boolean,
  thumbnail_url text,                       -- public Supabase Storage URL
  thumbnail_storage_path text,
  thumbnail_refreshed_at timestamptz,
  likes, comments, shares int,
  views         int,                        -- nullable
  posted_at     timestamptz,
  cluster_id    text,                       -- editorial, see clusters.ts
  trend_score   int,                        -- editorial, 0–100
  why_trending  jsonb,                      -- editorial
  oembed        jsonb,
  raw           jsonb                       -- full yt-dlp payload
);
```

RLS: `select` is allowed for any authenticated user; writes require the secret key (the script). The `project_posts.post_id` foreign key is `NOT VALID` so legacy mock-id rows survive — once those are cleaned up, run `alter table project_posts validate constraint project_posts_post_fk;`.

---

## Limits and caveats

- **TikTok only.** Instagram needs a Meta app token for oEmbed and is rate-limited heavily for scraping; not worth the effort for sample data.
- **ToS.** `yt-dlp` against public URLs for internal demo data is widely tolerated; do not redistribute scraped content publicly without attribution. The app surfaces `source_url` so attribution is one click away.
- **Freshness.** Re-run the script periodically. There's no cron yet. Re-running refreshes engagement counts and the cached thumbnail.
- **Editorial drift.** `trend_score` and `why_trending` are noise — fine for layout/UX, not for any actual analysis.
