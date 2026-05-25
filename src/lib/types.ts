export interface Post {
  id: string;
  clusterId: string;
  platform: "tiktok" | "instagram" | "twitter";
  handle: string;
  displayName: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  views: number | null;
  trendScore: number;
  postedAt: string;
  isVideo: boolean;
  hashtags: string[];
  sourceUrl?: string;
  externalId?: string;
  embedUrl?: string;
  thumbnailStoragePath?: string;
  thumbnail: { label: string; accent: string; url?: string };
  whyTrending: {
    summary: string;
    signals: { label: string; value: string; note: string }[];
    relatedHashtags: { tag: string; growth: string }[];
  };
}

export interface Cluster {
  id: string;
  name: string;
  postCount: number;
  trendScore: number;
  growth: string;
  color: string;
  tag: string;
  summary: string;
}

export interface QueryData {
  analysisTime: number;
  totalPosts: number;
  clusters: Cluster[];
  posts: Post[];
}

export interface Project {
  id: string;
  organization_id?: string;
  created_by?: string;
  user_id?: string;
  name: string;
  color: string;
  postIds: string[];
  created_at: string;
  updated_at: string;
}

export type OrganizationRole = "admin" | "member";
export type SubscriptionTierKey = "starter" | "growth" | "scale";
export type OnboardingStep = "industries" | "search" | "save" | "complete";

export interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  created_by: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  member_email: string;
  role: OrganizationRole;
  joined_at: string;
  removed_at: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberPreferences {
  organization_id: string;
  user_id: string;
  industry_keys: string[];
  onboarding_step: OnboardingStep;
  first_search_query: string | null;
  first_saved_post_id: string | null;
  first_saved_project_id: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrganizationRole;
  token_hash?: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  tier_key: SubscriptionTierKey;
  status: string;
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id: string | null;
  mock_provider_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationPaymentMethod {
  id: string;
  organization_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  billing_name: string | null;
  billing_email: string | null;
  is_default: boolean;
  stripe_payment_method_id: string | null;
  mock_provider_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingInvoice {
  id: string;
  organization_id: string;
  subscription_id: string | null;
  invoice_number: string;
  period_start: string;
  period_end: string;
  amount_cents: number;
  currency: string;
  status: string;
  issued_at: string;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  hosted_invoice_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationContext {
  organization: Organization;
  membership: OrganizationMembership;
  preferences: MemberPreferences;
  members: OrganizationMembership[];
  invitations: WorkspaceInvitation[];
  subscription: OrganizationSubscription | null;
  paymentMethod: OrganizationPaymentMethod | null;
  invoices: BillingInvoice[];
}

export interface PlatformMeta {
  label: string;
  color: string;
  icon: "tiktok" | "instagram" | "x";
}

export const PLATFORM_META: Record<string, PlatformMeta> = {
  tiktok: { label: "TikTok", color: "#69c9d0", icon: "tiktok" },
  instagram: { label: "Instagram", color: "#e1306c", icon: "instagram" },
  twitter: { label: "X", color: "#e7e9ea", icon: "x" },
};

export const PROJECT_COLORS = [
  "oklch(0.68 0.22 285)",
  "oklch(0.72 0.18 210)",
  "oklch(0.75 0.18 52)",
  "oklch(0.68 0.22 10)",
  "oklch(0.72 0.18 145)",
  "oklch(0.70 0.18 310)",
];

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}
