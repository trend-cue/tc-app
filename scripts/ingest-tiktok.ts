/**
 * Sample-data ingest for TikTok URLs.
 *
 * Usage:
 *   pnpm run ingest:tiktok           # ingests the URLs in TIKTOK_URLS below
 *   pnpm run ingest:tiktok -- --dry  # fetch + normalize, print, do not write
 *
 * Requires:
 *   - yt-dlp on PATH (brew install yt-dlp)
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY
 *
 * The secret key (sb_secret_...) bypasses RLS. Keep it out of the browser
 * bundle and out of git.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const execFileP = promisify(execFile);

const TIKTOK_URLS = [
  "https://www.tiktok.com/@pastrychef_am/video/7633094092330667286",
  "https://www.tiktok.com/@zmills33/video/7626555387763887374",
  "https://www.tiktok.com/@kenva.avia/video/7631382896304983316",
  "https://www.tiktok.com/@ifixeye/video/7632404900458056978",
  "https://www.tiktok.com/@uni404src/video/7631324574461840661",
  "https://www.tiktok.com/@alevtinandmax/video/7623395407279705366",
  "https://www.tiktok.com/@glamvjollca/video/7631657505868877063",
  "https://www.tiktok.com/@kristinakorbut/video/7631484730231278866",
  "https://www.tiktok.com/@wellschels/video/7631826488177822983",
  "https://www.tiktok.com/@juliancoolians/video/7631649684364348690",
  "https://www.tiktok.com/@notcherrygrlfrnd/video/7619385113305976094",
  "https://www.tiktok.com/@studyhiro/video/7626461441570114823",
  "https://www.tiktok.com/@itsmorbar/video/7631295289323834642",
  "https://www.tiktok.com/@brigadeux/video/7631620910562168072",
  "https://www.tiktok.com/@user243680844/video/7630155271561661717",
  "https://www.tiktok.com/@eclat.aesthetic.atelier/video/7630888348072070421",
  "https://www.tiktok.com/@robinlim39/video/7631190702139002119",
  "https://www.tiktok.com/@magluxelashes/video/7630194814151036167",
  "https://www.tiktok.com/@laidbycy0/video/7630819849937194248",
  "https://www.tiktok.com/@supergloss/video/7625311748836412690",
  "https://www.tiktok.com/@smith_steven/video/7629413683730402578",
  "https://www.tiktok.com/@mortalgaming_official/video/7630558063635827975",
  "https://www.tiktok.com/@mia_njm/video/7633042164582305041",
  "https://www.tiktok.com/@najayra3/video/7631207490134265108",
  "https://www.tiktok.com/@ushiwakavolleyball/video/7626352385610239239",
  "https://www.tiktok.com/@guinnessworldrecords/video/7618701259003923734",
  "https://www.tiktok.com/@inilahcom/video/7630766541453184276",
  "https://www.tiktok.com/@ushiwakavolleyball/video/7629583669086276871",
  "https://www.tiktok.com/@riceonicee/video/7627474699961781525",
  "https://www.tiktok.com/@redbullbike/video/7625863279834877206",
  "https://www.tiktok.com/@mkiatipis/video/7621351271307447565",
];

const CLUSTERS = [
  { id: "c1", name: "Sports & Athletic Feats", accent: "#69c9d0" },
  { id: "c2", name: "Beauty & Glow-up", accent: "#e1306c" },
  { id: "c3", name: "Gaming & VFX", accent: "#7c6af7" },
  { id: "c4", name: "Food & Cravings", accent: "#c4a46b" },
  { id: "c5", name: "Comedy & Relatable POV", accent: "#f7a072" },
  { id: "c6", name: "Pop Culture Pulse", accent: "#8fa07a" },
];

const SIGNAL_TEMPLATES = [
  (n: number) => ({ label: "Share-to-view ratio", value: `${(n % 6 + 1).toFixed(1)}%`, note: "Above platform average" }),
  (n: number) => ({ label: "Watch-time completion", value: `${60 + (n % 35)}%`, note: "Strong retention" }),
  (n: number) => ({ label: "Stitch/Duet rate", value: `${200 + (n * 37) % 1500} remixes`, note: "Conversation driver" }),
  (n: number) => ({ label: "Sentiment", value: `${70 + (n % 25)}% positive`, note: "Aspirational tone" }),
  (n: number) => ({ label: "Save rate", value: `${5 + (n % 18)}%`, note: "Reference content" }),
];

const HASHTAG_GROWTHS = ["+98%", "+140%", "+165%", "+210%", "+290%", "+340%"];
const THUMBNAIL_BUCKET = "post-thumbnails";
const TIKTOK_OEMBED_ENDPOINT = "https://www.tiktok.com/oembed";

type Raw = Record<string, unknown>;

interface PostRow {
  id: string;
  platform: "tiktok" | "instagram" | "twitter";
  external_id: string | null;
  source_url: string;
  embed_url: string | null;
  handle: string;
  display_name: string | null;
  content: string | null;
  hashtags: string[];
  is_video: boolean;
  thumbnail_url: string | null;
  thumbnail_storage_path: string | null;
  thumbnail_refreshed_at: string | null;
  thumbnail_label: string | null;
  thumbnail_accent: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number | null;
  posted_at: string | null;
  cluster_id: string | null;
  trend_score: number | null;
  why_trending: unknown;
  oembed: Raw | null;
  raw: Raw;
}

async function ytdlp(url: string): Promise<Raw> {
  const { stdout } = await execFileP("yt-dlp", ["--dump-json", "--skip-download", url], {
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(stdout) as Raw;
}

// Postgres jsonb rejects strings containing lone UTF-16 surrogates (TikTok
// captions occasionally have these from broken emoji). Replace them with U+FFFD.
function stripLoneSurrogates(s: string): string {
  return s.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "�");
}

function sanitize<T>(value: T): T {
  if (typeof value === "string") return stripLoneSurrogates(value) as T;
  if (Array.isArray(value)) return value.map(sanitize) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v);
    return out as T;
  }
  return value;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function videoIdFromUrl(url: string): string | null {
  return url.match(/\/video\/(\d+)/)?.[1] ?? null;
}

function tiktokEmbedUrl(videoId: string): string {
  const url = new URL(`https://www.tiktok.com/player/v1/${videoId}`);
  url.searchParams.set("controls", "1");
  url.searchParams.set("description", "0");
  url.searchParams.set("music_info", "0");
  return url.toString();
}

function extractHashtags(caption: string): string[] {
  const tags = Array.from(caption.matchAll(/#([\p{L}0-9_]+)/gu)).map((m) => `#${m[1].toLowerCase()}`);
  return Array.from(new Set(tags));
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function rngFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function fakeWhyTrending(seed: number, hashtags: string[]) {
  const summaries = [
    "Format hits a satisfying loop with a strong opening hook — share mechanics carry it.",
    "Authenticity-coded creator + niche craft skill — algorithmically rewarded right now.",
    "Educational reframe of a familiar topic; high save rate and quote remix volume.",
    "Aesthetic-first composition resonating with current visual trend cycles.",
    "Polarizing-but-productive take driving long comment threads and quote shares.",
  ];
  const signals = [0, 1, 2, 3].map((i) => SIGNAL_TEMPLATES[Math.abs(seed + i) % SIGNAL_TEMPLATES.length](seed + i));
  const related = (hashtags.length ? hashtags : ["#fyp", "#viral", "#trending"]).slice(0, 4).map((tag, i) => ({
    tag,
    growth: HASHTAG_GROWTHS[Math.abs(seed + i) % HASHTAG_GROWTHS.length],
  }));
  return {
    summary: summaries[Math.abs(seed) % summaries.length],
    signals,
    relatedHashtags: related,
  };
}

async function fetchOembed(sourceUrl: string): Promise<Raw | null> {
  const url = new URL(TIKTOK_OEMBED_ENDPOINT);
  url.searchParams.set("url", sourceUrl);

  const res = await fetch(url, {
    headers: {
      "accept": "application/json",
      "user-agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    console.warn(`oEmbed failed (${res.status}) for ${sourceUrl}`);
    return null;
  }

  return (await res.json()) as Raw;
}

function cleanImageMime(contentType: string | null): string {
  const mime = contentType?.split(";")[0]?.trim().toLowerCase();
  if (mime === "image/jpg") return "image/jpeg";
  if (mime && ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) {
    return mime;
  }
  return "image/jpeg";
}

function extForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

async function cacheThumbnail(
  supabase: SupabaseClient,
  externalId: string,
  oembed: Raw | null
): Promise<{ url: string; path: string; refreshedAt: string } | null> {
  const thumbnailUrl = str(oembed?.thumbnail_url);
  if (!thumbnailUrl) return null;

  const res = await fetch(thumbnailUrl, {
    headers: {
      "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "user-agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    console.warn(`Thumbnail fetch failed (${res.status}) for ${externalId}`);
    return null;
  }

  const contentType = cleanImageMime(res.headers.get("content-type"));
  const path = `tiktok/${externalId}.${extForMime(contentType)}`;
  const bytes = Buffer.from(await res.arrayBuffer());

  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, bytes, {
      cacheControl: "31536000",
      contentType,
      upsert: true,
    });

  if (error) {
    console.warn(`Thumbnail upload failed for ${externalId}: ${error.message}`);
    return null;
  }

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, refreshedAt: new Date().toISOString() };
}

function normalize(raw: Raw, sourceUrl: string): PostRow {
  const externalId = str(raw.id) ?? videoIdFromUrl(sourceUrl);
  if (!externalId) throw new Error(`Could not determine TikTok video id for ${sourceUrl}`);

  const id = `tiktok:${externalId}`;
  const caption = str(raw.description) ?? str(raw.title) ?? "";
  const hashtags = extractHashtags(caption);
  const uploader = str(raw.uploader) ?? str(raw.uploader_id) ?? "";
  const ts = num(raw.timestamp);
  const seed = rngFromString(id);
  const cluster = pick(CLUSTERS, seed);

  return {
    id,
    platform: "tiktok",
    external_id: externalId,
    source_url: str(raw.webpage_url) ?? sourceUrl,
    embed_url: tiktokEmbedUrl(externalId),
    handle: uploader ? `@${uploader}` : "",
    display_name: str(raw.creator) ?? str(raw.channel) ?? uploader,
    content: caption || null,
    hashtags,
    is_video: true,
    thumbnail_url: null,
    thumbnail_storage_path: null,
    thumbnail_refreshed_at: null,
    thumbnail_label: caption ? `Video: ${caption.slice(0, 60)}` : "TikTok video",
    thumbnail_accent: cluster.accent,
    likes: num(raw.like_count) ?? 0,
    comments: num(raw.comment_count) ?? 0,
    shares: num(raw.repost_count) ?? 0,
    views: num(raw.view_count),
    posted_at: ts ? new Date(ts * 1000).toISOString() : null,
    cluster_id: cluster.id,
    trend_score: 65 + (Math.abs(seed) % 31),
    why_trending: fakeWhyTrending(seed, hashtags),
    oembed: null,
    raw,
  };
}

function envOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function main() {
  const dryRun = process.argv.includes("--dry");

  const supabase = dryRun
    ? null
    : createClient(envOrThrow("NEXT_PUBLIC_SUPABASE_URL"), envOrThrow("SUPABASE_SECRET_KEY"), {
        auth: { persistSession: false },
      });

  const rows: PostRow[] = [];
  let failed = 0;

  for (const [i, url] of TIKTOK_URLS.entries()) {
    process.stdout.write(`[${i + 1}/${TIKTOK_URLS.length}] ${url} ... `);
    try {
      const raw = await ytdlp(url);
      const row = normalize(raw, url);
      const oembed = await fetchOembed(row.source_url);
      row.oembed = oembed;

      if (supabase) {
        const cached = await cacheThumbnail(supabase, row.external_id!, oembed);
        if (cached) {
          row.thumbnail_url = cached.url;
          row.thumbnail_storage_path = cached.path;
          row.thumbnail_refreshed_at = cached.refreshedAt;
        }
      }

      rows.push(row);
      console.log(
        `ok (${row.likes} likes, ${row.views ?? "?"} views, ${
          row.thumbnail_storage_path ? "thumbnail cached" : "thumbnail fallback"
        })`
      );
    } catch (err) {
      failed++;
      console.log(`FAILED: ${(err as Error).message.split("\n")[0]}`);
    }
  }

  console.log(`\nFetched ${rows.length} / ${TIKTOK_URLS.length} (${failed} failed)`);

  if (dryRun) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (rows.length === 0) {
    console.error("Nothing to insert.");
    process.exit(1);
  }

  const { error } = await supabase!.from("posts").upsert(sanitize(rows), { onConflict: "id" });
  if (error) {
    console.error("Upsert failed:", error);
    process.exit(1);
  }
  console.log(`Upserted ${rows.length} rows into posts.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
