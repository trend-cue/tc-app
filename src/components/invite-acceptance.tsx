"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptWorkspaceInvitation } from "@/lib/organization";
import { createClient } from "@/lib/supabase/client";

export function InviteAcceptance({ token }: { token: string }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState("");
  const accent = "oklch(0.72 0.18 210)";

  useEffect(() => {
    let mounted = true;

    const accept = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setNeedsAuth(true);
        setLoading(false);
        return;
      }

      try {
        await acceptWorkspaceInvitation(supabase, token);
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not accept invite");
        setLoading(false);
      }
    };

    accept();
    return () => {
      mounted = false;
    };
  }, [router, supabase, token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080d",
        fontFamily: "Space Grotesk, sans-serif",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "min(460px, 100%)",
          background: "#0f0f1a",
          border: "1px solid #1a1a28",
          borderRadius: 10,
          padding: 28,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: accent,
            margin: "0 auto 16px",
            boxShadow: `0 0 20px ${accent}40`,
          }}
        />
        <h1 style={{ color: "#e8e8f0", fontSize: 18, margin: 0 }}>
          TrendCue invitation
        </h1>
        <p style={{ color: "#606080", fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
          {loading
            ? "Checking your session..."
            : needsAuth
              ? "Sign in or create an account with the invited email to join the workspace."
              : error}
        </p>
        {needsAuth && (
          <Link
            href={`/login?invite=${encodeURIComponent(token)}`}
            style={{
              display: "inline-flex",
              marginTop: 12,
              background: accent,
              color: "#fff",
              textDecoration: "none",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Continue
          </Link>
        )}
      </section>
    </div>
  );
}
