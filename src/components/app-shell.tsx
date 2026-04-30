"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Post, Project, QueryData } from "@/lib/types";
import { getQueryData } from "@/lib/mock-data";
import { fetchPosts, derivedClusters } from "@/lib/posts-db";
import { EXPLORE_TOPICS } from "@/lib/explore-topics";
import { IconTrend, IconAlert, IconLogout } from "./icons";
import { SearchBar } from "./search-bar";
import { DiscoverView } from "./discover-view";
import { ProjectsView } from "./projects-view";
import { ProjectPicker } from "./project-picker";

const DEFAULT_ACCENT = "oklch(0.72 0.18 210)";

function Header({
  tab,
  setTab,
  projectCount,
  accent,
  userEmail,
  onLogout,
  onHome,
}: {
  tab: string;
  setTab: (t: string) => void;
  projectCount: number;
  accent: string;
  userEmail: string;
  onLogout: () => void;
  onHome: () => void;
}) {
  const initials = userEmail
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid #131320",
        background: "#08080d",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        onClick={onHome}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 14px ${accent}50`,
            color: "#fff",
          }}
        >
          <IconTrend />
        </div>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#e8e8f0",
            letterSpacing: "-0.02em",
          }}
        >
          TrendCue
        </span>
        <span
          style={{
            fontSize: 10,
            color: accent,
            background: accent + "18",
            padding: "2px 7px",
            borderRadius: 20,
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}
        >
          BETA
        </span>
      </div>
      <nav style={{ display: "flex", gap: 2 }}>
        {[
          { id: "discover", label: "Discover" },
          {
            id: "saved",
            label: projectCount > 0 ? `Projects (${projectCount})` : "Projects",
          },
          { id: "alerts", label: "Alerts" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "5px 14px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === id ? 600 : 400,
              color: tab === id ? "#e8e8f0" : "#606080",
              background: tab === id ? "#161624" : "transparent",
              fontFamily: "Space Grotesk, sans-serif",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#1a1a28",
            border: "1px solid #252535",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8080a8" }}>
            {initials}
          </span>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#404060",
            display: "flex",
            padding: 4,
          }}
        >
          <IconLogout />
        </button>
      </div>
    </header>
  );
}

function AlertsView({ accent }: { accent: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        padding: 40,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: accent + "15",
          border: `1px solid ${accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
        }}
      >
        <IconAlert />
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#c0c0e0",
            marginBottom: 6,
          }}
        >
          Trend Alerts
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#505070",
            maxWidth: 280,
            lineHeight: 1.7,
          }}
        >
          Get notified the moment a new cluster breaks out for your saved
          queries. Coming soon.
        </div>
      </div>
      <div
        style={{
          padding: "9px 22px",
          background: accent + "15",
          border: `1px solid ${accent}30`,
          borderRadius: 8,
          fontSize: 12,
          color: accent,
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Join waitlist →
      </div>
    </div>
  );
}

export function AppShell() {
  const router = useRouter();
  const supabase = createClient();
  const accent = DEFAULT_ACCENT;

  const [tab, setTab] = useState("discover");
  const [query, setQuery] = useState("");
  const [queryData, setQueryData] = useState<QueryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pickerState, setPickerState] = useState<{
    postId: string;
    x: number;
    y: number;
  } | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [dbReady, setDbReady] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts(supabase).then(setPosts);
  }, [supabase]);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");
      }
    });
  }, [supabase.auth]);

  // Load projects from Supabase
  const loadProjects = useCallback(async () => {
    const { data: projectRows, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Projects table not ready, using local state:", error.message);
      setDbReady(false);
      return;
    }

    setDbReady(true);

    const { data: postRows } = await supabase
      .from("project_posts")
      .select("*");

    const postsByProject = (postRows || []).reduce(
      (acc: Record<string, string[]>, row: { project_id: string; post_id: string }) => {
        if (!acc[row.project_id]) acc[row.project_id] = [];
        acc[row.project_id].push(row.post_id);
        return acc;
      },
      {} as Record<string, string[]>
    );

    setProjects(
      (projectRows || []).map((p: { id: string; name: string; color: string; created_at: string; updated_at: string }) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        postIds: postsByProject[p.id] || [],
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))
    );
  }, [supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const allPosts = posts;

  const isPostSaved = (postId: string) =>
    projects.some((p) => p.postIds.includes(postId));

  const openPicker = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerState({ postId, x: e.clientX, y: e.clientY });
  };

  const togglePostInProject = async (projectId: string, postId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const has = proj.postIds.includes(postId);

    if (dbReady) {
      if (has) {
        await supabase
          .from("project_posts")
          .delete()
          .eq("project_id", projectId)
          .eq("post_id", postId);
      } else {
        await supabase
          .from("project_posts")
          .insert({ project_id: projectId, post_id: postId });
      }
      await supabase
        .from("projects")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", projectId);
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              postIds: has
                ? p.postIds.filter((id) => id !== postId)
                : [...p.postIds, postId],
              updated_at: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const createProject = (name: string, color: string): string => {
    const tempId = "proj_" + Date.now();

    if (dbReady) {
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return;
        const { data: inserted } = await supabase
          .from("projects")
          .insert({ name, color, user_id: data.user.id })
          .select()
          .single();

        if (inserted) {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === tempId
                ? { ...p, id: inserted.id, created_at: inserted.created_at, updated_at: inserted.updated_at }
                : p
            )
          );
        }
      });
    }

    const now = new Date().toISOString();
    setProjects((prev) => [
      { id: tempId, name, color, postIds: [], created_at: now, updated_at: now },
      ...prev,
    ]);
    return tempId;
  };

  const deleteProject = async (id: string) => {
    if (dbReady) {
      await supabase.from("projects").delete().eq("id", id);
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const renameProject = async (id: string, name: string) => {
    if (dbReady) {
      await supabase.from("projects").update({ name }).eq("id", id);
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    setTab("discover");
    setLoading(true);
    setQueryData(null);
    setQuery(q);
    const data = getQueryData(q);
    setTimeout(
      () => {
        setQueryData(data);
        setLoading(false);
      },
      data?.analysisTime || 1200
    );
  };

  const handleClusterOpen = (clusterId: string) => {
    const cluster = derivedClusters(posts).find((c) => c.id === clusterId);
    if (!cluster) return;
    const inCluster = posts.filter((p) => p.clusterId === clusterId);
    setTab("discover");
    setQuery(cluster.name);
    setLoading(false);
    setQueryData({
      analysisTime: 0,
      totalPosts: inCluster.length,
      posts: inCluster,
      clusters: [cluster],
    });
  };

  const handleTopicOpen = (topicId: string) => {
    const topic = EXPLORE_TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    const matching = posts.filter(topic.match);
    if (matching.length === 0) return;
    setTab("discover");
    setQuery(topic.label);
    setLoading(false);
    setQueryData({
      analysisTime: 0,
      totalPosts: matching.length,
      posts: matching,
      clusters: derivedClusters(matching),
    });
  };

  const handleHome = () => {
    setTab("discover");
    setQuery("");
    setQueryData(null);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#08080d",
      }}
      onClick={() => pickerState && setPickerState(null)}
    >
      <Header
        tab={tab}
        setTab={setTab}
        projectCount={projects.length}
        accent={accent}
        userEmail={userEmail}
        onLogout={handleLogout}
        onHome={handleHome}
      />

      {tab === "discover" && (
        <>
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            loading={loading}
            accent={accent}
          />
          {queryData && !loading && (
            <div
              style={{
                padding: "10px 28px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 11, color: "#505070" }}>
                Results for
              </span>
              <span
                style={{ fontSize: 12, color: accent, fontWeight: 600 }}
              >
                &ldquo;{query}&rdquo;
              </span>
              <span style={{ fontSize: 11, color: "#252540" }}>·</span>
              <span
                style={{
                  fontSize: 11,
                  color: "#404060",
                  fontFamily: "Space Mono, monospace",
                }}
              >
                {queryData.totalPosts.toLocaleString()} posts ·{" "}
                {queryData.clusters.length} clusters
              </span>
            </div>
          )}
          <DiscoverView
            posts={posts}
            queryData={queryData}
            loading={loading}
            accent={accent}
            density="spacious"
            onSearch={handleSearch}
            onClusterOpen={handleClusterOpen}
            onTopicOpen={handleTopicOpen}
            setQuery={setQuery}
            isPostSaved={isPostSaved}
            openPicker={openPicker}
          />
        </>
      )}

      {tab === "saved" && (
        <ProjectsView
          projects={projects}
          allPosts={allPosts}
          onTogglePost={togglePostInProject}
          onCreate={createProject}
          onDelete={deleteProject}
          onRename={renameProject}
          accent={accent}
        />
      )}

      {tab === "alerts" && <AlertsView accent={accent} />}

      {pickerState && (
        <ProjectPicker
          postId={pickerState.postId}
          x={pickerState.x}
          y={pickerState.y}
          projects={projects}
          onToggle={togglePostInProject}
          onCreate={createProject}
          onClose={() => setPickerState(null)}
          accent={accent}
        />
      )}
    </div>
  );
}
