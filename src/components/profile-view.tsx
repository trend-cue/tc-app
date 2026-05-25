"use client";

import { useEffect, useMemo, useState } from "react";
import { createOrganizationForCurrentUser, saveMemberPreferences } from "@/lib/organization";
import { createClient } from "@/lib/supabase/client";
import { MemberPreferences, OrganizationContext, Post, Project } from "@/lib/types";
import { BillingSettings } from "./billing-settings";
import { IndustryPreferences } from "./industry-preferences";
import { OnboardingFlow } from "./onboarding-flow";
import { TeamSettings } from "./team-settings";

type ProfileSection = "onboarding" | "preferences" | "account" | "billing" | "team";

export function ProfileView({
  context,
  loading,
  error,
  userEmail,
  posts,
  projects,
  accent,
  onRefresh,
  onRunSearch,
  onSaveFirstTrend,
}: {
  context: OrganizationContext | null;
  loading: boolean;
  error: string;
  userEmail: string;
  posts: Post[];
  projects: Project[];
  accent: string;
  onRefresh: () => Promise<void>;
  onRunSearch: (query: string) => void;
  onSaveFirstTrend: (postId: string) => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [section, setSection] = useState<ProfileSection>("onboarding");
  const [orgName, setOrgName] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [industryKeys, setIndustryKeys] = useState<string[]>(
    context?.preferences.industry_keys ?? []
  );
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const isAdmin = context?.membership.role === "admin";
  const visibleSections = useMemo(
    () => [
      { id: "onboarding" as ProfileSection, label: "Onboarding" },
      { id: "preferences" as ProfileSection, label: "Industries" },
      { id: "account" as ProfileSection, label: "Account" },
      ...(isAdmin
        ? [
            { id: "billing" as ProfileSection, label: "Billing" },
            { id: "team" as ProfileSection, label: "Team" },
          ]
        : []),
    ],
    [isAdmin]
  );

  useEffect(() => {
    setIndustryKeys(context?.preferences.industry_keys ?? []);
  }, [context?.preferences.industry_keys]);

  useEffect(() => {
    if (!visibleSections.some((item) => item.id === section)) {
      setSection("onboarding");
    }
  }, [section, visibleSections]);

  const createWorkspace = async () => {
    setSavingOrg(true);
    setLocalError("");
    try {
      await createOrganizationForCurrentUser(supabase, orgName);
      setOrgName("");
      await onRefresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not create organisation");
    } finally {
      setSavingOrg(false);
    }
  };

  const persistPreferences = async () => {
    if (!context) return;
    setMessage("");
    setLocalError("");
    try {
      await saveMemberPreferences(supabase, {
        ...context.preferences,
        industry_keys: industryKeys,
      });
      setMessage("Preferences saved.");
      await onRefresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not save preferences");
    }
  };

  const saveOnboardingPreferences = async (nextPreferences: MemberPreferences) => {
    if (!context) return;
    await saveMemberPreferences(supabase, nextPreferences);
    await onRefresh();
  };

  if (loading) {
    return (
      <div style={viewStyle}>
        <div className="skeleton" style={{ height: 120, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 280, borderRadius: 8, marginTop: 14 }} />
      </div>
    );
  }

  if (!context) {
    return (
      <div style={viewStyle}>
        <section
          style={{
            maxWidth: 560,
            border: "1px solid #1a1a28",
            borderRadius: 8,
            background: "#0f0f1a",
            padding: 22,
          }}
        >
          <h1 style={{ color: "#ececf7", fontSize: 18, margin: 0 }}>
            Create your organisation
          </h1>
          <p style={{ color: "#606080", fontSize: 12, lineHeight: 1.7, marginTop: 8 }}>
            Your account is authenticated, but no active workspace is attached yet.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <input
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              placeholder="Organisation name"
              style={inputStyle}
            />
            <button
              type="button"
              disabled={savingOrg || !orgName.trim()}
              onClick={createWorkspace}
              style={{
                ...buttonStyle(accent),
                opacity: savingOrg || !orgName.trim() ? 0.6 : 1,
              }}
            >
              Create
            </button>
          </div>
          {(error || localError) && (
            <div style={{ color: "oklch(0.68 0.18 24)", fontSize: 12, marginTop: 12 }}>
              {localError || error}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div style={viewStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 18,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: accent, fontSize: 10, fontWeight: 800, letterSpacing: "0.08em" }}>
            PROFILE
          </div>
          <h1 style={{ color: "#f0f0fa", fontSize: 22, margin: "5px 0 4px" }}>
            {context.organization.name}
          </h1>
          <p style={{ color: "#606080", fontSize: 12, margin: 0 }}>
            {userEmail || context.membership.member_email} · {context.membership.role}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            border: "1px solid #1a1a28",
            borderRadius: 8,
            padding: 4,
            background: "#0f0f1a",
            flexWrap: "wrap",
          }}
        >
          {visibleSections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              style={{
                background: section === item.id ? "#181828" : "transparent",
                border: "none",
                borderRadius: 6,
                color: section === item.id ? "#e8e8f0" : "#606080",
                cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 12,
                fontWeight: section === item.id ? 700 : 500,
                padding: "7px 10px",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {section === "onboarding" && (
        <OnboardingFlow
          preferences={context.preferences}
          posts={posts}
          projects={projects}
          accent={accent}
          onSavePreferences={saveOnboardingPreferences}
          onRunSearch={onRunSearch}
          onSaveFirstTrend={onSaveFirstTrend}
        />
      )}

      {section === "preferences" && (
        <section style={panelStyle}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ color: "#ececf7", fontSize: 16, margin: 0 }}>
              Industry preferences
            </h2>
            <p style={{ color: "#606080", fontSize: 12, marginTop: 4 }}>
              These choices boost matching topics and posts without hiding the global feed.
            </p>
          </div>
          <IndustryPreferences value={industryKeys} onChange={setIndustryKeys} accent={accent} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <button type="button" onClick={persistPreferences} style={buttonStyle(accent)}>
              Save preferences
            </button>
            {message && <span style={{ color: accent, fontSize: 12 }}>{message}</span>}
          </div>
        </section>
      )}

      {section === "account" && (
        <section style={panelStyle}>
          <h2 style={{ color: "#ececf7", fontSize: 16, margin: 0 }}>
            Account summary
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 10,
              marginTop: 14,
            }}
          >
            {[
              ["Email", userEmail || context.membership.member_email],
              ["Role", context.membership.role],
              ["Organisation", context.organization.name],
              ["Joined", new Date(context.membership.joined_at).toLocaleDateString()],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  border: "1px solid #1a1a28",
                  borderRadius: 8,
                  padding: "12px 13px",
                  background: "#11111b",
                }}
              >
                <div style={{ color: "#505070", fontSize: 10, fontWeight: 800 }}>
                  {label.toUpperCase()}
                </div>
                <div style={{ color: "#e4e4f0", fontSize: 13, marginTop: 6 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {section === "billing" && isAdmin && (
        <BillingSettings context={context} accent={accent} onRefresh={onRefresh} />
      )}

      {section === "team" && isAdmin && (
        <TeamSettings context={context} accent={accent} onRefresh={onRefresh} />
      )}

      {localError && context && (
        <div style={{ color: "oklch(0.68 0.18 24)", fontSize: 12, marginTop: 12 }}>
          {localError}
        </div>
      )}
    </div>
  );
}

const viewStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "24px 28px 40px",
  minHeight: 0,
};

const panelStyle: React.CSSProperties = {
  border: "1px solid #1a1a28",
  borderRadius: 8,
  background: "#0f0f1a",
  padding: 18,
};

const inputStyle: React.CSSProperties = {
  minWidth: 0,
  flex: 1,
  background: "#111119",
  border: "1px solid #24243a",
  borderRadius: 8,
  color: "#e8e8f0",
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 13,
  outline: "none",
  padding: "10px 12px",
};

function buttonStyle(accent: string): React.CSSProperties {
  return {
    background: accent,
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: 12,
    fontWeight: 700,
    padding: "10px 13px",
  };
}
