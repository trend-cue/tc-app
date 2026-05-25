"use client";

import { useMemo, useState } from "react";
import {
  createWorkspaceInvitation,
  removeOrganizationMember,
  revokeWorkspaceInvitation,
  updateOrganizationMemberRole,
} from "@/lib/organization";
import { createClient } from "@/lib/supabase/client";
import { OrganizationContext, OrganizationRole } from "@/lib/types";

export function TeamSettings({
  context,
  accent,
  onRefresh,
}: {
  context: OrganizationContext;
  accent: string;
  onRefresh: () => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationRole>("member");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const activeAdmins = context.members.filter(
    (member) => member.role === "admin" && !member.removed_at
  ).length;

  const invite = async () => {
    setBusy("invite");
    setError("");
    setInviteLink("");
    try {
      const result = await createWorkspaceInvitation(
        supabase,
        context.organization.id,
        email,
        role
      );
      const url = `${window.location.origin}/invite/${result.invite_token}`;
      setInviteLink(url);
      setEmail("");
      await navigator.clipboard?.writeText(url).catch(() => undefined);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invitation");
    } finally {
      setBusy("");
    }
  };

  const changeRole = async (memberId: string, nextRole: OrganizationRole) => {
    setBusy(memberId);
    setError("");
    try {
      await updateOrganizationMemberRole(supabase, memberId, nextRole);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role");
    } finally {
      setBusy("");
    }
  };

  const removeMember = async (memberId: string) => {
    if (!window.confirm("Remove this member from the organisation?")) return;
    setBusy(memberId);
    setError("");
    try {
      await removeOrganizationMember(supabase, memberId);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove member");
    } finally {
      setBusy("");
    }
  };

  const revoke = async (invitationId: string) => {
    setBusy(invitationId);
    setError("");
    try {
      await revokeWorkspaceInvitation(supabase, invitationId);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke invite");
    } finally {
      setBusy("");
    }
  };

  return (
    <section
      style={{
        border: "1px solid #1a1a28",
        borderRadius: 8,
        background: "#0f0f1a",
        padding: 18,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ color: "#ececf7", fontSize: 16, margin: 0 }}>
          Team
        </h2>
        <p style={{ color: "#606080", fontSize: 12, marginTop: 4 }}>
          Invite, revoke, and remove workspace members.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teammate@company.com"
          type="email"
          style={inputStyle}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as OrganizationRole)}
          style={inputStyle}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button type="button" disabled={busy === "invite"} onClick={invite} style={buttonStyle(accent)}>
          Invite
        </button>
      </div>

      {inviteLink && (
        <div
          style={{
            color: accent,
            background: `${accent}12`,
            border: `1px solid ${accent}25`,
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 14,
            padding: "10px 12px",
            wordBreak: "break-all",
          }}
        >
          {inviteLink}
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {context.members.map((member) => {
          const isSelf = member.user_id === context.membership.user_id;
          const lastAdmin = member.role === "admin" && activeAdmins <= 1;
          return (
            <div
              key={member.id}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 10,
                alignItems: "center",
                border: "1px solid #1a1a28",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div>
                <div style={{ color: "#e4e4f0", fontSize: 13, fontWeight: 700 }}>
                  {member.member_email}
                </div>
                <div style={{ color: "#555570", fontSize: 11, marginTop: 3 }}>
                  {member.removed_at
                    ? `Removed ${new Date(member.removed_at).toLocaleDateString()}`
                    : `Joined ${new Date(member.joined_at).toLocaleDateString()}`}
                </div>
              </div>
              <select
                value={member.role}
                disabled={Boolean(member.removed_at) || lastAdmin || busy === member.id}
                onChange={(event) =>
                  changeRole(member.id, event.target.value as OrganizationRole)
                }
                style={inputStyle}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="button"
                disabled={Boolean(member.removed_at) || lastAdmin || isSelf || busy === member.id}
                onClick={() => removeMember(member.id)}
                style={{
                  ...buttonStyle("oklch(0.65 0.18 24)"),
                  opacity: member.removed_at || lastAdmin || isSelf ? 0.45 : 1,
                }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      {context.invitations.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h3 style={{ color: "#dcdcea", fontSize: 13, margin: "0 0 10px" }}>
            Pending invitations
          </h3>
          <div style={{ display: "grid", gap: 8 }}>
            {context.invitations.map((invitation) => (
              <div
                key={invitation.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: 10,
                  alignItems: "center",
                  border: "1px solid #1a1a28",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <span style={{ color: "#e4e4f0", fontSize: 13 }}>
                  {invitation.email}
                </span>
                <span style={{ color: "#80809c", fontSize: 12 }}>
                  {invitation.role}
                </span>
                <button
                  type="button"
                  disabled={busy === invitation.id}
                  onClick={() => revoke(invitation.id)}
                  style={buttonStyle("oklch(0.65 0.18 24)")}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "oklch(0.68 0.18 24)", fontSize: 12, marginTop: 12 }}>
          {error}
        </div>
      )}
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  minWidth: 0,
  background: "#111119",
  border: "1px solid #24243a",
  borderRadius: 8,
  color: "#e8e8f0",
  fontFamily: "Space Grotesk, sans-serif",
  fontSize: 12,
  outline: "none",
  padding: "9px 10px",
};

function buttonStyle(accent: string): React.CSSProperties {
  return {
    background: `${accent}18`,
    border: `1px solid ${accent}35`,
    borderRadius: 8,
    color: accent,
    cursor: "pointer",
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: 12,
    fontWeight: 700,
    padding: "9px 12px",
  };
}
