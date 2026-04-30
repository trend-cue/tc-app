// Cluster directory. Mirrors the CLUSTERS constant in scripts/ingest-tiktok.ts.
// When that script grows new clusters, update this file too.

export interface ClusterMeta {
  id: string;
  name: string;
  accent: string;
  summary: string;
}

export const CLUSTER_DIRECTORY: ClusterMeta[] = [
  {
    id: "c1",
    name: "Sports & Athletic Feats",
    accent: "#69c9d0",
    summary: "Volleyball digs, MTB tricks, world-record skips — physical-skill clips with high share velocity.",
  },
  {
    id: "c2",
    name: "Beauty & Glow-up",
    accent: "#e1306c",
    summary: "Lashes, lipstick reactions, laser treatments — beauty creators converting attention into commerce.",
  },
  {
    id: "c3",
    name: "Gaming & VFX",
    accent: "#7c6af7",
    summary: "DIY rigs, 3D animation, Roblox cinematic edits — virtual-world content blurring with film craft.",
  },
  {
    id: "c4",
    name: "Food & Cravings",
    accent: "#c4a46b",
    summary: "Pastry close-ups, sensory eating clips — short, satisfying loops that crush completion rate.",
  },
  {
    id: "c5",
    name: "Comedy & Relatable POV",
    accent: "#f7a072",
    summary: "Pool-delivery disasters, dorm crashouts, friendship POVs — relatable-format engine running hot.",
  },
  {
    id: "c6",
    name: "Pop Culture Pulse",
    accent: "#8fa07a",
    summary: "Charity-match pranks, movie promos, Guinness records — pop-culture moments riding the algorithm.",
  },
];

const BY_ID = new Map(CLUSTER_DIRECTORY.map((c) => [c.id, c]));

export function clusterById(id: string | null | undefined): ClusterMeta | undefined {
  return id ? BY_ID.get(id) : undefined;
}
