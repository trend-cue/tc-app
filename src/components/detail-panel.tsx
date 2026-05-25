"use client";

import { useEffect } from "react";
import { Post, PLATFORM_META, formatNumber } from "@/lib/types";
import { PlatformIcon, IconSparkle, IconClose, IconBookmark } from "./icons";
import { Thumb } from "./trend-bar";

function tiktokVideoId(post: Post): string | null {
  if (post.externalId) return post.externalId;
  if (post.id.startsWith("tiktok:")) return post.id.slice("tiktok:".length);
  return post.sourceUrl?.match(/\/video\/(\d+)/)?.[1] ?? null;
}

function tiktokPlayerUrl(post: Post): string | null {
  if (post.embedUrl) return post.embedUrl;
  const videoId = tiktokVideoId(post);
  if (!videoId) return null;
  const url = new URL(`https://www.tiktok.com/player/v1/${videoId}`);
  url.searchParams.set("controls", "1");
  url.searchParams.set("description", "0");
  url.searchParams.set("music_info", "0");
  return url.toString();
}

function TikTokPlayer({ post }: { post: Post }) {
  const src = tiktokPlayerUrl(post);
  if (!src) return <Thumb data={post.thumbnail} isVideo={post.isVideo} />;

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "9/16",
        borderRadius: 8,
        overflow: "hidden",
        background: "#000",
      }}
    >
      <iframe
        src={src}
        title={post.thumbnail.label}
        loading="lazy"
        allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}

export function DetailPanel({
  post,
  onClose,
  onSave,
  saved,
  accent,
}: {
  post: Post;
  onClose: () => void;
  onSave: (postId: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  saved: boolean;
  accent: string;
}) {
  const pm = PLATFORM_META[post.platform] || PLATFORM_META.twitter;
  const w = post.whyTrending;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4, 4, 8, 0.78)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 880,
          maxHeight: "90vh",
          background: "#0d0d16",
          border: "1px solid #1f1f30",
          borderRadius: 16,
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #1a1a28",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: accent, display: "flex" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={(e) => onSave(post.id, e)}
              aria-pressed={saved}
              title={saved ? "Manage saved projects" : "Save to project"}
              style={{
                height: 30,
                padding: "0 12px",
                background: saved ? accent : accent + "18",
                border: `1px solid ${saved ? accent : accent + "40"}`,
                cursor: "pointer",
                color: saved ? "#07070c" : accent,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Space Grotesk, sans-serif",
                transition: "all 0.15s",
                boxShadow: saved ? `0 0 16px ${accent}30` : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 18px ${accent}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = saved
                  ? `0 0 16px ${accent}30`
                  : "none";
              }}
            >
              <IconBookmark filled={saved} />
              <span>{saved ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Dismiss"
              style={{
                background: "#161624",
                border: "1px solid #252535",
                cursor: "pointer",
                color: "#a0a0c0",
                borderRadius: 8,
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e1e2e";
                e.currentTarget.style.color = "#e0e0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#161624";
                e.currentTarget.style.color = "#a0a0c0";
              }}
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* Body: video left, details right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, 360px) 1fr",
            gap: 0,
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Video / thumbnail front-and-center */}
          <div
            style={{
              padding: 22,
              background: "#08080d",
              borderRight: "1px solid #1a1a28",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
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
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#e0e0f0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {post.displayName}
                </div>
                <div style={{ fontSize: 11, color: "#606080" }}>
                  {post.handle} · {post.postedAt}
                </div>
              </div>
            </div>
            {post.platform === "tiktok" && post.isVideo ? (
              <TikTokPlayer post={post} />
            ) : (
              <Thumb data={post.thumbnail} isVideo={post.isVideo} />
            )}
          </div>

          {/* Details */}
          <div
            style={{
              padding: 22,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                background: accent + "0d",
                border: `1px solid ${accent}25`,
                borderRadius: 10,
                padding: "13px 14px",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", gap: 7 }}>
                <span style={{ color: accent, flexShrink: 0, marginTop: 1 }}>
                  <IconSparkle />
                </span>
                <p
                  style={{
                    fontSize: 13,
                    color: "#c8c8e8",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {w.summary}
                </p>
              </div>
            </div>

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
                      style={{
                        fontSize: 12,
                        color: "#a0a0c0",
                        marginBottom: 2,
                      }}
                    >
                      {s.label}
                    </div>
                    <div style={{ fontSize: 10, color: "#505070" }}>
                      {s.note}
                    </div>
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
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {w.relatedHashtags.map(({ tag, growth }) => (
                  <div
                    key={tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
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
                  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: 8,
                }}
              >
                {[
                  { label: "Likes", val: post.likes, icon: "♥" },
                  { label: "Shares", val: post.shares, icon: "↗" },
                  { label: "Comments", val: post.comments, icon: "✦" },
                  ...(post.views
                    ? [{ label: "Views", val: post.views, icon: "◉" }]
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
                      style={{
                        fontSize: 10,
                        color: "#505070",
                        marginBottom: 4,
                      }}
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
      </div>
    </div>
  );
}
