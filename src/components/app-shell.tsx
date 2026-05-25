"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Post, Project, PROJECT_COLORS, QueryData, OrganizationContext } from "@/lib/types";
import { fetchPosts, derivedClusters } from "@/lib/posts-db";
import { EXPLORE_TOPICS } from "@/lib/explore-topics";
import { sortPostsForIndustries, suggestedQueryForIndustries } from "@/lib/industries";
import { loadOrganizationContext, saveMemberPreferences } from "@/lib/organization";
import { IconTrend, IconAlert, IconLogout } from "./icons";
import { SearchBar } from "./search-bar";
import { DiscoverView } from "./discover-view";
import { ProjectsView } from "./projects-view";
import { ProjectPicker } from "./project-picker";
import { ProfileView } from "./profile-view";

const DEFAULT_ACCENT = "oklch(0.72 0.18 210)";

function searchPosts(posts: Post[], query: string): Post[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const clustersById = new Map(derivedClusters(posts).map((c) => [c.id, c]));

  return posts
    .map((post) => {
      const cluster = clustersById.get(post.clusterId);
      const corpus = [
        post.content,
        post.handle,
        post.displayName,
        cluster?.name,
        ...post.hashtags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matched = tokens.filter((token) => corpus.includes(token)).length;
      return { post, matched };
    })
    .filter(({ matched }) => matched > 0)
    .sort(
      (a, b) =>
        b.matched - a.matched ||
        b.post.trendScore - a.post.trendScore ||
        b.post.likes + b.post.shares - (a.post.likes + a.post.shares)
    )
    .map(({ post }) => post);
}

function Header({
  tab,
  setTab,
  projectCount,
  accent,
  userEmail,
  onLogout,
  onHome,
  onProfile,
  profileActive,
}: {
  tab: string;
  setTab: (t: string) => void;
  projectCount: number;
  accent: string;
  userEmail: string;
  onLogout: () => void;
  onHome: () => void;
  onProfile: () => void;
  profileActive: boolean;
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
        <button
          type="button"
          onClick={onProfile}
          title="Open profile"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: profileActive ? accent + "22" : "#1a1a28",
            border: `1px solid ${profileActive ? accent + "66" : "#252535"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontFamily: "Space Grotesk, sans-serif",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8080a8" }}>
            {initials}
          </span>
        </button>
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
  const supabase = useMemo(() => createClient(), []);
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
  const [userId, setUserId] = useState("");
  const [organizationContext, setOrganizationContext] =
    useState<OrganizationContext | null>(null);
  const [organizationLoading, setOrganizationLoading] = useState(true);
  const [organizationError, setOrganizationError] = useState("");
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
        setUserId(data.user.id);
      }
    });
  }, [supabase.auth]);

  const refreshOrganizationContext = useCallback(async () => {
    setOrganizationLoading(true);
    setOrganizationError("");
    try {
      setOrganizationContext(await loadOrganizationContext(supabase));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load organisation";
      console.warn("Organization context not ready:", message);
      setOrganizationError(message);
      setOrganizationContext(null);
    } finally {
      setOrganizationLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refreshOrganizationContext();
  }, [refreshOrganizationContext]);

  useEffect(() => {
    if (!organizationLoading && !organizationContext && userEmail) {
      setTab("profile");
    }
  }, [organizationContext, organizationLoading, userEmail]);

  // Load projects from Supabase
  const loadProjects = useCallback(async () => {
    if (!organizationContext) {
      setProjects([]);
      return;
    }

    const { data: projectRows, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationContext.organization.id)
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
        organization_id: (p as Project).organization_id,
        created_by: (p as Project).created_by,
        user_id: (p as Project).user_id,
        name: p.name,
        color: p.color,
        postIds: postsByProject[p.id] || [],
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))
    );
  }, [organizationContext, supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const preferredIndustryKeys = useMemo(
    () => organizationContext?.preferences.industry_keys ?? [],
    [organizationContext?.preferences.industry_keys]
  );

  const allPosts = posts;

  const searchSuggestions = useMemo(() => {
    const topicLabels = EXPLORE_TOPICS.filter((topic) =>
      posts.some(topic.match)
    ).map((topic) => topic.label);
    const clusterNames = derivedClusters(posts).map((cluster) => cluster.name);
    const hashtagCounts = posts
      .flatMap((post) => post.hashtags)
      .reduce((acc: Record<string, number>, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
    const hashtags = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    return Array.from(
      new Set([
        ...(preferredIndustryKeys.length
          ? [suggestedQueryForIndustries(preferredIndustryKeys)]
          : []),
        ...topicLabels,
        ...clusterNames,
        ...hashtags,
      ])
    ).slice(0, 8);
  }, [posts, preferredIndustryKeys]);

  const isPostSaved = (postId: string) =>
    projects.some((p) => p.postIds.includes(postId));

  const openPicker = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerState({ postId, x: e.clientX, y: e.clientY });
  };

  const togglePostInProject = async (projectId: string, postId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    const has = proj?.postIds.includes(postId) ?? false;

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
          .upsert(
            { project_id: projectId, post_id: postId },
            { onConflict: "project_id,post_id" }
          );
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

  const createProject = async (name: string, color: string): Promise<string> => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    setProjects((prev) => [
      {
        id,
        organization_id: organizationContext?.organization.id,
        created_by: userId,
        user_id: userId,
        name,
        color,
        postIds: [],
        created_at: now,
        updated_at: now,
      },
      ...prev,
    ]);

    if (dbReady) {
      if (!organizationContext || !userId) {
        throw new Error("Create an organisation before creating projects.");
      }

      const { error } = await supabase.from("projects").insert({
        id,
        name,
        color,
        user_id: userId,
        created_by: userId,
        organization_id: organizationContext.organization.id,
      });

      if (error) {
        setProjects((prev) => prev.filter((project) => project.id !== id));
        throw error;
      }
    }

    return id;
  };

  const deleteProject = async (id: string): Promise<void> => {
    if (dbReady) {
      const { data, error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error(
          "Project not found or you do not have permission to delete it."
        );
      }
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    setPickerState(null);

    if (organizationContext?.preferences.first_saved_project_id === id) {
      try {
        const updatedAt = new Date().toISOString();
        const nextPreferences = {
          ...organizationContext.preferences,
          first_saved_project_id: null,
          updated_at: updatedAt,
        };

        await saveMemberPreferences(supabase, nextPreferences);
        setOrganizationContext((prev) =>
          prev
            ? {
                ...prev,
                preferences: {
                  ...prev.preferences,
                  first_saved_project_id: null,
                  updated_at: updatedAt,
                },
              }
            : prev
        );
      } catch (error) {
        console.warn(
          "Could not clear deleted onboarding project reference:",
          error instanceof Error ? error.message : error
        );
      }
    }
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
    const startedAt = performance.now();
    const matching = sortPostsForIndustries(
      searchPosts(posts, q),
      preferredIndustryKeys
    );
    const delay = Math.max(
      180,
      420 - Math.round(performance.now() - startedAt)
    );
    setTimeout(() => {
      setQueryData({
        analysisTime: delay,
        totalPosts: matching.length,
        posts: matching,
        clusters: derivedClusters(matching),
      });
      setLoading(false);
    }, delay);
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
    const matching = sortPostsForIndustries(
      posts.filter(topic.match),
      preferredIndustryKeys
    );
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

  const saveFirstTrend = async (postId: string) => {
    if (!organizationContext || !userId) {
      throw new Error("Create an organisation before saving trends.");
    }

    const projectId =
      projects[0]?.id ?? (await createProject("First trends", PROJECT_COLORS[0]));

    const alreadySaved = projects.some(
      (project) => project.id === projectId && project.postIds.includes(postId)
    );

    if (!alreadySaved) {
      if (dbReady) {
        const { error } = await supabase
          .from("project_posts")
          .upsert(
            { project_id: projectId, post_id: postId },
            { onConflict: "project_id,post_id" }
          );
        if (error) throw error;

        await supabase
          .from("projects")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", projectId);
      }

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                postIds: project.postIds.includes(postId)
                  ? project.postIds
                  : [...project.postIds, postId],
                updated_at: new Date().toISOString(),
              }
            : project
        )
      );
    }

    await saveMemberPreferences(supabase, {
      ...organizationContext.preferences,
      onboarding_step: "complete",
      first_saved_post_id: postId,
      first_saved_project_id: projectId,
      onboarding_completed_at: new Date().toISOString(),
    });
    await refreshOrganizationContext();
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
        onProfile={() => setTab("profile")}
        profileActive={tab === "profile"}
      />

      {tab === "discover" && (
        <>
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            loading={loading}
            accent={accent}
            suggestions={searchSuggestions}
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
            preferredIndustryKeys={preferredIndustryKeys}
            onClusterOpen={handleClusterOpen}
            onTopicOpen={handleTopicOpen}
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

      {tab === "profile" && (
        <ProfileView
          context={organizationContext}
          loading={organizationLoading}
          error={organizationError}
          userEmail={userEmail}
          posts={posts}
          projects={projects}
          accent={accent}
          onRefresh={refreshOrganizationContext}
          onRunSearch={handleSearch}
          onSaveFirstTrend={saveFirstTrend}
        />
      )}

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
