"use client";

import { useState } from "react";
import { Cluster } from "@/lib/types";

export function ClusterPill({
  cluster,
  isActive,
  onClick,
}: {
  cluster: Cluster;
  isActive: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        cursor: "pointer",
        background: isActive ? "#1c1c2e" : hov ? "#141420" : "transparent",
        border: `1px solid ${isActive ? cluster.color + "50" : hov ? "#202030" : "#1a1a26"}`,
        transition: "all 0.15s ease",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isActive ? "#e8e8f0" : "#a0a0c0",
            lineHeight: 1.3,
          }}
        >
          {cluster.name}
        </span>
        <span
          style={{
            fontSize: 10,
            color: cluster.color,
            background: cluster.color + "18",
            padding: "2px 7px",
            borderRadius: 20,
            fontWeight: 500,
            flexShrink: 0,
            marginLeft: 6,
          }}
        >
          {cluster.tag}
        </span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 10, color: "#505070" }}>VOLUME</span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "Space Mono, monospace",
              color: "#707090",
            }}
          >
            {cluster.postCount.toLocaleString()}
          </span>
        </div>
        <div
          style={{ height: 3, background: "#1a1a28", borderRadius: 2 }}
        >
          <div
            style={{
              width: `${cluster.trendScore}%`,
              height: "100%",
              background: cluster.color,
              borderRadius: 2,
              boxShadow: `0 0 8px ${cluster.color}50`,
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span
          style={{
            fontSize: 11,
            color: cluster.color,
            fontFamily: "Space Mono, monospace",
            fontWeight: 600,
          }}
        >
          {cluster.growth}
        </span>
        <span style={{ fontSize: 10, color: "#404060" }}>week over week</span>
      </div>
    </div>
  );
}
