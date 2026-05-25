"use client";

import { useMemo, useState } from "react";
import { cardBrandFromNumber, formatCurrency, isPaidTier, safeLast4 } from "@/lib/billing";
import { updateMockSubscription } from "@/lib/organization";
import { createClient } from "@/lib/supabase/client";
import { OrganizationContext, SubscriptionTierKey } from "@/lib/types";
import { TierPicker } from "./tier-picker";

export function BillingSettings({
  context,
  accent,
  onRefresh,
}: {
  context: OrganizationContext;
  accent: string;
  onRefresh: () => Promise<void>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tier, setTier] = useState<SubscriptionTierKey>(
    context.subscription?.tier_key ?? "starter"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState(context.membership.member_email);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    setMessage("");

    const paid = isPaidTier(tier);
    const last4 = safeLast4(cardNumber);

    if (paid && last4.length !== 4) {
      setBusy(false);
      setError("Enter a valid mock card number for paid tiers.");
      return;
    }

    try {
      await updateMockSubscription(
        supabase,
        context.organization.id,
        tier,
        paid
          ? {
              brand: cardBrandFromNumber(cardNumber),
              last4,
              expMonth: Number(expMonth),
              expYear: Number(expYear),
              billingName,
              billingEmail,
            }
          : null
      );
      setCardNumber("");
      setMessage("Plan updated.");
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update plan");
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
        padding: 18,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ color: "#ececf7", fontSize: 16, margin: 0 }}>
          Plan and payment
        </h2>
        <p style={{ color: "#606080", fontSize: 12, marginTop: 4 }}>
          Mock billing only. Full card numbers and CVC values are never stored.
        </p>
      </div>

      <TierPicker value={tier} onChange={setTier} accent={accent} />

      {isPaidTier(tier) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            marginTop: 14,
          }}
        >
          <input
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            placeholder="Card number"
            inputMode="numeric"
            style={inputStyle}
          />
          <input
            value={expMonth}
            onChange={(event) => setExpMonth(event.target.value)}
            placeholder="MM"
            inputMode="numeric"
            style={inputStyle}
          />
          <input
            value={expYear}
            onChange={(event) => setExpYear(event.target.value)}
            placeholder="YYYY"
            inputMode="numeric"
            style={inputStyle}
          />
          <input
            value={billingName}
            onChange={(event) => setBillingName(event.target.value)}
            placeholder="Billing name"
            style={inputStyle}
          />
          <input
            value={billingEmail}
            onChange={(event) => setBillingEmail(event.target.value)}
            placeholder="Billing email"
            type="email"
            style={inputStyle}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: "#606080", fontSize: 12 }}>
          {context.paymentMethod
            ? `${context.paymentMethod.brand} ending ${context.paymentMethod.last4}`
            : "No payment method on file"}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          style={{
            background: busy ? "#202032" : accent,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: busy ? "wait" : "pointer",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            padding: "9px 14px",
          }}
        >
          Save plan
        </button>
      </div>

      {(message || error) && (
        <div
          style={{
            color: error ? "oklch(0.68 0.18 24)" : accent,
            fontSize: 12,
            marginTop: 10,
          }}
        >
          {error || message}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <h3 style={{ color: "#dcdcea", fontSize: 13, margin: "0 0 10px" }}>
          Billing history
        </h3>
        <div style={{ border: "1px solid #1a1a28", borderRadius: 8, overflow: "hidden" }}>
          {context.invoices.length === 0 ? (
            <div style={{ color: "#606080", fontSize: 12, padding: 12 }}>
              No invoices for the current tier.
            </div>
          ) : (
            context.invoices.map((invoice) => (
              <div
                key={invoice.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 10,
                  alignItems: "center",
                  borderBottom: "1px solid #171725",
                  padding: "10px 12px",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#e4e4f0", fontWeight: 700 }}>
                  {invoice.invoice_number}
                </span>
                <span style={{ color: "#80809c" }}>
                  {new Date(invoice.issued_at).toLocaleDateString()}
                </span>
                <span style={{ color: "#a0a0c0" }}>
                  {formatCurrency(invoice.amount_cents, invoice.currency)}
                </span>
                <a
                  href={`/api/invoices/${invoice.id}`}
                  style={{ color: accent, textDecoration: "none", fontWeight: 700 }}
                >
                  Download
                </a>
              </div>
            ))
          )}
        </div>
      </div>
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
  fontSize: 13,
  outline: "none",
  padding: "10px 12px",
};
