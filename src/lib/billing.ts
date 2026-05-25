import { SubscriptionTierKey } from "./types";

export interface MockTier {
  key: SubscriptionTierKey;
  name: string;
  price: string;
  amountCents: number;
  cadence: string;
  description: string;
  features: string[];
}

export const MOCK_TIERS: MockTier[] = [
  {
    key: "starter",
    name: "Starter",
    price: "$0",
    amountCents: 0,
    cadence: "forever",
    description: "For one-person trend scouting.",
    features: ["Discover feed", "Shared projects", "Profile onboarding"],
  },
  {
    key: "growth",
    name: "Growth",
    price: "$29",
    amountCents: 2900,
    cadence: "per month",
    description: "For small teams building repeatable research.",
    features: ["Team invitations", "Mock invoices", "Priority trend matching"],
  },
  {
    key: "scale",
    name: "Scale",
    price: "$99",
    amountCents: 9900,
    cadence: "per month",
    description: "For larger teams coordinating many campaigns.",
    features: ["Admin controls", "Billing history", "Expanded team workspace"],
  },
];

export function tierByKey(key: SubscriptionTierKey): MockTier {
  return MOCK_TIERS.find((tier) => tier.key === key) ?? MOCK_TIERS[0];
}

export function isPaidTier(key: SubscriptionTierKey): boolean {
  return key !== "starter";
}

export function formatCurrency(amountCents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export function cardBrandFromNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^6/.test(digits)) return "Discover";
  return "Card";
}

export function safeLast4(cardNumber: string): string {
  return cardNumber.replace(/\D/g, "").slice(-4);
}
