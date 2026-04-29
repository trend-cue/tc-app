import { Post, Cluster, QueryData } from "./types";

export const SUGGESTIONS = [
  "sustainable fashion summer 2026",
  "AI tools for content creators",
  "morning routine wellness aesthetic",
  "electric vehicle lifestyle content",
  "gen z financial independence",
];

const QUERIES: Record<string, QueryData> = {
  "sustainable fashion summer 2026": {
    analysisTime: 1400,
    totalPosts: 14820,
    clusters: [
      { id: "c1", name: "Slow Fashion Revival", postCount: 3280, trendScore: 94, growth: "+340%", color: "oklch(0.68 0.22 285)", tag: "\u{1F525} Breakout", summary: "Consumers rejecting fast fashion at scale \u2014 thrift hauls & brand accountability content dominating" },
      { id: "c2", name: "Deadstock Couture", postCount: 2140, trendScore: 88, growth: "+218%", color: "oklch(0.75 0.18 52)", tag: "Rising", summary: "Designers using leftover fabric scraps to create one-of-a-kind pieces \u2014 luxury framing of sustainability" },
      { id: "c3", name: "Climate Chic Aesthetic", postCount: 4910, trendScore: 91, growth: "+290%", color: "oklch(0.68 0.22 285)", tag: "\u{1F525} Breakout", summary: "Visual aesthetic merging climate anxiety with aspirational fashion \u2014 earthy tones, linen, visible mending" },
      { id: "c4", name: "Second-Hand Hauls", postCount: 2890, trendScore: 79, growth: "+155%", color: "oklch(0.62 0.14 160)", tag: "Steady", summary: "Thrift haul content continues growing \u2014 Depop & Vinted positioning as Gen Z luxury" },
      { id: "c5", name: "Brand Accountability", postCount: 1600, trendScore: 72, growth: "+98%", color: "oklch(0.62 0.14 20)", tag: "Emerging", summary: "Consumer watchdog content calling out greenwashing \u2014 high engagement, polarizing" },
    ],
    posts: [
      {
        id: "p1", clusterId: "c1", platform: "tiktok", handle: "@zerowaste.zara",
        displayName: "Zara Olmstead", content: "POV: I rebuilt my entire summer wardrobe for $47 at the thrift store and honestly? It hits harder than anything I bought new last year. Thread \u{1F9F5}",
        likes: 284000, comments: 12400, shares: 89000, views: 2100000,
        trendScore: 94, postedAt: "3h ago", isVideo: true,
        hashtags: ["#slowfashion", "#thrifthaul", "#sustainablestyle"],
        thumbnail: { label: "Video: thrift haul montage", accent: "#7c6af7" },
        whyTrending: {
          summary: "High emotional resonance combined with viral share mechanics \u2014 'for $47' hook drives shares. Part of a broader anti-haul counter-narrative that's displacing traditional haul content.",
          signals: [
            { label: "Share-to-view ratio", value: "4.2%", note: "8\u00D7 platform average" },
            { label: "#slowfashion weekly growth", value: "+340%", note: "Breakout hashtag" },
            { label: "Stitch/Duet rate", value: "1,240 remixes", note: "High conversation driver" },
            { label: "Sentiment", value: "89% positive", note: "Aspiration + achievability" },
          ],
          relatedHashtags: [
            { tag: "#thriftflip", growth: "+210%" }, { tag: "#slowfashion", growth: "+340%" },
            { tag: "#sustainableootd", growth: "+180%" }, { tag: "#depopfinds", growth: "+165%" },
          ],
        },
      },
      {
        id: "p2", clusterId: "c3", platform: "instagram", handle: "@earthlinen.co",
        displayName: "Earth & Linen", content: "The palette of summer 2026: clay, sand, sage, and storm. Visible mending as statement. Natural dye as identity. This is what caring looks like.",
        likes: 91200, comments: 4300, shares: 18700, views: null,
        trendScore: 91, postedAt: "5h ago", isVideo: false,
        hashtags: ["#climatechic", "#naturaldye", "#visiblemending"],
        thumbnail: { label: "Photo: linen editorial lookbook", accent: "#c4a46b" },
        whyTrending: {
          summary: "Visual aspirational content that reframes climate anxiety as aesthetic identity. The 'caring looks like' framing is widely reshared by brand accounts.",
          signals: [
            { label: "Save rate", value: "22%", note: "High intent signal" },
            { label: "#climatechic impressions", value: "14.2M", note: "+290% this week" },
            { label: "Brand reposts", value: "47 brand accounts", note: "Amplification wave" },
            { label: "Comments tone", value: "Aspiration dominant", note: "Low controversy" },
          ],
          relatedHashtags: [
            { tag: "#climatechic", growth: "+290%" }, { tag: "#naturaldye", growth: "+310%" },
            { tag: "#visiblemending", growth: "+220%" }, { tag: "#linencore", growth: "+195%" },
          ],
        },
      },
      {
        id: "p3", clusterId: "c2", platform: "instagram", handle: "@marcelledumont.studio",
        displayName: "Marcelle Dumont", content: "New collection: 12 pieces, zero new fabric. Every yard sourced from deadstock \u2014 luxury houses' discarded surplus. Each piece is the last of its kind.",
        likes: 62800, comments: 8900, shares: 21000, views: null,
        trendScore: 88, postedAt: "7h ago", isVideo: false,
        hashtags: ["#deadstockcouture", "#sustainableluxury", "#limitedrun"],
        thumbnail: { label: "Photo: couture deadstock pieces editorial", accent: "#c4a46b" },
        whyTrending: {
          summary: "Scarcity + sustainability combo unlocks luxury consumer segment. 'Last of its kind' framing is extremely effective for both press pickup and direct commerce.",
          signals: [
            { label: "Profile click-through", value: "34%", note: "Commerce intent high" },
            { label: "Press mentions", value: "12 publications", note: "Media amplification" },
            { label: "Hashtag originality score", value: "High", note: "#deadstockcouture coined here" },
            { label: "Avg. comment length", value: "28 words", note: "Deep engagement" },
          ],
          relatedHashtags: [
            { tag: "#deadstockfabric", growth: "+218%" }, { tag: "#sustainableluxury", growth: "+175%" },
            { tag: "#upcycledfashion", growth: "+140%" },
          ],
        },
      },
      {
        id: "p4", clusterId: "c1", platform: "twitter", handle: "@fashionautopsy",
        displayName: "Fashion Autopsy", content: "The math on fast fashion's \"sustainable collection\" doesn't add up. 3% recycled polyester \u2260 sustainable. Here's what's actually happening with these labels \u{1F9F5} [Thread 1/14]",
        likes: 48200, comments: 6100, shares: 31400, views: 890000,
        trendScore: 86, postedAt: "9h ago", isVideo: false,
        hashtags: ["#greenwashing", "#fashionindustry", "#sustainablefashion"],
        thumbnail: { label: "Thread: fast fashion greenwashing breakdown", accent: "#4aa8e0" },
        whyTrending: {
          summary: "Investigative thread format with numbers drives credibility shares. Greenwashing expos\u00E9 content clusters show consistent virality when backed by data.",
          signals: [
            { label: "Quote tweet rate", value: "65% of shares", note: "High discourse driver" },
            { label: "Thread completion rate", value: "78%", note: "Strong narrative pull" },
            { label: "Journalist shares", value: "23 journalists", note: "Media pickup likely" },
            { label: "Controversy index", value: "Moderate", note: "Productive debate" },
          ],
          relatedHashtags: [
            { tag: "#greenwashing", growth: "+98%" }, { tag: "#fashionpolitics", growth: "+120%" },
            { tag: "#slowfashion", growth: "+340%" },
          ],
        },
      },
      {
        id: "p5", clusterId: "c4", platform: "tiktok", handle: "@vintagevault_nyc",
        displayName: "Vintage Vault NYC", content: "Grading thrift hauls: a tier list. Why some finds are genuinely valuable vintage and others are just old. The criteria I use after 8 years sourcing.",
        likes: 198000, comments: 9200, shares: 44000, views: 1400000,
        trendScore: 79, postedAt: "12h ago", isVideo: true,
        hashtags: ["#thrifting", "#vintagefinds", "#depop"],
        thumbnail: { label: "Video: thrift grading tier list", accent: "#7c6af7" },
        whyTrending: {
          summary: "Educational format ('criteria I use after 8 years') builds authority and trust. Tier list format is highly saveable/shareable. Commerce intent is high.",
          signals: [
            { label: "Save rate", value: "14%", note: "Reference content behavior" },
            { label: "Comment asks", value: "1,200+ 'link to shop?'", note: "Commerce signal" },
            { label: "Watch time", value: "87% completion", note: "Strong retention" },
            { label: "#thrifting impressions", value: "22M this week", note: "Sustained volume" },
          ],
          relatedHashtags: [
            { tag: "#thriftfinds", growth: "+155%" }, { tag: "#depopfinds", growth: "+165%" },
            { tag: "#vintagestyle", growth: "+130%" },
          ],
        },
      },
      {
        id: "p6", clusterId: "c3", platform: "tiktok", handle: "@climatefit",
        displayName: "Climate Fit", content: "Outfits I wear when I'm anxious about the world but still want to look good. It's not ironic, it's coping \u{1F49A}",
        likes: 421000, comments: 23100, shares: 97000, views: 3800000,
        trendScore: 93, postedAt: "1h ago", isVideo: true,
        hashtags: ["#climateanxiety", "#OOTD", "#slowfashion"],
        thumbnail: { label: "Video: climate anxiety fashion OOTD", accent: "#7c6af7" },
        whyTrending: {
          summary: "Authentic emotional vulnerability combined with relatable humor. The 'coping' framing resonates deeply with Gen Z climate anxiety discourse. Breaking out fast.",
          signals: [
            { label: "Hour-over-hour growth", value: "+840%", note: "Accelerating now" },
            { label: "Share rate", value: "2.5%", note: "5\u00D7 platform average" },
            { label: "Comment keywords", value: "\"same\", \"relatable\", \"crying\"", note: "Emotional resonance" },
            { label: "Age demographic", value: "72% 18\u201328", note: "Core Gen Z segment" },
          ],
          relatedHashtags: [
            { tag: "#climateanxiety", growth: "+290%" }, { tag: "#climatechic", growth: "+290%" },
            { tag: "#sustainableootd", growth: "+180%" },
          ],
        },
      },
    ],
  },
  "AI tools for content creators": {
    analysisTime: 1100,
    totalPosts: 22340,
    clusters: [
      { id: "c6", name: "AI B-Roll & Visuals", postCount: 5820, trendScore: 96, growth: "+520%", color: "oklch(0.68 0.22 285)", tag: "\u{1F525} Breakout", summary: "AI-generated b-roll replacing stock footage \u2014 creators showcasing workflows and quality comparisons" },
      { id: "c7", name: "Automated Editing Flows", postCount: 4410, trendScore: 89, growth: "+310%", color: "oklch(0.75 0.18 52)", tag: "Rising", summary: "End-to-end automated video editing pipelines \u2014 from raw footage to published, zero manual cuts" },
      { id: "c8", name: "AI Voice & Script", postCount: 3290, trendScore: 84, growth: "+240%", color: "oklch(0.68 0.22 285)", tag: "Rising", summary: "Voice cloning and AI scriptwriting tools entering mainstream creator workflows" },
      { id: "c9", name: "The Authenticity Debate", postCount: 2180, trendScore: 77, growth: "+190%", color: "oklch(0.62 0.14 20)", tag: "Controversy", summary: "Audiences and creators debating transparency, disclosure, and the future of authentic content" },
      { id: "c10", name: "Creator Economy Shifts", postCount: 6640, trendScore: 82, growth: "+165%", color: "oklch(0.62 0.14 160)", tag: "Steady", summary: "How AI is changing creator monetization, follower expectations, and production costs" },
    ],
    posts: [
      {
        id: "p7", clusterId: "c6", platform: "tiktok" as const, handle: "@techwithtomas", displayName: "Tech with Tomas",
        content: "I made a 10-minute documentary using only AI-generated visuals. No stock footage. No camera. Here's the full breakdown of my workflow.",
        likes: 124000, comments: 8900, shares: 41000, views: 2900000, trendScore: 96, postedAt: "2h ago", isVideo: true,
        hashtags: ["#aivideo", "#contentcreators", "#aitools"],
        thumbnail: { label: "Video: AI documentary workflow breakdown", accent: "#7c6af7" },
        whyTrending: {
          summary: "Demonstrates a genuinely new creative workflow with high 'wow factor'. Documentary format proves the quality bar has crossed a threshold for general audiences.",
          signals: [
            { label: "Watch time", value: "94% full video", note: "Exceptional retention" },
            { label: "Creator reposts", value: "480+ creators", note: "Peer validation wave" },
            { label: "Tutorial saves", value: "28,000", note: "High reference intent" },
            { label: "#aivideo growth", value: "+520% WoW", note: "Breakout hashtag" },
          ],
          relatedHashtags: [
            { tag: "#aivideo", growth: "+520%" }, { tag: "#aitools", growth: "+310%" },
            { tag: "#contentcreation", growth: "+165%" },
          ],
        },
      },
      {
        id: "p8", clusterId: "c7", platform: "tiktok" as const, handle: "@editless.ai", displayName: "Editless",
        content: "Our tool just cut my editing time from 6 hours to 23 minutes. Not joking. This is the demo nobody asked us to do but everyone needed to see.",
        likes: 891000, comments: 44000, shares: 213000, views: 8200000, trendScore: 89, postedAt: "4h ago", isVideo: true,
        hashtags: ["#aiediting", "#contentcreators", "#videotools"],
        thumbnail: { label: "Video: AI editing speed comparison demo", accent: "#7c6af7" },
        whyTrending: {
          summary: "Specific numbers ('6 hours to 23 minutes') are massively shareable. Product demo wrapped in creator narrative \u2014 drives both commercial and editorial pickup.",
          signals: [
            { label: "Viral coefficient", value: "3.2", note: "Each viewer drives 3+ new views" },
            { label: "App store searches after post", value: "+840%", note: "Direct commerce impact" },
            { label: "B2B reshares", value: "320 agency accounts", note: "Professional segment" },
            { label: "Share velocity", value: "213K in 4h", note: "Accelerating" },
          ],
          relatedHashtags: [
            { tag: "#aiediting", growth: "+310%" }, { tag: "#videoproduction", growth: "+140%" },
            { tag: "#contenttools", growth: "+220%" },
          ],
        },
      },
      {
        id: "p9", clusterId: "c9", platform: "twitter" as const, handle: "@madelinechang_", displayName: "Madeline Chang",
        content: "Hot take: requiring AI disclosure on content is actually good for creators who are good. It separates craft from automation. Fight me.",
        likes: 34200, comments: 18900, shares: 28100, views: 1100000, trendScore: 77, postedAt: "6h ago", isVideo: false,
        hashtags: ["#AIcontent", "#creatordisclosure", "#contentcreators"],
        thumbnail: { label: "Tweet: AI disclosure debate thread", accent: "#4aa8e0" },
        whyTrending: {
          summary: "Contrarian take that validates both pro-AI and anti-AI audiences. 'Fight me' framing drives quote tweets. High signal-to-noise ratio in replies.",
          signals: [
            { label: "Quote tweet ratio", value: "82% of engagement", note: "Maximum debate driver" },
            { label: "Reach vs followers", value: "28\u00D7 amplification", note: "Algorithmic boost" },
            { label: "Reply sentiment", value: "Split 48/52%", note: "Perfect controversy balance" },
            { label: "Influencer engagement", value: "14 >100K accounts replied", note: "Second-wave potential" },
          ],
          relatedHashtags: [
            { tag: "#AIethics", growth: "+190%" }, { tag: "#contentcreators", growth: "+165%" },
            { tag: "#aicontent", growth: "+240%" },
          ],
        },
      },
    ],
  },
  "morning routine wellness aesthetic": {
    analysisTime: 980,
    totalPosts: 18760,
    clusters: [
      { id: "c11", name: "5AM Club 2.0", postCount: 4120, trendScore: 88, growth: "+270%", color: "oklch(0.68 0.22 285)", tag: "\u{1F525} Breakout", summary: "Second wave of early morning content \u2014 now focused on slowness over productivity hustle" },
      { id: "c12", name: "Cold Plunge Culture", postCount: 3680, trendScore: 92, growth: "+410%", color: "oklch(0.68 0.22 210)", tag: "\u{1F525} Breakout", summary: "Cold exposure content exploding beyond niche biohackers into mainstream wellness identity" },
      { id: "c13", name: "Skincare Rituals", postCount: 5290, trendScore: 85, growth: "+195%", color: "oklch(0.75 0.18 52)", tag: "Rising", summary: "Multi-step morning skincare framed as meditative ritual rather than beauty routine" },
      { id: "c14", name: "Dopamine Stacking", postCount: 2890, trendScore: 79, growth: "+185%", color: "oklch(0.62 0.14 160)", tag: "Rising", summary: "Stacking small pleasures in the morning (sunlight, coffee, journaling, cold shower) as a neuro-wellness framework" },
      { id: "c15", name: "Slow Morning Aesthetic", postCount: 2780, trendScore: 83, growth: "+230%", color: "oklch(0.68 0.22 285)", tag: "Rising", summary: "Anti-hustle morning routines \u2014 unhurried, atmospheric, no phone for first hour" },
    ],
    posts: [
      {
        id: "p10", clusterId: "c12", platform: "tiktok" as const, handle: "@coldwithclara", displayName: "Clara Vesper",
        content: "Day 90 of cold plunging. Here's what nobody told me would happen after month 3. This one surprised even me.",
        likes: 542000, comments: 31000, shares: 118000, views: 4600000, trendScore: 92, postedAt: "1h ago", isVideo: true,
        hashtags: ["#coldplunge", "#icebath", "#wellnessjourney"],
        thumbnail: { label: "Video: 90-day cold plunge results", accent: "#4aa8de" },
        whyTrending: {
          summary: "Day-count milestone + mystery hook ('nobody told me') is a proven viral formula. 90-day markers feel authoritative. The wellness identity community drives massive resharing.",
          signals: [
            { label: "Hook completion rate", value: "96% past 3s", note: "Extremely strong hook" },
            { label: "#coldplunge weekly views", value: "310M", note: "+410% growth" },
            { label: "Health creator duets", value: "2,100+", note: "Community amplification" },
            { label: "Discovery page placement", value: "Confirmed", note: "Algo boosted" },
          ],
          relatedHashtags: [
            { tag: "#coldplunge", growth: "+410%" }, { tag: "#icebath", growth: "+280%" },
            { tag: "#biohacking", growth: "+195%" },
          ],
        },
      },
      {
        id: "p11", clusterId: "c15", platform: "instagram" as const, handle: "@firsthour.co", displayName: "First Hour",
        content: "No alarm. No phone. Just light, coffee, and silence for the first hour. This is what morning was always supposed to be.",
        likes: 78400, comments: 5600, shares: 24000, views: null, trendScore: 83, postedAt: "4h ago", isVideo: false,
        hashtags: ["#slowmorning", "#digitaldetox", "#morningroutine"],
        thumbnail: { label: "Photo: slow morning atmospheric still", accent: "#c4a46b" },
        whyTrending: {
          summary: "Aspirational anti-hustle counter-programming. 'No phone for first hour' narrative resonates strongly with burnout demographic. High save rate for reference/inspiration.",
          signals: [
            { label: "Save rate", value: "31%", note: "Extremely high reference intent" },
            { label: "Share rate to DM", value: "18%", note: "Personal recommendation signal" },
            { label: "#slowmorning growth", value: "+230%", note: "Anti-hustle wave" },
            { label: "Brand partnership inquiries", value: "High", note: "Monetization signal" },
          ],
          relatedHashtags: [
            { tag: "#slowmorning", growth: "+230%" }, { tag: "#digitaldetox", growth: "+175%" },
            { tag: "#morningpeace", growth: "+160%" },
          ],
        },
      },
    ],
  },
};

export function getQueryData(query: string): QueryData | null {
  const match = Object.keys(QUERIES).find(
    (k) => k.toLowerCase() === query.toLowerCase()
  );
  return match ? QUERIES[match] : QUERIES[Object.keys(QUERIES)[0]];
}

export function getAllPosts(): Post[] {
  return Object.values(QUERIES).flatMap((q) => q.posts);
}

export function getAllClusters(): (Cluster & { topic: string })[] {
  return Object.entries(QUERIES)
    .flatMap(([topic, data]) => data.clusters.map((c) => ({ ...c, topic })))
    .sort((a, b) => b.trendScore - a.trendScore);
}
