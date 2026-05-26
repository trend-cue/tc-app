"use client";

import { useState, useEffect } from "react";
import { QueryData, Post } from "@/lib/types";
import { derivedClusters } from "@/lib/posts-db";
import { topicsWithMatches } from "@/lib/explore-topics";
import {
  industryScoreForPost,
  sortClustersForIndustries,
  sortPostsForIndustries,
} from "@/lib/industries";
import { PostCard } from "./post-card";
import { ClusterPill } from "./cluster-pill";
import { DetailPanel } from "./detail-panel";
import { FilterBar } from "./filter-bar";

function GeneralDiscovery({
  posts,
  onClusterOpen,
  onTopicOpen,
  accent,
  preferredIndustryKeys,
  isPostSaved,
  openPicker,
}: {
  posts: Post[];
  onClusterOpen: (clusterId: string) => void;
  onTopicOpen: (topicId: string) => void;
  accent: string;
  preferredIndustryKeys: string[];
  isPostSaved: (id: string) => boolean;
  openPicker: (postId: string, e: React.MouseEvent) => void;
}) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const allClusters = sortClustersForIndustries(
    derivedClusters(posts),
    preferredIndustryKeys
  );
  const breakouts = allClusters
    .filter((c) => c.tag.includes("Breakout"))
    .slice(0, 6);
  const hotPosts = sortPostsForIndustries(posts, preferredIndustryKeys).slice(0, 6);

  const exploreTopics = topicsWithMatches(posts).sort((a, b) => {
    if (preferredIndustryKeys.length === 0) return b.posts.length - a.posts.length;
    const aScore = Math.max(
      ...a.posts.map((post) => industryScoreForPost(post, preferredIndustryKeys)),
      0
    );
    const bScore = Math.max(
      ...b.posts.map((post) => industryScoreForPost(post, preferredIndustryKeys)),
      0
    );
    return bScore - aScore || b.posts.length - a.posts.length;
  });

  const platformCounts = hotPosts.reduce(
    (acc, p) => {
      acc[p.platform] = (acc[p.platform] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          width: 3,
          height: 13,
          background: accent,
          borderRadius: 2,
          flexShrink: 0,
          opacity: 0.6,
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#8888a4",
          letterSpacing: "0.03em",
        }}
      >
        {children}
      </span>
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 28px 40px",
        display: "flex",
        gap: 20,
        minHeight: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>
            {"\u{1F525}"} BREAKOUT CLUSTERS THIS WEEK
          </SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 10,
            }}
          >
            {breakouts.map((c, i) => (
              <div
                key={c.id}
                onClick={() => onClusterOpen(c.id)}
                className="card-enter"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  background: "#141419",
                  border: `1px solid ${c.color}35`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: `inset 0 2px 0 ${c.color}45`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1c1c25";
                  e.currentTarget.style.borderColor = c.color + "60";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = `inset 0 2px 0 ${c.color}65, 0 6px 18px ${c.color}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#141419";
                  e.currentTarget.style.borderColor = c.color + "35";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `inset 0 2px 0 ${c.color}45`;
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#e4e4f2",
                      lineHeight: 1.3,
                      flex: 1,
                      paddingRight: 8,
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: c.color,
                      background: c.color + "1e",
                      padding: "2px 9px",
                      borderRadius: 20,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {c.growth}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#686882",
                    lineHeight: 1.6,
                    margin: "0 0 12px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.summary}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      height: 3,
                      flex: 1,
                      background: "#202030",
                      borderRadius: 2,
                      marginRight: 10,
                    }}
                  >
                    <div
                      style={{
                        width: `${c.trendScore}%`,
                        height: "100%",
                        background: c.color,
                        borderRadius: 2,
                        boxShadow: `0 0 6px ${c.color}50`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: "#606074", flexShrink: 0 }}>
                    {c.postCount.toLocaleString()} posts · {c.trendScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>TOP TRENDING POSTS RIGHT NOW</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {hotPosts.map((post, i) => (
              <div
                key={post.id}
                className="card-enter"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <PostCard
                  post={post}
                  isSelected={selectedPost?.id === post.id}
                  onClick={() =>
                    setSelectedPost(
                      selectedPost?.id === post.id ? null : post
                    )
                  }
                  onSave={openPicker}
                  saved={isPostSaved(post.id)}
                  accent={accent}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          width: 220,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            background: "#141419",
            border: "1px solid #202030",
            borderRadius: 12,
            padding: "16px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div style={{ width: 3, height: 11, background: accent, borderRadius: 2, opacity: 0.55 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#7a7a96", letterSpacing: "0.03em" }}>
              Explore Topics
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {exploreTopics.map(({ topic, posts: tposts }) => (
              <div
                key={topic.id}
                onClick={() => onTopicOpen(topic.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  color: "#9696b0",
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: 7,
                  border: "1px solid transparent",
                  lineHeight: 1.4,
                  transition: "all 0.13s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1c1c26";
                  e.currentTarget.style.borderColor = "#28283a";
                  e.currentTarget.style.color = "#eeeef4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.color = "#9696b0";
                }}
              >
                <span
                  style={{ color: accent, marginRight: 6, fontSize: 10 }}
                >
                  →
                </span>
                <span style={{ flex: 1 }}>{topic.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "#606074",
                    fontFamily: "Space Mono, monospace",
                    marginLeft: 6,
                  }}
                >
                  {tposts.length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#141419",
            border: "1px solid #202030",
            borderRadius: 12,
            padding: "16px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div style={{ width: 3, height: 11, background: accent, borderRadius: 2, opacity: 0.55 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#7a7a96", letterSpacing: "0.03em" }}>
              Platform Mix
            </span>
          </div>
          {[
            { id: "tiktok", label: "TikTok", color: "#69c9d0" },
            { id: "instagram", label: "Instagram", color: "#e1306c" },
            { id: "twitter", label: "X / Twitter", color: "#e7e9ea" },
          ].map(({ id, label, color }) => {
            const count = platformCounts[id] || 0;
            const pct = Math.round((count / hotPosts.length) * 100);
            return (
              <div key={id} style={{ marginBottom: 11 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#7c7c96" }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Space Mono, monospace",
                      color: "#606074",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "#202030",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 2,
                      boxShadow: `0 0 4px ${color}40`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {selectedPost && (
        <DetailPanel
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onSave={openPicker}
          saved={isPostSaved(selectedPost.id)}
          accent={accent}
        />
      )}
    </div>
  );
}

export function DiscoverView({
  posts,
  queryData,
  loading,
  accent,
  density,
  onClusterOpen,
  onTopicOpen,
  isPostSaved,
  openPicker,
  preferredIndustryKeys,
}: {
  posts: Post[];
  queryData: QueryData | null;
  loading: boolean;
  accent: string;
  density: string;
  onClusterOpen: (clusterId: string) => void;
  onTopicOpen: (topicId: string) => void;
  isPostSaved: (id: string) => boolean;
  openPicker: (postId: string, e: React.MouseEvent) => void;
  preferredIndustryKeys: string[];
}) {
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("trending");

  useEffect(() => {
    setActiveCluster(null);
    setSelectedPost(null);
  }, [queryData]);

  const allPosts = queryData?.posts || [];
  const clusters = queryData?.clusters || [];
  const total = queryData?.totalPosts || 0;

  const visiblePosts = allPosts
    .filter((p) => !activeCluster || p.clusterId === activeCluster)
    .filter((p) => platform === "all" || p.platform === platform)
    .sort((a, b) => {
      const preferenceDiff =
        industryScoreForPost(b, preferredIndustryKeys) -
        industryScoreForPost(a, preferredIndustryKeys);
      if (sort === "trending") return preferenceDiff || b.trendScore - a.trendScore;
      if (sort === "engagement") {
        return preferenceDiff || b.likes + b.shares - (a.likes + a.shares);
      }
      return preferenceDiff;
    });

  if (loading)
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 0,
          minHeight: 0,
          padding: "16px 28px",
        }}
      >
        <div
          style={{
            width: 260,
            flexShrink: 0,
            paddingRight: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[85, 70, 90, 65, 75].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 88, width: `${w}%` }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
            alignContent: "start",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: 360 }} />
          ))}
        </div>
      </div>
    );

  if (!queryData)
    return (
        <GeneralDiscovery
          posts={posts}
          onClusterOpen={onClusterOpen}
          onTopicOpen={onTopicOpen}
          accent={accent}
          preferredIndustryKeys={preferredIndustryKeys}
          isPostSaved={isPostSaved}
          openPicker={openPicker}
      />
    );

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      <div
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: "1px solid #191926",
          overflowY: "auto",
          padding: "14px 12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          <div style={{ width: 2, height: 10, background: accent, borderRadius: 2, opacity: 0.5 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "#6c6c88", letterSpacing: "0.04em" }}>
            CLUSTERS · {clusters.length}
          </span>
        </div>
        <div
          onClick={() => setActiveCluster(null)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 6,
            background: !activeCluster ? accent + "14" : "transparent",
            border: `1px solid ${!activeCluster ? accent + "35" : "transparent"}`,
            fontSize: 12,
            color: !activeCluster ? "#eeeef4" : "#626278",
            transition: "all 0.14s",
          }}
        >
          All clusters
        </div>
        {clusters.map((c) => (
          <ClusterPill
            key={c.id}
            cluster={c}
            isActive={activeCluster === c.id}
            onClick={() =>
              setActiveCluster(activeCluster === c.id ? null : c.id)
            }
          />
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          padding: "0 20px",
        }}
      >
        <FilterBar
          platform={platform}
          setPlatform={setPlatform}
          sort={sort}
          setSort={setSort}
          total={total}
          accent={accent}
        />
        {visiblePosts.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "#505070",
            }}
          >
            No posts match these filters
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingBottom: 28,
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${
                density === "compact"
                  ? 180
                  : density === "spacious"
                    ? 280
                    : 220
              }px, 1fr))`,
              gap:
                density === "compact"
                  ? 10
                  : density === "spacious"
                    ? 18
                    : 14,
              alignContent: "start",
            }}
          >
            {visiblePosts.map((post, i) => (
              <div
                key={post.id}
                className="card-enter"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <PostCard
                  post={post}
                  isSelected={selectedPost?.id === post.id}
                  onClick={() =>
                    setSelectedPost(
                      selectedPost?.id === post.id ? null : post
                    )
                  }
                  onSave={openPicker}
                  saved={isPostSaved(post.id)}
                  accent={accent}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <DetailPanel
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onSave={openPicker}
          saved={isPostSaved(selectedPost.id)}
          accent={accent}
        />
      )}
    </div>
  );
}
