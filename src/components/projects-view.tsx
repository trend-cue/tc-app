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
  onDelete: (project: Project) => void;
  accent: string;
}) {
  const [hov, setHov] = useState(false);
  const [deleteHov, setDeleteHov] = useState(false);
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
      <button
        type="button"
        title="Delete project"
        aria-label={`Delete ${project.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project);
        }}
        onMouseEnter={() => setDeleteHov(true)}
        onMouseLeave={() => setDeleteHov(false)}
        onFocus={() => setDeleteHov(true)}
        onBlur={() => setDeleteHov(false)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 30,
          height: 30,
          background: deleteHov ? "oklch(0.22 0.08 24)" : "#1a1a28",
          border: `1px solid ${deleteHov ? "oklch(0.65 0.18 10)" : "#252535"}`,
          borderRadius: 6,
          padding: 0,
          cursor: "pointer",
          color: deleteHov ? "oklch(0.76 0.18 24)" : "#707090",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hov || deleteHov ? 1 : 0.72,
          transition: "all 0.12s",
          boxShadow: deleteHov ? "0 0 0 1px rgba(255,255,255,0.04)" : "none",
        }}
      >
        <IconTrash />
      </button>
    </div>
  );
}

function DeleteProjectDialog({
  project,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  project: Project;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const postCount = project.postIds.length;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleting, onCancel]);

  return (
    <div
      role="presentation"
      onMouseDown={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(4, 4, 8, 0.72)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          background: "#101019",
          border: "1px solid #2a1e26",
          borderRadius: 8,
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 4,
            background: "oklch(0.65 0.18 10)",
          }}
        />
        <div style={{ padding: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "oklch(0.22 0.08 24)",
                border: "1px solid oklch(0.65 0.18 10 / 0.45)",
                color: "oklch(0.76 0.18 24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconTrash />
            </div>
            <div>
              <h3
                id="delete-project-title"
                style={{
                  color: "#f0f0fa",
                  fontSize: 15,
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                Delete project
              </h3>
              <div style={{ color: "#606080", fontSize: 11, marginTop: 2 }}>
                {postCount} saved post{postCount === 1 ? "" : "s"} will be
                removed from it
              </div>
            </div>
          </div>
          <p
            style={{
              color: "#a8a8c4",
              fontSize: 13,
              lineHeight: 1.6,
              margin: "0 0 14px",
            }}
          >
            Delete <strong style={{ color: "#f0f0fa" }}>{project.name}</strong>? Saved
            posts stay in Discover, but this project and its project membership are
            removed.
          </p>
          {error && (
            <div
              style={{
                color: "oklch(0.74 0.18 24)",
                background: "oklch(0.20 0.07 24)",
                border: "1px solid oklch(0.55 0.16 24 / 0.5)",
                borderRadius: 7,
                padding: "8px 10px",
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              disabled={deleting}
              onClick={onCancel}
              style={{
                padding: "8px 12px",
                background: "#1a1a28",
                border: "1px solid #252535",
                borderRadius: 7,
                color: "#b0b0ca",
                cursor: deleting ? "not-allowed" : "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 12,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={onConfirm}
              style={{
                padding: "8px 12px",
                background: deleting ? "#32222a" : "oklch(0.58 0.18 10)",
                border: "1px solid oklch(0.65 0.18 10)",
                borderRadius: 7,
                color: "#fff",
                cursor: deleting ? "not-allowed" : "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {deleting ? "Deleting..." : "Delete project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDetail({
  project,
  allPosts,
  onBack,
  onRemovePost,
  onRename,
  onDelete,
  accent,
}: {
  project: Project;
  allPosts: Post[];
  onBack: () => void;
  onRemovePost: (projectId: string, postId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (project: Project) => void;
  accent: string;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteHov, setDeleteHov] = useState(false);
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
        <button
          type="button"
          title="Delete project"
          aria-label={`Delete ${project.name}`}
          onClick={() => onDelete(project)}
          onMouseEnter={() => setDeleteHov(true)}
          onMouseLeave={() => setDeleteHov(false)}
          onFocus={() => setDeleteHov(true)}
          onBlur={() => setDeleteHov(false)}
          style={{
            marginLeft: "auto",
            width: 32,
            height: 32,
            background: deleteHov ? "oklch(0.22 0.08 24)" : "#161624",
            border: `1px solid ${deleteHov ? "oklch(0.65 0.18 10)" : "#1e1e30"}`,
            borderRadius: 8,
            color: deleteHov ? "oklch(0.76 0.18 24)" : "#606080",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.12s",
          }}
        >
          <IconTrash />
        </button>
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
  onDelete: (id: string) => Promise<void>;
  onRename: (id: string, name: string) => void;
  accent: string;
}) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  const requestDelete = (project: Project) => {
    setDeleteTarget(project);
    setDeleteError("");
  };

  const cancelDelete = () => {
    if (deletingProject) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletingProject) return;

    setDeletingProject(true);
    setDeleteError("");
    try {
      await onDelete(deleteTarget.id);
      if (activeProject === deleteTarget.id) {
        setActiveProject(null);
      }
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete project"
      );
    } finally {
      setDeletingProject(false);
    }
  };

  const deleteDialog = deleteTarget ? (
    <DeleteProjectDialog
      project={deleteTarget}
      deleting={deletingProject}
      error={deleteError}
      onCancel={cancelDelete}
      onConfirm={confirmDelete}
    />
  ) : null;

  const active = projects.find((p) => p.id === activeProject);
  if (active) {
    return (
      <>
        <ProjectDetail
          project={active}
          allPosts={allPosts}
          onBack={() => setActiveProject(null)}
          onRemovePost={onTogglePost}
          onRename={onRename}
          onDelete={requestDelete}
          accent={accent}
        />
        {deleteDialog}
      </>
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
              onDelete={requestDelete}
              accent={accent}
            />
          ))}
        </div>
      )}
      {deleteDialog}
    </div>
  );
}
