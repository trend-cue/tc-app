"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

export function TrendBar({
  score,
  color = "oklch(0.68 0.22 285)",
}: {
  score: number;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 3,
          background: "#222234",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            boxShadow: `0 0 6px ${color}60`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          color,
          fontFamily: "Space Mono, monospace",
          minWidth: 28,
          textAlign: "right",
        }}
      >
        {score}
      </span>
    </div>
  );
}

export function Thumb({
  data,
  isVideo,
  onPlay,
}: {
  data: { label: string; accent: string; url?: string };
  isVideo: boolean;
  onPlay?: (e: React.MouseEvent) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [playHovered, setPlayHovered] = useState(false);
  const hasImage = !!data.url && !failed;

  useEffect(() => {
    setFailed(false);
  }, [data.url]);

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "4/5",
        background: hasImage
          ? "#000"
          : "repeating-linear-gradient(45deg, #16161e 0px, #16161e 4px, #202030 4px, #202030 12px)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hasImage && (
        <img
          src={data.url}
          alt={data.label}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.2s ease",
            transform: playHovered && onPlay ? "scale(1.04)" : "scale(1)",
          }}
        />
      )}
      <div
        onClick={onPlay}
        onMouseEnter={() => onPlay && setPlayHovered(true)}
        onMouseLeave={() => setPlayHovered(false)}
        style={{
          width: playHovered && onPlay ? 38 : 32,
          height: playHovered && onPlay ? 38 : 32,
          borderRadius: "50%",
          background: playHovered && onPlay
            ? data.accent + "dd"
            : data.accent + (hasImage ? "60" : "30"),
          border: `1px solid ${data.accent}${hasImage ? (playHovered && onPlay ? "" : "90") : "50"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: hasImage ? "blur(4px)" : undefined,
          position: "relative",
          zIndex: 1,
          cursor: onPlay ? "pointer" : "default",
          transition: "all 0.15s ease",
          boxShadow: playHovered && onPlay ? `0 0 20px ${data.accent}60` : "none",
        }}
      >
        {isVideo && (
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: `10px solid ${hasImage ? "#fff" : data.accent}`,
              marginLeft: 2,
            }}
          />
        )}
        {!isVideo && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: (hasImage ? "#fff" : data.accent) + "c0",
            }}
          />
        )}
      </div>
      {!hasImage && (
        <span
          style={{
            fontSize: 9,
            color: "#ffffff30",
            fontFamily: "Space Mono, monospace",
            textAlign: "center",
            padding: "0 12px",
            lineHeight: 1.4,
            position: "relative",
            zIndex: 1,
          }}
        >
          {data.label}
        </span>
      )}
    </div>
  );
}
