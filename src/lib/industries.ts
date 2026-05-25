import { Cluster, Post } from "./types";

export interface IndustryDefinition {
  key: string;
  label: string;
  description: string;
  color: string;
  suggestedQuery: string;
  keywords: string[];
  clusterIds: string[];
}

export const INDUSTRIES: IndustryDefinition[] = [
  {
    key: "beauty",
    label: "Beauty & self-care",
    description: "Skincare, makeup, glow-up rituals, salons, and aesthetic services.",
    color: "oklch(0.74 0.19 345)",
    suggestedQuery: "skincare glow beauty routine",
    keywords: ["beauty", "makeup", "skincare", "glow", "lashes", "lipstick", "aesthetic", "laser"],
    clusterIds: ["beauty"],
  },
  {
    key: "food",
    label: "Food & hospitality",
    description: "Desserts, cafes, restaurants, bakeries, and food creators.",
    color: "oklch(0.76 0.18 72)",
    suggestedQuery: "dessert pastry cafe trend",
    keywords: ["pastry", "dessert", "patisserie", "pasticceria", "chef", "cafe", "food"],
    clusterIds: ["pastry"],
  },
  {
    key: "sports",
    label: "Sports & movement",
    description: "Athlete clips, training moments, outdoor action, and fan edits.",
    color: "oklch(0.72 0.18 154)",
    suggestedQuery: "volleyball basketball mountain biking",
    keywords: ["volleyball", "basketball", "streetball", "mtb", "mountain", "bike", "athlete", "training"],
    clusterIds: ["volleyball", "streetball", "mtb"],
  },
  {
    key: "gaming",
    label: "Gaming & virtual worlds",
    description: "Gameplay, Roblox, racing sims, cinematic edits, and 3D culture.",
    color: "oklch(0.7 0.19 285)",
    suggestedQuery: "gaming roblox cinematic edit",
    keywords: ["gaming", "roblox", "granturismo", "3d", "cinematic", "animation", "gameplay"],
    clusterIds: ["gaming"],
  },
  {
    key: "entertainment",
    label: "Entertainment & culture",
    description: "Music, creators, live events, celebrities, and pop culture moments.",
    color: "oklch(0.72 0.19 25)",
    suggestedQuery: "pop culture music creator moment",
    keywords: ["coachella", "music", "creator", "madonna", "sabrina", "sidemen", "charity", "culture"],
    clusterIds: ["popculture"],
  },
  {
    key: "comedy",
    label: "Comedy & relatable POV",
    description: "Sketches, reactions, chaotic retail stories, and everyday humor.",
    color: "oklch(0.74 0.16 210)",
    suggestedQuery: "pov comedy relatable moment",
    keywords: ["pov", "comedy", "humor", "funny", "absurd", "delivery", "shopping", "crashout"],
    clusterIds: ["comedy"],
  },
];

export function industryByKey(key: string): IndustryDefinition | undefined {
  return INDUSTRIES.find((industry) => industry.key === key);
}

export function selectedIndustries(keys: string[]): IndustryDefinition[] {
  const selected = keys
    .map((key) => industryByKey(key))
    .filter((industry): industry is IndustryDefinition => Boolean(industry));
  return selected.length > 0 ? selected : [];
}

export function suggestedQueryForIndustries(keys: string[]): string {
  const first = selectedIndustries(keys)[0];
  return first?.suggestedQuery ?? "emerging trend ideas";
}

function postCorpus(post: Post): string {
  return [
    post.content,
    post.handle,
    post.displayName,
    post.clusterId,
    ...post.hashtags,
    post.whyTrending.summary,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function clusterCorpus(cluster: Cluster): string {
  return [cluster.id, cluster.name, cluster.summary, cluster.tag]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function industryScoreForPost(post: Post, industryKeys: string[]): number {
  if (industryKeys.length === 0) return 0;

  const corpus = postCorpus(post);
  return selectedIndustries(industryKeys).reduce((score, industry) => {
    const clusterMatch = industry.clusterIds.includes(post.clusterId) ? 4 : 0;
    const keywordMatches = industry.keywords.filter((keyword) =>
      corpus.includes(keyword.toLowerCase())
    ).length;
    return score + clusterMatch + keywordMatches;
  }, 0);
}

export function industryScoreForCluster(
  cluster: Cluster,
  industryKeys: string[]
): number {
  if (industryKeys.length === 0) return 0;

  const corpus = clusterCorpus(cluster);
  return selectedIndustries(industryKeys).reduce((score, industry) => {
    const clusterMatch = industry.clusterIds.includes(cluster.id) ? 5 : 0;
    const keywordMatches = industry.keywords.filter((keyword) =>
      corpus.includes(keyword.toLowerCase())
    ).length;
    return score + clusterMatch + keywordMatches;
  }, 0);
}

export function sortPostsForIndustries(posts: Post[], industryKeys: string[]): Post[] {
  if (industryKeys.length === 0) return [...posts];

  return [...posts].sort((a, b) => {
    const scoreDiff =
      industryScoreForPost(b, industryKeys) -
      industryScoreForPost(a, industryKeys);
    return scoreDiff || b.trendScore - a.trendScore;
  });
}

export function sortClustersForIndustries<T extends Cluster>(
  clusters: T[],
  industryKeys: string[]
): T[] {
  if (industryKeys.length === 0) return [...clusters];

  return [...clusters].sort((a, b) => {
    const scoreDiff =
      industryScoreForCluster(b, industryKeys) -
      industryScoreForCluster(a, industryKeys);
    return scoreDiff || b.trendScore - a.trendScore;
  });
}

export function isIndustryMatchedPost(post: Post, industryKeys: string[]): boolean {
  return industryScoreForPost(post, industryKeys) > 0;
}
