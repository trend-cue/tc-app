"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const accent = "oklch(0.72 0.18 210)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
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
        background: "#08080d",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      <div
        style={{
          width: 380,
          background: "#0f0f1a",
          border: "1px solid #1a1a28",
          borderRadius: 16,
          padding: "40px 32px",
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
              width: 32,
              height: 32,
              borderRadius: 8,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${accent}`,
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
            fontSize: 16,
            fontWeight: 600,
            color: "#e8e8f0",
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#606080",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          {isSignUp ? "Start discovering trends" : "Sign in to continue"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                color: "#505070",
                letterSpacing: "0.06em",
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
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
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
              boxShadow: `0 0 20px ${accent}40`,
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
            marginTop: 20,
            fontSize: 13,
            color: "#606080",
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
