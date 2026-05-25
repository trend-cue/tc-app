---
module: Projects View
date: 2026-05-25
problem_type: ui_bug
component: react_component
symptoms:
  - "Project list cards showed patterned placeholder tiles instead of saved post thumbnails"
  - "Video posts in project previews had no thumbnail or video affordance even after durable thumbnail metadata was available"
root_cause: logic_error
resolution_type: code_fix
severity: low
tags: [projects-view, thumbnails, video-preview, nextjs, react, supabase-storage, tiktok-oembed]
---

# Troubleshooting: Project Cards Missing Saved Post Thumbnails

## Problem

After durable TikTok thumbnail metadata was added, post cards and detail panels displayed thumbnails correctly, but project list cards still rendered a 2x2 placeholder preview. Saved video posts therefore looked like generic patterned blocks in the Projects list instead of showing the actual video thumbnails.

## Environment

- Module: Projects View
- Framework: Next.js 15, React 19
- Affected component: `src/components/projects-view.tsx`
- Date solved: 2026-05-25

## Symptoms

- Projects list cards used striped placeholder backgrounds for saved posts.
- Saved TikTok video posts did not show their cached thumbnail in project previews.
- The preview grid used a fixed height, so preview cells were not reliably square.

## What Didn't Work

**Direct solution:** The problem was identified from the component code and fixed on the first attempt.

The rest of the app already had usable thumbnail data through `post.thumbnail.url`; the Projects list simply had a separate preview renderer that had not been updated to use it.

## Root Cause

`ProjectCard` built its preview grid from `project.postIds`, but each occupied tile rendered only a patterned background and a tiny accent square:

```tsx
background: preview[i]
  ? "repeating-linear-gradient(...)"
  : "#0d0d16"
```

That preview path was disconnected from the thumbnail rendering used by `PostCard` and `DetailPanel`. As a result, the durable thumbnail fix did not reach the Projects list.

The upstream media fix also exposed a broader rule: do not treat a `thumbnail_url`
field as durable unless the app owns that URL. TikTok's `yt-dlp` and oEmbed
thumbnail URLs are signed CDN URLs with expiry parameters, so persisting them
directly causes black or blank media surfaces days later. The durable path is:
fetch fresh third-party metadata during ingest, copy the asset into app-owned
Storage, and render only the app-owned public URL.

## Solution

Add a dedicated `ProjectPreviewTile` in `src/components/projects-view.tsx` that renders `post.thumbnail.url` when available, falls back cleanly when the image is missing or fails to load, and overlays a small play marker for video posts.

Key pattern:

```tsx
function ProjectPreviewTile({ post }: { post?: Post }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = post?.thumbnail.url;
  const hasImage = !!imageUrl && !failed;

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {hasImage && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
}
```

Make the preview area square so all four tiles are square:

```tsx
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gridTemplateRows: "repeat(2, minmax(0, 1fr))",
    gap: 2,
    padding: "12px 12px 0",
    aspectRatio: "1 / 1",
  }}
>
```

## Why This Works

The Projects list already has access to full `Post` objects by mapping each saved `postId` through `allPosts`. Using `post.thumbnail.url` in the preview tile keeps project cards aligned with the same durable media metadata used elsewhere in the app.

The `failed` state prevents broken image loads from leaving blank tiles, and resetting that state when `imageUrl` changes avoids carrying one image's failure state into another saved post preview.

The square grid belongs on the 2x2 preview container, not each individual tile. A square parent with two equal rows and two equal columns produces four stable square cells without requiring hard-coded heights.

## Compounded Learnings From The Media Fix

- **Cache third-party thumbnails under app control.** TikTok CDN/oEmbed thumbnail URLs can return `403` after their signature expires. The ingest script now downloads the oEmbed thumbnail and uploads it to the public `post-thumbnails` Supabase Storage bucket, then stores that Storage URL in `posts.thumbnail_url`.
- **Separate preview media from playable media.** Cards and project previews should use cached image thumbnails. Detail views can use the durable TikTok player URL (`https://www.tiktok.com/player/v1/{external_id}`) for playback.
- **Keep every thumbnail surface in sync.** Main feed cards, detail panels, project list previews, and saved project detail cards are separate rendering paths. When media metadata changes, grep for all uses of `thumbnail`, `Thumb`, and project preview rendering.
- **Use real image elements when fallback matters.** CSS `background-image` gives no load error hook, so expired images become black boxes. A real `<img onError>` lets the UI switch to a labeled fallback.
- **Avoid fetching huge raw payloads into the browser.** `posts.raw` and `posts.oembed` can be large. Client loaders should select only the fields needed for UI, such as `thumbnail_url`, `embed_url`, counts, caption, hashtags, and cluster metadata.
- **Search fixes can reveal media bugs.** Replacing mock search with DB-backed search makes saved/project surfaces use real post ids consistently. Legacy mock `project_posts.post_id` rows can still exist until cleaned up, so missing previews can also indicate stale saved ids rather than a rendering issue.

## Verification

Ran:

```bash
pnpm run build
```

Result: build passed.

For the upstream TikTok media fix, also verified:

```bash
pnpm run ingest:tiktok -- --dry
pnpm run ingest:tiktok
pnpm run lint
```

The real ingest refreshed 31/31 TikTok rows, cached thumbnails in Supabase
Storage, and stored TikTok embed URLs. Browser validation confirmed Storage
thumbnail images loaded without broken images and the detail view rendered a
TikTok player iframe.

The change was committed and pushed in:

```text
bc72792 feat: add profile plan and project previews
```

## Prevention

- When media rendering changes, search for all thumbnail surfaces, not only the main feed and detail view.
- Prefer a shared thumbnail display helper when multiple components render the same `Post["thumbnail"]` shape.
- For fixed preview grids, use `aspectRatio` and explicit grid rows/columns rather than fixed heights so tile geometry stays stable across card widths.
- Treat third-party CDN image URLs as temporary unless you control their cache/lifetime.
- Ingest scripts should store both the original source URL and an app-owned display URL; UI components should prefer the app-owned display URL.
- Browser data loaders should avoid `select("*")` for media-rich tables with large `jsonb` columns.

## Related Issues

- Upstream fix plan: `docs/plans/2026-05-25-001-fix-tiktok-video-rendering-plan.md`
- Sample data docs: `docs/sample-data.md`
- Media schema migration: `supabase/migrations/20260525_add_post_media_fields.sql`
