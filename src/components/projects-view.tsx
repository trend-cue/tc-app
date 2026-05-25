"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Post, Project, PROJECT_COLORS } from "@/lib/types";
import { IconPlus, IconBack, IconTrash, IconPencil } from "./icons";
import { PostCard } from "./post-card";

function ProjectPreviewTile({
  post,
  showEmptyMark,
}: {
  post?: Post;
  showEmptyMark: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageUrl = post?.thumbnail.url;
  const hasImage = !!imageUrl && !failed;
  const accent = post?.thumbnail.accent || "#252535";

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <div
      style={{
        background: hasImage
          ? "#050508"
          : post
            ? `linear-gradient(135deg, ${accent}24, #111119 58%), repeating-linear-gradient(45deg, #13131c 0px, #13131c 3px, #1a1a28 3px, #1a1a28 9px)`
            : "#0d0d16",
        border: post ? `1px solid ${accent}24` : "1px solid transparent",
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {hasImage && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      {post && hasImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5,5,8,0.04), rgba(5,5,8,0.32))",
          }}
        />
      )}
      {post?.isVideo && (
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: hasImage ? "rgba(0,0,0,0.42)" : accent + "30",
            border: `1px solid ${hasImage ? "rgba(255,255,255,0.34)" : accent + "55"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
            backdropFilter: hasImage ? "blur(4px)" : undefined,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderLeft: `7px solid ${hasImage ? "#fff" : accent}`,
              marginLeft: 2,
            }}
          />
        </div>
      )}
      {post && !post.isVideo && !hasImage && (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: accent + "70",
            position: "relative",
            zIndex: 1,
          }}
        />
      )}
      {!post && showEmptyMark && (
        <span style={{ fontSize: 18, opacity: 0.08 }}>&#x25C8;</span>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  allPosts,
  onClick,
  onDelete,
}: {
  project: Project;
  allPosts: Post[];
  onClick: () => void;
  onDelete: (id: string) => void;
  accent: string;
}) {
  const [hov, setHov] = useState(false);
  const posts = project.postIds
    .map((id) => allPosts.find((p) => p.id === id))
    .filter(Boolean) as Post[];
  const preview = posts.slice(0, 4);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#141420" : "#0f0f1a",
        border: `1px solid ${hov ? "#252535" : "#1a1a28"}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      <div
        style={{
          height: 4,
          background: project.color,
          boxShadow: `0 0 12px ${project.color}50`,
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gridTemplateRows: "repeat(2, minmax(0, 1fr))",
          gap: 2,
          padding: "12px 12px 0",
          aspectRatio: "1 / 1",
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <ProjectPreviewTile
            key={i}
            post={preview[i]}
            showEmptyMark={i === 0 && posts.length === 0}
          />
        ))}
      </div>
      <div style={{ padding: "10px 14px 14px" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#e0e0f0",
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {project.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11, color: "#505070" }}>
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 10, color: "#404060" }}>
            {new Date(
              project.updated_at || project.created_at
            ).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>
      {hov && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#1a1a28",
            border: "1px solid #252535",
            borderRadius: 6,
            padding: "4px 6px",
            cursor: "pointer",
            color: "#606080",
            display: "flex",
            alignItems: "center",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "oklch(0.65 0.18 10)";
            e.currentTarget.style.borderColor = "oklch(0.65 0.18 10)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#606080";
            e.currentTarget.style.borderColor = "#252535";
          }}
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
}

function ProjectDetail({
  project,
  allPosts,
  onBack,
  onRemovePost,
  onRename,
  accent,
}: {
  project: Project;
  allPosts: Post[];
  onBack: () => void;
  onRemovePost: (projectId: string, postId: string) => void;
  onRename: (id: string, name: string) => void;
  accent: string;
}) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(project.name);
  const posts = project.postIds
    .map((id) => allPosts.find((p) => p.id === id))
    .filter(Boolean) as Post[];

  const commitRename = () => {
    if (nameVal.trim()) onRename(project.id, nameVal.trim());
    setEditing(false);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "18px 28px 14px",
          borderBottom: "1px solid #131320",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "#161624",
            border: "1px solid #1e1e30",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            color: "#a0a0c0",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          <IconBack />
          <span>Projects</span>
        </button>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: project.color,
            boxShadow: `0 0 8px ${project.color}60`,
          }}
        />
        {editing ? (
          <input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditing(false);
            }}
            style={{
              background: "none",
              border: "none",
              borderBottom: `1px solid ${accent}`,
              outline: "none",
              fontSize: 18,
              fontWeight: 700,
              color: "#e8e8f0",
              fontFamily: "Space Grotesk, sans-serif",
              paddingBottom: 2,
              minWidth: 120,
            }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#e8e8f0",
                margin: 0,
              }}
            >
              {project.name}
            </h2>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#404060",
                display: "flex",
                padding: 2,
              }}
            >
              <IconPencil />
            </button>
          </div>
        )}
        <span style={{ fontSize: 12, color: "#505070", marginLeft: 4 }}>
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {posts.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 36, opacity: 0.1 }}>&#x25C8;</div>
          <div style={{ fontSize: 13, color: "#606080" }}>
            No posts saved yet
          </div>
          <div style={{ fontSize: 11, color: "#404060" }}>
            Bookmark posts from Discover to add them here
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isSelected={false}
                onClick={() => {}}
                onSave={(id) => onRemovePost(project.id, id)}
                saved={true}
                accent={accent}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectsView({
  projects,
  allPosts,
  onTogglePost,
  onCreate,
  onDelete,
  onRename,
  accent,
}: {
  projects: Project[];
  allPosts: Post[];
  onTogglePost: (projectId: string, postId: string) => void;
  onCreate: (name: string, color: string) => Promise<string>;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  accent: string;
}) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);

  const sortedProjects = [...projects].sort(
    (a, b) =>
      new Date(b.updated_at || b.created_at).getTime() -
      new Date(a.updated_at || a.created_at).getTime()
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await onCreate(newName.trim(), newColor);
      setCreatingNew(false);
      setNewName("");
    } catch (error) {
      console.warn(
        "Failed to create project:",
        error instanceof Error ? error.message : error
      );
    }
  };

  const active = projects.find((p) => p.id === activeProject);
  if (active) {
    return (
      <ProjectDetail
        project={active}
        allPosts={allPosts}
        onBack={() => setActiveProject(null)}
        onRemovePost={onTogglePost}
        onRename={onRename}
        accent={accent}
      />
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 40px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#e8e8f0",
              margin: "0 0 3px",
            }}
          >
            Projects
          </h2>
          <p style={{ fontSize: 12, color: "#505070", margin: 0 }}>
            {sortedProjects.length} project
            {sortedProjects.length !== 1 ? "s" : ""} · organize saved trends by
            brand or campaign
          </p>
        </div>
        <button
          onClick={() => setCreatingNew(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 16px",
            background: accent + "18",
            border: `1px solid ${accent}35`,
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 600,
            color: accent,
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          <IconPlus />
          New project
        </button>
      </div>

      {creatingNew && (
        <div
          style={{
            background: "#0f0f1a",
            border: `1px solid ${accent}30`,
            borderRadius: 12,
            padding: "16px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 5 }}>
            {PROJECT_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: c,
                  cursor: "pointer",
                  outline:
                    newColor === c
                      ? "2px solid #fff"
                      : "2px solid transparent",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setCreatingNew(false);
            }}
            placeholder="Project name..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              borderBottom: "1px solid #2a2a40",
              outline: "none",
              fontSize: 14,
              color: "#e8e8f0",
              fontFamily: "Space Grotesk, sans-serif",
              padding: "2px 0",
            }}
          />
          <button
            onClick={handleCreate}
            style={{
              padding: "7px 16px",
              background: accent,
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Create
          </button>
          <button
            onClick={() => setCreatingNew(false)}
            style={{
              padding: "7px 10px",
              background: "#1a1a28",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              color: "#808090",
              cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {sortedProjects.length === 0 && !creatingNew ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 0",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 36, opacity: 0.08 }}>&#x25C8;</div>
          <div style={{ fontSize: 14, color: "#606080" }}>No projects yet</div>
          <div style={{ fontSize: 12, color: "#404060" }}>
            Create a project to organize saved trends by brand or campaign
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {sortedProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              allPosts={allPosts}
              onClick={() => setActiveProject(proj.id)}
              onDelete={onDelete}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
