"use client";

import { Post, PLATFORM_META, formatNumber } from "@/lib/types";
import { PlatformIcon, IconSparkle, IconClose } from "./icons";
import { Thumb } from "./trend-bar";

export function DetailPanel({
  post,
  onClose,
  accent,
}: {
  post: Post;
  onClose: () => void;
  accent: string;
}) {
  const pm = PLATFORM_META[post.platform] || PLATFORM_META.twitter;
  const w = post.whyTrending;

  return (
    <div
      style={{
        width: 340,
        flexShrink: 0,
        background: "#0d0d16",
        borderLeft: "1px solid #1a1a28",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #1a1a28",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: "#0d0d16",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: accent }}>
            <IconSparkle />
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#e8e8f0",
              letterSpacing: "0.08em",
            }}
          >
            WHY TRENDING
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#606080",
            display: "flex",
          }}
        >
          <IconClose />
        </button>
      </div>

      <div style={{ padding: 18, overflowY: "auto" }}>
        {/* Post identity */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: pm.color + "20",
              border: `1px solid ${pm.color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: pm.color,
            }}
          >
            <PlatformIcon platform={post.platform} />
          </div>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0" }}
            >
              {post.displayName}
            </div>
            <div style={{ fontSize: 11, color: "#606080" }}>
              {post.handle} · {post.postedAt}
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div style={{ marginBottom: 16 }}>
          <Thumb data={post.thumbnail} isVideo={post.isVideo} />
        </div>

        {/* Summary */}
        <div
          style={{
            background: accent + "0d",
            border: `1px solid ${accent}25`,
            borderRadius: 10,
            padding: "13px 14px",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
            <span
              style={{ color: accent, flexShrink: 0, marginTop: 1 }}
            >
              <IconSparkle />
            </span>
            <p
              style={{
                fontSize: 12,
                color: "#c0c0e0",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {w.summary}
            </p>
          </div>
        </div>

        {/* Signals */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 10,
              color: "#505070",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            TREND SIGNALS
          </div>
          {w.signals.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "9px 0",
                borderBottom: "1px solid #161622",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 12, color: "#a0a0c0", marginBottom: 2 }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 10, color: "#505070" }}>{s.note}</div>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: accent,
                  fontFamily: "Space Mono, monospace",
                  flexShrink: 0,
                  marginLeft: 10,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Related hashtags */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 10,
              color: "#505070",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            RELATED HASHTAGS
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {w.relatedHashtags.map(({ tag, growth }) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 10px",
                  background: "#111119",
                  borderRadius: 7,
                  border: "1px solid #1a1a28",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: accent,
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {tag}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: growth.startsWith("+")
                      ? "oklch(0.72 0.18 145)"
                      : "oklch(0.65 0.18 20)",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {growth}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement breakdown */}
        <div>
          <div
            style={{
              fontSize: 10,
              color: "#505070",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            ENGAGEMENT
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {[
              { label: "Likes", val: post.likes, icon: "\u2665" },
              { label: "Shares", val: post.shares, icon: "\u2197" },
              { label: "Comments", val: post.comments, icon: "\u2726" },
              ...(post.views
                ? [{ label: "Views", val: post.views, icon: "\u25C9" }]
                : []),
            ].map(({ label, val, icon }) => (
              <div
                key={label}
                style={{
                  background: "#111119",
                  border: "1px solid #1a1a28",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#505070", marginBottom: 4 }}
                >
                  {icon} {label}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#d0d0e8",
                    fontFamily: "Space Mono, monospace",
                  }}
                >
                  {formatNumber(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
