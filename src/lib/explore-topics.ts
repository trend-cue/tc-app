import { Post } from "./types";

export interface ExploreTopic {
  id: string;
  label: string;
  match: (post: Post) => boolean;
}

const corpus = (p: Post) =>
  [p.content, p.handle, ...(p.hashtags || [])].join(" ");

export const EXPLORE_TOPICS: ExploreTopic[] = [
  {
    id: "volleyball",
    label: "Volleyball plays",
    match: (p) => /volleyball|ushiwaka/i.test(corpus(p)),
  },
  {
    id: "mtb",
    label: "Mountain biking",
    match: (p) => /\bmtb\b|mountainbik|bikelife|redbullbike/i.test(corpus(p)),
  },
  {
    id: "streetball",
    label: "Streetball & basketball",
    match: (p) => /basketball|streetball|kiatipis/i.test(corpus(p)),
  },
  {
    id: "pastry",
    label: "Pastries & desserts",
    match: (p) =>
      /pastry|patisserie|pasticceria|dessert|pastrychef/i.test(corpus(p)),
  },
  {
    id: "beauty",
    label: "Beauty & glow-up",
    match: (p) =>
      /lipstick|lashes|beauty|makeup|laser|braceface|skincare|glow|aesthetic/i.test(
        corpus(p)
      ),
  },
  {
    id: "records",
    label: "World records & feats",
    match: (p) =>
      /guinness|world record|worldrecord|revolution.*skip/i.test(corpus(p)),
  },
  {
    id: "gaming",
    label: "Gaming & 3D edits",
    match: (p) =>
      /roblox|granturismo|3danimation|gaming|cinematic/i.test(corpus(p)),
  },
  {
    id: "popculture",
    label: "Pop culture pulse",
    match: (p) =>
      /coachella|sabrinacarpenter|madonna|sidemen|charitymatch|maxfosh|likeaprayer/i.test(
        corpus(p)
      ),
  },
  {
    id: "comedy",
    label: "Comedy & POV",
    match: (p) =>
      /\bpov\b|crashout|absurdcomedy|комедия|humor|delivery|shoppingproblems/i.test(
        corpus(p)
      ),
  },
];

export function topicsWithMatches(
  posts: Post[]
): { topic: ExploreTopic; posts: Post[] }[] {
  return EXPLORE_TOPICS.map((topic) => ({
    topic,
    posts: posts.filter(topic.match),
  })).filter((entry) => entry.posts.length > 0);
}
