"use client";

import { useState } from "react";
import { IconSearch } from "./icons";

export function SearchBar({
  query,
  setQuery,
  onSearch,
  loading,
  accent,
  suggestions,
}: {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (q: string) => void;
  loading: boolean;
  accent: string;
  suggestions: string[];
}) {
  const [focused, setFocused] = useState(false);
  const [showSugg, setShowSugg] = useState(false);

  const filtered = query
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(query.toLowerCase()) && s !== query
      )
    : suggestions;

  const doSearch = (q: string) => {
    setQuery(q);
    setShowSugg(false);
    onSearch(q);
  };

  return (
    <div
      style={{
        padding: "20px 28px 0",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#141419",
          border: `1px solid ${focused ? accent + "60" : "#28283a"}`,
          borderRadius: 12,
          padding: "0 16px",
          height: 50,
          boxShadow: focused ? `0 0 0 3px ${accent}14, 0 4px 20px ${accent}08` : "none",
          transition: "all 0.18s",
        }}
      >
        <span
          style={{
            color: focused ? accent : "#4a4a64",
            display: "flex",
            flexShrink: 0,
            transition: "color 0.18s",
          }}
        >
          <IconSearch />
        </span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSugg(true);
          }}
          onFocus={() => {
            setFocused(true);
            setShowSugg(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowSugg(false), 160);
          }}
          onKeyDown={(e) =>
            e.key === "Enter" && query.trim() && doSearch(query)
          }
          placeholder='Describe what you&apos;re looking for... e.g. "volleyball plays"'
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "#eeeef4",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        />
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: accent,
                    animation: `pulse3 0.9s ease ${i * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color: "#606080" }}>
              Analyzing...
            </span>
          </div>
        )}
        {!loading && query && (
          <button
            onClick={() => doSearch(query)}
            style={{
              padding: "6px 16px",
              background: accent,
              border: "none",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              flexShrink: 0,
              boxShadow: `0 0 14px ${accent}40`,
            }}
          >
            Search
          </button>
        )}
      </div>
      {showSugg && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 28,
            right: 28,
            background: "#141419",
            border: "1px solid #28283a",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 100,
            boxShadow: "0 16px 48px #00000099",
          }}
        >
          {filtered.slice(0, 5).map((s, i) => (
            <div
              key={i}
              onMouseDown={() => doSearch(s)}
              style={{
                padding: "11px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom:
                  i < Math.min(filtered.length, 5) - 1
                    ? "1px solid #191926"
                    : "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1c1c26")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span style={{ color: "#4e4e68", display: "flex" }}>
                <IconSearch />
              </span>
              <span style={{ fontSize: 13, color: "#9696b0" }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
