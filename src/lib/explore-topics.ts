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
    id: "gym",
    label: "Gym brands & fit checks",
    match: (p) =>
      /gymshark|alphalete|dfyne|nvgtn|gymtok|gym\s*brand|gymwear|gym\s*fit|activewear/i.test(
        corpus(p)
      ),
  },
  {
    id: "gymlifting",
    label: "Lifting & strength",
    match: (p) =>
      /deadlift|squat|bench|lifting|powerlifting|strength|workout|gains|muscle/i.test(
        corpus(p)
      ),
  },
  {
    id: "ai",
    label: "AI & the future of tech",
    match: (p) =>
      /\bai\b|artificial\s*intelligence|coding|developer|stem|llm|chatgpt|machine\s*learning/i.test(
        corpus(p)
      ),
  },
  {
    id: "techcreators",
    label: "Tech creators & rankings",
    match: (p) =>
      /mkbhd|mrwhosetheboss|colinandsamir|techyoutuber|tech\s*creator|youtuber/i.test(
        corpus(p)
      ),
  },
  {
    id: "gadgets",
    label: "Gadgets & reviews",
    match: (p) =>
      /gadget|review|smartglasses|smart\s*glasses|oneplus|apple|phone|unboxing|tech\s*review/i.test(
        corpus(p)
      ),
  },
  {
    id: "ootd",
    label: "OOTD & outfit inspo",
    match: (p) =>
      /\bootd\b|outfit|whatimwearing|wiw|fashion|style|lookbook|inspo/i.test(
        corpus(p)
      ),
  },
  {
    id: "zarafinds",
    label: "Zara & high-street finds",
    match: (p) =>
      /zara|zarahaul|mango|hm\b|highstreet|affordablefashion|springfashion/i.test(
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
