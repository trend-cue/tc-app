"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  acceptWorkspaceInvitation,
  createOrganizationForCurrentUser,
} from "@/lib/organization";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  getPasswordPolicyError,
} from "@/lib/auth/password-policy";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const inviteToken = searchParams.get("invite") || "";

  const accent = "oklch(0.76 0.17 58)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!inviteToken && !organizationName.trim()) {
          throw new Error("Organisation name is required");
        }

        const passwordPolicyError = getPasswordPolicyError(password);

        if (passwordPolicyError) {
          setError(passwordPolicyError);
          return;
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (!data.session) {
          setError("Check your email to confirm your account, then sign in.");
          return;
        }

        if (inviteToken) {
          await acceptWorkspaceInvitation(supabase, inviteToken);
        } else {
          await createOrganizationForCurrentUser(supabase, organizationName.trim());
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (inviteToken) {
          await acceptWorkspaceInvitation(supabase, inviteToken);
        }
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d12",
        fontFamily: "Space Grotesk, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 55% at 50% 110%, ${accent}0c 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 40% 30% at 20% 20%, oklch(0.55 0.12 260 / 0.06) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: 400,
          background: "#141419",
          border: "1px solid #28283a",
          borderRadius: 20,
          padding: "44px 36px",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 20px ${accent}50`,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 20,
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
              background: `${accent}18`,
              padding: "2px 7px",
              borderRadius: 20,
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            BETA
          </span>
        </div>

        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#eeeef4",
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#636280",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          {inviteToken
            ? "Accept your TrendCue invitation"
            : isSignUp
              ? "Start discovering trends"
              : "Sign in to continue"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                color: "#646280",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 6,
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: "100%",
                background: "#0d0d12",
                border: "1px solid #242436",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: "#eeeef4",
                fontFamily: "Space Grotesk, sans-serif",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = `${accent}60`)
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#242436")
              }
            />
          </div>

          <div style={{ marginBottom: isSignUp && !inviteToken ? 16 : 24 }}>
            <label
              style={{
                fontSize: 11,
                color: "#646280",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 6,
              }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                isSignUp ? "Create a strong password" : "Enter your password"
              }
              required
              minLength={isSignUp ? PASSWORD_MIN_LENGTH : undefined}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              style={{
                width: "100%",
                background: "#0d0d12",
                border: "1px solid #242436",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: "#eeeef4",
                fontFamily: "Space Grotesk, sans-serif",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = `${accent}60`)
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#242436")
              }
            />
            {isSignUp && (
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: "#636280",
                }}
              >
                {PASSWORD_POLICY_MESSAGE}
              </p>
            )}
          </div>

          {isSignUp && !inviteToken && (
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "#505070",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                ORGANISATION
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Studio"
                required={isSignUp && !inviteToken}
                style={{
                  width: "100%",
                  background: "#111119",
                  border: "1px solid #1e1e2e",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#e8e8f0",
                  fontFamily: "Space Grotesk, sans-serif",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = `${accent}55`)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "#1e1e2e")
                }
              />
            </div>
          )}

          {error && (
            <div
              style={{
                fontSize: 12,
                color: "oklch(0.65 0.18 20)",
                background: "oklch(0.65 0.18 20 / 0.1)",
                border: "1px solid oklch(0.65 0.18 20 / 0.2)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: accent,
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: loading ? "wait" : "pointer",
              fontFamily: "Space Grotesk, sans-serif",
              boxShadow: `0 4px 24px ${accent}35`,
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading
              ? "Loading..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 22,
            fontSize: 13,
            color: "#636280",
          }}
        >
          {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: accent,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 500,
            }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
