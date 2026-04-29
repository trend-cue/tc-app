"use client";

export function FilterBar({
  platform,
  setPlatform,
  sort,
  setSort,
  total,
  accent,
}: {
  platform: string;
  setPlatform: (p: string) => void;
  sort: string;
  setSort: (s: string) => void;
  total: number;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0 10px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", gap: 4 }}>
        {[
          { id: "all", label: "All Platforms" },
          { id: "tiktok", label: "TikTok" },
          { id: "instagram", label: "Instagram" },
          { id: "twitter", label: "X" },
        ].map(({ id, label }) => {
          const colors: Record<string, string> = {
            all: accent,
            tiktok: "#69c9d0",
            instagram: "#e1306c",
            twitter: "#e7e9ea",
          };
          const active = platform === id;
          return (
            <button
              key={id}
              onClick={() => setPlatform(id)}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: `1px solid ${active ? colors[id] + "50" : "#1e1e2e"}`,
                background: active ? colors[id] + "15" : "transparent",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? colors[id] : "#606080",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {total > 0 && (
          <span
            style={{
              fontSize: 11,
              color: "#404060",
              fontFamily: "Space Mono, monospace",
            }}
          >
            {total.toLocaleString()} posts
          </span>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            background: "#0f0f1a",
            border: "1px solid #1e1e2e",
            borderRadius: 7,
            padding: "5px 10px",
            fontSize: 11,
            color: "#8080a8",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            outline: "none",
          }}
        >
          <option value="trending">Sort: Trending</option>
          <option value="recent">Sort: Recent</option>
          <option value="engagement">Sort: Engagement</option>
        </select>
      </div>
    </div>
  );
}
