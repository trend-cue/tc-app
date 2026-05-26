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
    id: "gym",
    name: "Gym & Strength Training",
    accent: "#7c6af7",
    summary: "Transformation reveals, form breakdowns, PRs — gym content converting views into sign-ups and supplement sales.",
  },
  {
    id: "fashion",
    name: "OOTD & Street Style",
    accent: "#e1306c",
    summary: "Daily outfit drops, styling challenges, capsule wardrobes — fashion creators monetising aesthetics at scale.",
  },
  {
    id: "tech",
    name: "Tech & Creator Economy",
    accent: "#69c9d0",
    summary: "AI debates, gadget reviews, creator comparisons — tech content driving the highest save and share rates on platform.",
  },
  {
    id: "business",
    name: "Founder & Hustle Culture",
    accent: "#69c9d0",
    summary: "SaaS journeys, cold email wins, building-in-public — entrepreneurship content driving massive aspirational shares.",
  },
  {
    id: "money",
    name: "Money & Income Streams",
    accent: "#c4a46b",
    summary: "Side hustle income reveals, digital products, passive income blueprints — money content breaking through every demographic.",
  },
  {
    id: "wellness",
    name: "Wellness & Recovery",
    accent: "#4dd8a0",
    summary: "HRV tracking, supplement stacks, sleep protocols — the performance side of wellness entering mainstream gym culture.",
  },
  {
    id: "luxury",
    name: "Luxury & Brand Culture",
    accent: "#f7a072",
    summary: "Designer unboxings, brand deal transparency, wardrobe audits — aspirational content driving commerce intent at scale.",
  },
  // Legacy clusters kept for backward compatibility with any existing Supabase posts
  {
    id: "c1",
    name: "Sports & Athletic Feats",
    accent: "#69c9d0",
    summary: "Physical-skill clips with high share velocity.",
  },
  {
    id: "c2",
    name: "Beauty & Glow-up",
    accent: "#e1306c",
    summary: "Beauty creators converting attention into commerce.",
  },
  {
    id: "c3",
    name: "Gaming & VFX",
    accent: "#7c6af7",
    summary: "Virtual-world content blurring with film craft.",
  },
  {
    id: "c4",
    name: "Food & Cravings",
    accent: "#c4a46b",
    summary: "Short, satisfying loops that crush completion rate.",
  },
  {
    id: "c5",
    name: "Comedy & Relatable POV",
    accent: "#f7a072",
    summary: "Relatable-format engine running hot.",
  },
  {
    id: "c6",
    name: "Pop Culture Pulse",
    accent: "#8fa07a",
    summary: "Pop-culture moments riding the algorithm.",
  },
];

const BY_ID = new Map(CLUSTER_DIRECTORY.map((c) => [c.id, c]));

export function clusterById(id: string | null | undefined): ClusterMeta | undefined {
  return id ? BY_ID.get(id) : undefined;
}
