"use client";

import { useState, useEffect, useRef } from "react";
import { Project, PROJECT_COLORS } from "@/lib/types";
import { IconPlus, IconCheck } from "./icons";

export function ProjectPicker({
  postId,
  x,
  y,
  projects,
  onToggle,
  onCreate,
  onClose,
  accent,
}: {
  postId: string;
  x: number;
  y: number;
  projects: Project[];
  onToggle: (projectId: string, postId: string) => void;
  onCreate: (name: string, color: string) => string;
  onClose: () => void;
  accent: string;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const left = Math.min(x, window.innerWidth - 240);
  const top = Math.min(y + 8, window.innerHeight - 320);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = onCreate(newName.trim(), newColor);
    onToggle(id, postId);
    setCreating(false);
    setNewName("");
  };

  const sortedProjects = [...projects].sort(
    (a, b) =>
      new Date(b.updated_at || b.created_at).getTime() -
      new Date(a.updated_at || a.created_at).getTime()
  );

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 9999,
        background: "#111119",
        border: "1px solid #252535",
        borderRadius: 12,
        width: 230,
        boxShadow: "0 20px 60px #00000090",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 14px 8px",
          borderBottom: "1px solid #1a1a28",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#e8e8f0",
            letterSpacing: "0.07em",
          }}
        >
          SAVE TO PROJECT
        </div>
      </div>
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {sortedProjects.length === 0 && (
          <div
            style={{
              padding: 14,
              fontSize: 12,
              color: "#505070",
              textAlign: "center",
            }}
          >
            No projects yet
          </div>
        )}
        {sortedProjects.map((proj) => {
          const saved = proj.postIds.includes(postId);
          return (
            <div
              key={proj.id}
              onClick={() => onToggle(proj.id, postId)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 14px",
                cursor: "pointer",
                transition: "background 0.12s",
                borderBottom: "1px solid #161622",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#181828")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: proj.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: saved ? "#e8e8f0" : "#a0a0c0",
                }}
              >
                {proj.name}
              </span>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  background: saved ? accent : "transparent",
                  border: `1.5px solid ${saved ? accent : "#353550"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  transition: "all 0.14s",
                }}
              >
                {saved && <IconCheck />}
              </div>
            </div>
          );
        })}
      </div>
      {/* New project */}
      <div
        style={{
          padding: "8px 14px 12px",
          borderTop: "1px solid #1a1a28",
        }}
      >
        {!creating ? (
          <div
            onClick={() => setCreating(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 12,
              color: accent,
              padding: "6px 0",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <IconPlus />
            <span>New project</span>
          </div>
        ) : (
          <div>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setCreating(false);
              }}
              placeholder="Project name..."
              style={{
                width: "100%",
                background: "#0f0f1a",
                border: `1px solid ${accent}40`,
                borderRadius: 7,
                padding: "7px 10px",
                fontSize: 12,
                color: "#e8e8f0",
                outline: "none",
                fontFamily: "Space Grotesk, sans-serif",
                marginBottom: 8,
              }}
            />
            <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
              {PROJECT_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setNewColor(c)}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: c,
                    cursor: "pointer",
                    outline:
                      newColor === c
                        ? "2px solid #fff"
                        : "2px solid transparent",
                    outlineOffset: 1,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleCreate}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: accent,
                  border: "none",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Create
              </button>
              <button
                onClick={() => setCreating(false)}
                style={{
                  padding: "6px 10px",
                  background: "#1a1a28",
                  border: "none",
                  borderRadius: 7,
                  fontSize: 11,
                  color: "#808090",
                  cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
