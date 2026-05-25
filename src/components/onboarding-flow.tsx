"use client";

import { useMemo, useState } from "react";
import { Post, Project, MemberPreferences, OnboardingStep } from "@/lib/types";
import {
  selectedIndustries,
  sortPostsForIndustries,
  suggestedQueryForIndustries,
} from "@/lib/industries";
import { IndustryPreferences } from "./industry-preferences";

function PrimaryButton({
  children,
  disabled,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        background: disabled ? "#202032" : accent,
        border: "none",
        borderRadius: 8,
        color: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        padding: "9px 14px",
        opacity: disabled ? 0.64 : 1,
      }}
    >
      {children}
    </button>
  );
}

function StepDot({
  active,
  done,
  label,
  accent,
}: {
  active: boolean;
  done: boolean;
  label: string;
  accent: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: done || active ? accent : "#181827",
          border: `1px solid ${done || active ? accent : "#2a2a40"}`,
          color: done || active ? "#fff" : "#606080",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {done ? "✓" : ""}
      </span>
      <span
        style={{
          color: active ? "#e8e8f0" : "#606080",
          fontSize: 11,
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const STEP_ORDER: OnboardingStep[] = ["industries", "search", "save", "complete"];

export function OnboardingFlow({
  preferences,
  posts,
  projects,
  accent,
  onSavePreferences,
  onRunSearch,
  onSaveFirstTrend,
}: {
  preferences: MemberPreferences;
  posts: Post[];
  projects: Project[];
  accent: string;
  onSavePreferences: (preferences: MemberPreferences) => Promise<void>;
  onRunSearch: (query: string) => void;
  onSaveFirstTrend: (postId: string) => Promise<void>;
}) {
  const [industryKeys, setIndustryKeys] = useState(preferences.industry_keys);
  const [query, setQuery] = useState(
    preferences.first_search_query ||
      suggestedQueryForIndustries(preferences.industry_keys)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const step: OnboardingStep = preferences.onboarding_completed_at
    ? "complete"
    : preferences.onboarding_step;
  const stepIndex = STEP_ORDER.indexOf(step);
  const chosenIndustries = selectedIndustries(industryKeys);
  const suggestedPosts = useMemo(
    () => sortPostsForIndustries(posts, industryKeys).slice(0, 4),
    [posts, industryKeys]
  );

  const updatePreferences = async (
    updates: Partial<MemberPreferences>,
    nextStep?: OnboardingStep
  ) => {
    setBusy(true);
    setError("");
    try {
      await onSavePreferences({
        ...preferences,
        ...updates,
        industry_keys: updates.industry_keys ?? industryKeys,
        onboarding_step: nextStep ?? updates.onboarding_step ?? step,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save onboarding");
    } finally {
      setBusy(false);
    }
  };

  const runFirstSearch = async () => {
    const cleanQuery = query.trim() || suggestedQueryForIndustries(industryKeys);
    await updatePreferences(
      { first_search_query: cleanQuery, industry_keys: industryKeys },
      "save"
    );
    onRunSearch(cleanQuery);
  };

  const saveTrend = async (postId: string) => {
    setBusy(true);
    setError("");
    try {
      await onSaveFirstTrend(postId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this trend");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      style={{
        border: "1px solid #1a1a28",
        borderRadius: 8,
        background: "#0f0f1a",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #191927",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, margin: 0, color: "#ececf7" }}>
            Onboarding
          </h2>
          <p style={{ fontSize: 12, color: "#606080", marginTop: 4 }}>
            Build a first workspace signal from industries, search, and saved trends.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {STEP_ORDER.slice(0, 3).map((item, index) => (
            <StepDot
              key={item}
              label={item === "industries" ? "Industries" : item === "search" ? "Search" : "Save"}
              active={step === item}
              done={stepIndex > index || step === "complete"}
              accent={accent}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: 18 }}>
        {step === "complete" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ color: "#e8e8f0", fontSize: 14, fontWeight: 700 }}>
                Workspace onboarding complete
              </div>
              <p style={{ color: "#606080", fontSize: 12, marginTop: 6 }}>
                {projects.length} project{projects.length === 1 ? "" : "s"} ready.
                Your Discover home now gives preference to{" "}
                {chosenIndustries.length
                  ? chosenIndustries.map((industry) => industry.label).join(", ")
                  : "your saved choices"}
                .
              </p>
            </div>
            <PrimaryButton
              accent={accent}
              onClick={() => updatePreferences({ onboarding_completed_at: null }, "industries")}
            >
              Revisit
            </PrimaryButton>
          </div>
        )}

        {step === "industries" && (
          <div>
            <IndustryPreferences
              value={industryKeys}
              onChange={setIndustryKeys}
              accent={accent}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <PrimaryButton
                accent={accent}
                disabled={industryKeys.length === 0 || busy}
                onClick={() =>
                  updatePreferences(
                    {
                      industry_keys: industryKeys,
                      first_search_query: suggestedQueryForIndustries(industryKeys),
                    },
                    "search"
                  )
                }
              >
                Continue
              </PrimaryButton>
            </div>
          </div>
        )}

        {step === "search" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={suggestedQueryForIndustries(industryKeys)}
              style={{
                minWidth: 0,
                background: "#111119",
                border: "1px solid #24243a",
                borderRadius: 8,
                color: "#e8e8f0",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 13,
                outline: "none",
                padding: "10px 12px",
              }}
            />
            <PrimaryButton accent={accent} disabled={busy} onClick={runFirstSearch}>
              Run search
            </PrimaryButton>
          </div>
        )}

        {step === "save" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 10,
              }}
            >
              {suggestedPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  disabled={busy}
                  onClick={() => saveTrend(post.id)}
                  style={{
                    textAlign: "left",
                    background: "#11111b",
                    border: "1px solid #202033",
                    borderRadius: 8,
                    padding: 12,
                    cursor: busy ? "wait" : "pointer",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                >
                  <div style={{ color: accent, fontSize: 10, marginBottom: 6 }}>
                    {post.platform.toUpperCase()} · SCORE {post.trendScore}
                  </div>
                  <div
                    style={{
                      color: "#e4e4f0",
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      marginBottom: 8,
                    }}
                  >
                    {post.displayName}
                  </div>
                  <p
                    style={{
                      color: "#686884",
                      fontSize: 11,
                      lineHeight: 1.5,
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.content || post.whyTrending.summary}
                  </p>
                </button>
              ))}
            </div>
            {suggestedPosts.length === 0 && (
              <div style={{ color: "#606080", fontSize: 12 }}>
                No matching posts loaded yet. Run another search or refresh the feed.
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            style={{
              color: "oklch(0.68 0.18 24)",
              background: "oklch(0.68 0.18 24 / 0.1)",
              border: "1px solid oklch(0.68 0.18 24 / 0.22)",
              borderRadius: 8,
              fontSize: 12,
              marginTop: 12,
              padding: "9px 11px",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
