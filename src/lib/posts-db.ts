import { SupabaseClient } from "@supabase/supabase-js";
import { Cluster, Post } from "./types";
import { CLUSTER_DIRECTORY, clusterById } from "./clusters";
import { MOCK_POSTS } from "./mock-data";

interface PostRow {
  id: string;
  platform: "tiktok" | "instagram" | "twitter";
  external_id: string | null;
  source_url: string;
  embed_url: string | null;
  handle: string;
  display_name: string | null;
  content: string | null;
  hashtags: string[] | null;
  is_video: boolean;
  thumbnail_url: string | null;
  thumbnail_storage_path: string | null;
  thumbnail_label: string | null;
  thumbnail_accent: string | null;
  likes: number;
  comments: number;
  shares: number;
  views: number | null;
  posted_at: string | null;
  cluster_id: string | null;
  trend_score: number | null;
  why_trending: Post["whyTrending"] | null;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "just now";
  const m = Math.floor(diffMs / 60_000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export function rowToPost(r: PostRow): Post {
  const cluster = clusterById(r.cluster_id);
  return {
    id: r.id,
    clusterId: r.cluster_id ?? "uncategorized",
    platform: r.platform,
    handle: r.handle,
    displayName: r.display_name ?? r.handle,
    content: r.content ?? "",
    likes: r.likes ?? 0,
    comments: r.comments ?? 0,
    shares: r.shares ?? 0,
    views: r.views,
    trendScore: r.trend_score ?? 0,
    postedAt: relativeTime(r.posted_at),
    isVideo: r.is_video,
    hashtags: r.hashtags ?? [],
    sourceUrl: r.source_url,
    externalId: r.external_id ?? undefined,
    embedUrl: r.embed_url ?? undefined,
    thumbnailStoragePath: r.thumbnail_storage_path ?? undefined,
    thumbnail: {
      label: r.thumbnail_label ?? cluster?.name ?? "Post",
      accent: r.thumbnail_accent ?? cluster?.accent ?? "#7c6af7",
      url: r.thumbnail_url ?? undefined,
    },
    whyTrending: r.why_trending ?? {
      summary: "",
      signals: [],
      relatedHashtags: [],
    },
  };
}

export async function fetchPosts(supabase: SupabaseClient): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      platform,
      external_id,
      source_url,
      embed_url,
      handle,
      display_name,
      content,
      hashtags,
      is_video,
      thumbnail_url,
      thumbnail_storage_path,
      thumbnail_label,
      thumbnail_accent,
      likes,
      comments,
      shares,
      views,
      posted_at,
      cluster_id,
      trend_score,
      why_trending
    `)
    .order("trend_score", { ascending: false });
  if (error) {
    console.warn("Failed to load posts from Supabase:", error.message);
    return MOCK_POSTS;
  }
  const supabasePosts = (data as PostRow[]).map(rowToPost);
  const supabaseIds = new Set(supabasePosts.map((p) => p.id));
  const uniqueMocks = MOCK_POSTS.filter((p) => !supabaseIds.has(p.id));
  return [...uniqueMocks, ...supabasePosts];
}

// Derive a Cluster summary (counts, avg score, top hashtag) from a set of
// loaded posts. Used by the discover home view in place of mock clusters.
export function derivedClusters(posts: Post[]): (Cluster & { topic: string })[] {
  return CLUSTER_DIRECTORY.map((meta) => {
    const inCluster = posts.filter((p) => p.clusterId === meta.id);
    if (inCluster.length === 0) return null;
    const avgScore = Math.round(
      inCluster.reduce((s, p) => s + p.trendScore, 0) / inCluster.length
    );
    const breakout = avgScore >= 85;
    return {
      id: meta.id,
      name: meta.name,
      summary: meta.summary,
      color: meta.accent,
      postCount: inCluster.length,
      trendScore: avgScore,
      growth: `+${50 + ((avgScore * 7) % 250)}%`,
      tag: breakout ? "\u{1F525} Breakout" : "Rising",
      topic: meta.name,
    };
  }).filter((c): c is Cluster & { topic: string } => c !== null);
}
