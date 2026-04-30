"use client";

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
          background: "#1e1e30",
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
}: {
  data: { label: string; accent: string; url?: string };
  isVideo: boolean;
}) {
  const hasImage = !!data.url;
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: isVideo ? "9/16" : "4/5",
        background: hasImage
          ? `#000 center/cover no-repeat url(${JSON.stringify(data.url)})`
          : "repeating-linear-gradient(45deg, #13131c 0px, #13131c 4px, #1a1a28 4px, #1a1a28 12px)",
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
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: data.accent + (hasImage ? "60" : "30"),
          border: `1px solid ${data.accent}${hasImage ? "" : "50"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: hasImage ? "blur(4px)" : undefined,
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
          }}
        >
          {data.label}
        </span>
      )}
    </div>
  );
}
