"use client";

import { MOCK_TIERS } from "@/lib/billing";
import { SubscriptionTierKey } from "@/lib/types";

export function TierPicker({
  value,
  onChange,
  accent,
}: {
  value: SubscriptionTierKey;
  onChange: (tier: SubscriptionTierKey) => void;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
        gap: 10,
      }}
    >
      {MOCK_TIERS.map((tier) => {
        const selected = tier.key === value;
        return (
          <button
            key={tier.key}
            type="button"
            onClick={() => onChange(tier.key)}
            style={{
              textAlign: "left",
              background: selected ? `${accent}16` : "#10101a",
              border: `1px solid ${selected ? accent : "#1c1c2d"}`,
              borderRadius: 8,
              padding: "13px 14px",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ color: "#e8e8f0", fontSize: 14, fontWeight: 800 }}>
                {tier.name}
              </span>
              <span style={{ color: selected ? accent : "#a0a0c0", fontSize: 13 }}>
                {tier.price}
              </span>
            </div>
            <p style={{ color: "#64647e", fontSize: 11, lineHeight: 1.5, margin: 0 }}>
              {tier.description}
            </p>
            <div style={{ color: "#46465f", fontSize: 10, marginTop: 9 }}>
              {tier.cadence}
            </div>
          </button>
        );
      })}
    </div>
  );
}
