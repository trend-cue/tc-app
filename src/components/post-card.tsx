"use client";

import { useState } from "react";
import { Post, PLATFORM_META, formatNumber } from "@/lib/types";
import { PlatformIcon, IconBookmark } from "./icons";
import { TrendBar, Thumb } from "./trend-bar";

export function PostCard({
  post,
  isSelected,
  onClick,
  onSave,
  saved,
  accent,
}: {
  post: Post;
  isSelected: boolean;
  onClick: () => void;
  onSave: (postId: string, e: React.MouseEvent) => void;
  saved: boolean;
  accent: string;
}) {
  const [hovered, setHovered] = useState(false);
  const pm = PLATFORM_META[post.platform] || PLATFORM_META.twitter;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected ? "#1c1c2e" : hovered ? "#161624" : "#111119",
        border: `1px solid ${isSelected ? accent + "60" : hovered ? "#2a2a3e" : "#1e1e2e"}`,
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: isSelected
          ? `0 0 0 1px ${accent}40, 0 4px 20px ${accent}15`
          : "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: pm.color + "20",
              border: `1px solid ${pm.color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: pm.color,
              flexShrink: 0,
            }}
          >
            <PlatformIcon platform={post.platform} />
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#e8e8f0",
                lineHeight: 1.2,
              }}
            >
              {post.displayName}
            </div>
            <div style={{ fontSize: 11, color: "#606080" }}>{post.handle}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#404060" }}>
            {post.postedAt}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(post.id, e);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: saved ? accent : "#404060",
              padding: 2,
              display: "flex",
              transition: "color 0.15s",
            }}
          >
            <IconBookmark filled={saved} />
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div style={{ marginBottom: 12 }}>
        <Thumb data={post.thumbnail} isVideo={post.isVideo} />
      </div>

      {/* Content */}
      <p
        style={{
          fontSize: 12,
          color: "#a0a0c0",
          lineHeight: 1.55,
          margin: "0 0 12px",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {post.content}
      </p>

      {/* Hashtags */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginBottom: 12,
        }}
      >
        {Array.from(new Set(post.hashtags)).map((t) => (
          <span
            key={t}
            style={{
              fontSize: 10,
              color: accent,
              background: accent + "15",
              padding: "2px 7px",
              borderRadius: 4,
              fontFamily: "Space Mono, monospace",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Trend score */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <span
            style={{ fontSize: 10, color: "#505070", letterSpacing: "0.06em" }}
          >
            TREND SCORE
          </span>
        </div>
        <TrendBar score={post.trendScore} color={accent} />
      </div>

      {/* Engagement */}
      <div
        style={{
          display: "flex",
          gap: 12,
          borderTop: "1px solid #1a1a28",
          paddingTop: 11,
        }}
      >
        {[
          { label: "\u2665", val: post.likes },
          { label: "\u2197", val: post.shares },
          { label: "\u2726", val: post.comments },
          ...(post.views ? [{ label: "\u25C9", val: post.views }] : []),
        ].map(({ label, val }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span style={{ fontSize: 10, color: "#404060" }}>{label}</span>
            <span
              style={{
                fontSize: 11,
                color: "#8080a8",
                fontFamily: "Space Mono, monospace",
              }}
            >
              {formatNumber(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
