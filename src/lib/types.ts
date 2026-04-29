export interface Post {
  id: string;
  clusterId: string;
  platform: "tiktok" | "instagram" | "twitter";
  handle: string;
  displayName: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  views: number | null;
  trendScore: number;
  postedAt: string;
  isVideo: boolean;
  hashtags: string[];
  thumbnail: { label: string; accent: string };
  whyTrending: {
    summary: string;
    signals: { label: string; value: string; note: string }[];
    relatedHashtags: { tag: string; growth: string }[];
  };
}

export interface Cluster {
  id: string;
  name: string;
  postCount: number;
  trendScore: number;
  growth: string;
  color: string;
  tag: string;
  summary: string;
}

export interface QueryData {
  analysisTime: number;
  totalPosts: number;
  clusters: Cluster[];
  posts: Post[];
}

export interface Project {
  id: string;
  name: string;
  color: string;
  postIds: string[];
  created_at: string;
  updated_at: string;
}

export interface PlatformMeta {
  label: string;
  color: string;
  icon: "tiktok" | "instagram" | "x";
}

export const PLATFORM_META: Record<string, PlatformMeta> = {
  tiktok: { label: "TikTok", color: "#69c9d0", icon: "tiktok" },
  instagram: { label: "Instagram", color: "#e1306c", icon: "instagram" },
  twitter: { label: "X", color: "#e7e9ea", icon: "x" },
};

export const PROJECT_COLORS = [
  "oklch(0.68 0.22 285)",
  "oklch(0.72 0.18 210)",
  "oklch(0.75 0.18 52)",
  "oklch(0.68 0.22 10)",
  "oklch(0.72 0.18 145)",
  "oklch(0.70 0.18 310)",
];

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
