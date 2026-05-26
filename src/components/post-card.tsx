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
        background: isSelected ? "#22222e" : hovered ? "#1c1c25" : "#141419",
        border: `1px solid ${isSelected ? accent + "55" : hovered ? "#303046" : "#242436"}`,
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: isSelected
          ? `0 0 0 1px ${accent}30, 0 6px 24px ${accent}18, inset 0 2px 0 ${pm.color}80`
          : hovered
          ? `inset 0 2px 0 ${pm.color}65`
          : `inset 0 2px 0 ${pm.color}40`,
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
                color: "#eeeef4",
                lineHeight: 1.2,
              }}
            >
              {post.displayName}
            </div>
            <div style={{ fontSize: 11, color: "#636380" }}>{post.handle}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, color: "#424258" }}>
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
              color: saved ? accent : "#464662",
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
          color: "#9696b0",
          lineHeight: 1.6,
          margin: "0 0 11px",
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
              background: accent + "14",
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
            marginBottom: 6,
          }}
        >
          <span
            style={{ fontSize: 10, color: "#525268", letterSpacing: "0.05em" }}
          >
            Trend score
          </span>
        </div>
        <TrendBar score={post.trendScore} color={accent} />
      </div>

      {/* Engagement */}
      <div
        style={{
          display: "flex",
          gap: 12,
          borderTop: "1px solid #202030",
          paddingTop: 11,
        }}
      >
        {[
          { label: "♥", val: post.likes },
          { label: "↗", val: post.shares },
          { label: "✦", val: post.comments },
          ...(post.views ? [{ label: "◉", val: post.views }] : []),
        ].map(({ label, val }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span style={{ fontSize: 10, color: "#424258" }}>{label}</span>
            <span
              style={{
                fontSize: 11,
                color: "#7c7c9a",
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
