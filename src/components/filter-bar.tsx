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
        padding: "12px 0 10px",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", gap: 4 }}>
        {[
          { id: "all", label: "All" },
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
                padding: "4px 12px",
                borderRadius: 20,
                border: `1px solid ${active ? colors[id] + "55" : "#242436"}`,
                background: active ? colors[id] + "14" : "transparent",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? colors[id] : "#5e5e78",
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
              color: "#484862",
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
            background: "#141419",
            border: "1px solid #28283a",
            borderRadius: 7,
            padding: "5px 10px",
            fontSize: 11,
            color: "#7878a0",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            outline: "none",
          }}
        >
          <option value="trending">Trending</option>
          <option value="recent">Recent</option>
          <option value="engagement">Engagement</option>
        </select>
      </div>
    </div>
  );
}
