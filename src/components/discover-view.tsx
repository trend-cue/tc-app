"use client";

import { useState, useEffect } from "react";
import { QueryData, Post } from "@/lib/types";
import { derivedClusters } from "@/lib/posts-db";
import { topicsWithMatches } from "@/lib/explore-topics";
import { PostCard } from "./post-card";
import { ClusterPill } from "./cluster-pill";
import { DetailPanel } from "./detail-panel";
import { FilterBar } from "./filter-bar";

function GeneralDiscovery({
  posts,
  onClusterOpen,
  onTopicOpen,
  accent,
  isPostSaved,
  openPicker,
}: {
  posts: Post[];
  onClusterOpen: (clusterId: string) => void;
  onTopicOpen: (topicId: string) => void;
  accent: string;
  isPostSaved: (id: string) => boolean;
  openPicker: (postId: string, e: React.MouseEvent) => void;
}) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const allClusters = derivedClusters(posts);
  const breakouts = allClusters
    .filter((c) => c.tag.includes("Breakout"))
    .slice(0, 6);
  const hotPosts = [...posts]
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 6);

  const exploreTopics = topicsWithMatches(posts);

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
        fontSize: 10,
        fontWeight: 700,
        color: "#404060",
        letterSpacing: "0.1em",
        marginBottom: 14,
      }}
    >
      {children}
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
                  background: "#0f0f1a",
                  border: `1px solid ${c.color}25`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#141422";
                  e.currentTarget.style.borderColor = c.color + "50";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#0f0f1a";
                  e.currentTarget.style.borderColor = c.color + "25";
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
                      color: "#d0d0e8",
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
                      background: c.color + "18",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {c.growth}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#606080",
                    lineHeight: 1.55,
                    margin: "0 0 10px",
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
                      background: "#1a1a28",
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
                  <span style={{ fontSize: 10, color: "#505070", flexShrink: 0 }}>
                    {c.postCount.toLocaleString()} posts · score {c.trendScore}
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
            background: "#0f0f1a",
            border: "1px solid #1a1a28",
            borderRadius: 12,
            padding: "16px 14px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#404060",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            EXPLORE TOPICS
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
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
                  color: "#a0a0c0",
                  cursor: "pointer",
                  padding: "9px 10px",
                  borderRadius: 7,
                  border: "1px solid transparent",
                  lineHeight: 1.4,
                  transition: "all 0.13s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#161624";
                  e.currentTarget.style.borderColor = "#1e1e30";
                  e.currentTarget.style.color = "#e0e0f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.color = "#a0a0c0";
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
                    color: "#505070",
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
            background: "#0f0f1a",
            border: "1px solid #1a1a28",
            borderRadius: 12,
            padding: "16px 14px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#404060",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            PLATFORM MIX
          </div>
          {[
            { id: "tiktok", label: "TikTok", color: "#69c9d0" },
            { id: "instagram", label: "Instagram", color: "#e1306c" },
            { id: "twitter", label: "X / Twitter", color: "#e7e9ea" },
          ].map(({ id, label, color }) => {
            const count = platformCounts[id] || 0;
            const pct = Math.round((count / hotPosts.length) * 100);
            return (
              <div key={id} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#808090" }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "Space Mono, monospace",
                      color: "#606070",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "#1a1a28",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 2,
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
    .sort((a, b) =>
      sort === "trending"
        ? b.trendScore - a.trendScore
        : sort === "engagement"
          ? b.likes + b.shares - (a.likes + a.shares)
          : 0
    );

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
          borderRight: "1px solid #131320",
          overflowY: "auto",
          padding: "14px 12px",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#404060",
            letterSpacing: "0.08em",
            marginBottom: 8,
            paddingLeft: 4,
          }}
        >
          TOPIC CLUSTERS · {clusters.length}
        </div>
        <div
          onClick={() => setActiveCluster(null)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            marginBottom: 6,
            background: !activeCluster ? "#161624" : "transparent",
            border: `1px solid ${!activeCluster ? accent + "35" : "transparent"}`,
            fontSize: 12,
            color: !activeCluster ? "#e0e0f0" : "#606080",
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
          accent={accent}
        />
      )}
    </div>
  );
}
