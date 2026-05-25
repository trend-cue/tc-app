"use client";

import { INDUSTRIES } from "@/lib/industries";

export function IndustryPreferences({
  value,
  onChange,
  accent,
}: {
  value: string[];
  onChange: (keys: string[]) => void;
  accent: string;
}) {
  const toggle = (key: string) => {
    onChange(
      value.includes(key)
        ? value.filter((current) => current !== key)
        : [...value, key]
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 10,
      }}
    >
      {INDUSTRIES.map((industry) => {
        const selected = value.includes(industry.key);
        return (
          <button
            key={industry.key}
            type="button"
            onClick={() => toggle(industry.key)}
            style={{
              textAlign: "left",
              background: selected ? `${industry.color}18` : "#10101a",
              border: `1px solid ${selected ? industry.color : "#1c1c2d"}`,
              borderRadius: 8,
              padding: "12px 13px",
              cursor: "pointer",
              minHeight: 104,
              fontFamily: "Space Grotesk, sans-serif",
              transition: "border 0.14s, background 0.14s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected ? "#f4f4ff" : "#c7c7dc",
                  lineHeight: 1.25,
                }}
              >
                {industry.label}
              </span>
              <span
                aria-hidden
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 5,
                  border: `1px solid ${selected ? industry.color : "#34344a"}`,
                  background: selected ? accent : "transparent",
                  flexShrink: 0,
                }}
              />
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#686884",
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              {industry.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
