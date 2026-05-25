import { SupabaseClient } from "@supabase/supabase-js";
import {
  BillingInvoice,
  MemberPreferences,
  Organization,
  OrganizationContext,
  OrganizationMembership,
  OrganizationPaymentMethod,
  OrganizationRole,
  OrganizationSubscription,
  SubscriptionTierKey,
  WorkspaceInvitation,
} from "./types";

type Supabase = SupabaseClient;

export interface InvitationResult {
  id: string;
  email: string;
  role: OrganizationRole;
  expires_at: string;
  invite_token: string;
}

export interface MockPaymentInput {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  billingName: string;
  billingEmail: string;
}

const DEFAULT_PREFERENCES = (
  organizationId: string,
  userId: string
): MemberPreferences => ({
  organization_id: organizationId,
  user_id: userId,
  industry_keys: [],
  onboarding_step: "industries",
  first_search_query: null,
  first_saved_post_id: null,
  first_saved_project_id: null,
  onboarding_completed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export async function loadOrganizationContext(
  supabase: Supabase
): Promise<OrganizationContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membershipRows, error: membershipError } = await supabase
    .from("organization_memberships")
    .select(
      "id, organization_id, user_id, member_email, role, joined_at, removed_at, invited_by, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .is("removed_at", null)
    .order("joined_at", { ascending: true })
    .limit(1);

  if (membershipError) throw membershipError;

  const membership = (membershipRows?.[0] ?? null) as OrganizationMembership | null;
  if (!membership) return null;

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, created_by, stripe_customer_id, created_at, updated_at")
    .eq("id", membership.organization_id)
    .single();

  if (orgError) throw orgError;

  let preferences: MemberPreferences | null = null;
  const { data: preferenceRow, error: preferenceError } = await supabase
    .from("member_preferences")
    .select(
      "organization_id, user_id, industry_keys, onboarding_step, first_search_query, first_saved_post_id, first_saved_project_id, onboarding_completed_at, created_at, updated_at"
    )
    .eq("organization_id", membership.organization_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (preferenceError) throw preferenceError;
  preferences = preferenceRow as MemberPreferences | null;

  if (!preferences) {
    preferences = DEFAULT_PREFERENCES(membership.organization_id, user.id);
    await supabase.from("member_preferences").upsert(preferences, {
      onConflict: "organization_id,user_id",
    });
  }

  const isAdmin = membership.role === "admin";

  const { data: memberRows } = await supabase
    .from("organization_memberships")
    .select(
      "id, organization_id, user_id, member_email, role, joined_at, removed_at, invited_by, created_at, updated_at"
    )
    .eq("organization_id", membership.organization_id)
    .order("joined_at", { ascending: true });

  const members = (memberRows ?? []) as OrganizationMembership[];

  const { data: subscriptionRows } = isAdmin
    ? await supabase
        .from("organization_subscriptions")
        .select(
          "id, organization_id, tier_key, status, current_period_start, current_period_end, stripe_subscription_id, mock_provider_id, created_at, updated_at"
        )
        .eq("organization_id", membership.organization_id)
        .limit(1)
    : { data: null };

  const { data: paymentRows } = isAdmin
    ? await supabase
        .from("organization_payment_methods")
        .select(
          "id, organization_id, brand, last4, exp_month, exp_year, billing_name, billing_email, is_default, stripe_payment_method_id, mock_provider_id, created_at, updated_at"
        )
        .eq("organization_id", membership.organization_id)
        .eq("is_default", true)
        .order("created_at", { ascending: false })
        .limit(1)
    : { data: null };

  const { data: invoiceRows } = isAdmin
    ? await supabase
        .from("billing_invoices")
        .select(
          "id, organization_id, subscription_id, invoice_number, period_start, period_end, amount_cents, currency, status, issued_at, paid_at, stripe_invoice_id, hosted_invoice_url, created_at, updated_at"
        )
        .eq("organization_id", membership.organization_id)
        .order("issued_at", { ascending: false })
    : { data: null };

  const { data: invitationRows } = isAdmin
    ? await supabase
        .from("workspace_invitations")
        .select(
          "id, organization_id, email, role, expires_at, accepted_at, revoked_at, invited_by, created_at, updated_at"
        )
        .eq("organization_id", membership.organization_id)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .order("created_at", { ascending: false })
    : { data: null };

  return {
    organization: organization as Organization,
    membership,
    preferences,
    members,
    invitations: (invitationRows ?? []) as WorkspaceInvitation[],
    subscription:
      ((subscriptionRows?.[0] ?? null) as OrganizationSubscription | null) ??
      null,
    paymentMethod:
      ((paymentRows?.[0] ?? null) as OrganizationPaymentMethod | null) ?? null,
    invoices: (invoiceRows ?? []) as BillingInvoice[],
  };
}

export async function createOrganizationForCurrentUser(
  supabase: Supabase,
  organizationName: string
): Promise<void> {
  const { error } = await supabase.rpc("create_organisation_for_current_user", {
    org_name: organizationName,
  });
  if (error) throw error;
}

export async function acceptWorkspaceInvitation(
  supabase: Supabase,
  token: string
): Promise<void> {
  const { error } = await supabase.rpc("accept_workspace_invitation", {
    invite_token: token,
  });
  if (error) throw error;
}

export async function saveMemberPreferences(
  supabase: Supabase,
  preferences: MemberPreferences
): Promise<void> {
  const { error } = await supabase.from("member_preferences").upsert(
    {
      organization_id: preferences.organization_id,
      user_id: preferences.user_id,
      industry_keys: preferences.industry_keys,
      onboarding_step: preferences.onboarding_step,
      first_search_query: preferences.first_search_query,
      first_saved_post_id: preferences.first_saved_post_id,
      first_saved_project_id: preferences.first_saved_project_id,
      onboarding_completed_at: preferences.onboarding_completed_at,
    },
    { onConflict: "organization_id,user_id" }
  );

  if (error) throw error;
}

export async function createWorkspaceInvitation(
  supabase: Supabase,
  organizationId: string,
  email: string,
  role: OrganizationRole
): Promise<InvitationResult> {
  const { data, error } = await supabase.rpc("create_workspace_invitation", {
    check_org_id: organizationId,
    invite_email: email,
    invite_role: role,
  });

  if (error) throw error;
  const invitation = Array.isArray(data) ? data[0] : data;
  return invitation as InvitationResult;
}

export async function revokeWorkspaceInvitation(
  supabase: Supabase,
  invitationId: string
): Promise<void> {
  const { error } = await supabase.rpc("revoke_workspace_invitation", {
    invitation_id: invitationId,
  });
  if (error) throw error;
}

export async function removeOrganizationMember(
  supabase: Supabase,
  memberId: string
): Promise<void> {
  const { error } = await supabase.rpc("remove_organization_member", {
    member_id: memberId,
  });
  if (error) throw error;
}

export async function updateOrganizationMemberRole(
  supabase: Supabase,
  memberId: string,
  newRole: OrganizationRole
): Promise<void> {
  const { error } = await supabase.rpc("update_organization_member_role", {
    member_id: memberId,
    new_role: newRole,
  });
  if (error) throw error;
}

export async function updateMockSubscription(
  supabase: Supabase,
  organizationId: string,
  tier: SubscriptionTierKey,
  payment: MockPaymentInput | null
): Promise<void> {
  const { error } = await supabase.rpc("update_mock_subscription", {
    check_org_id: organizationId,
    selected_tier: tier,
    card_brand: payment?.brand ?? null,
    card_last4: payment?.last4 ?? null,
    card_exp_month: payment?.expMonth ?? null,
    card_exp_year: payment?.expYear ?? null,
    billing_name: payment?.billingName ?? null,
    billing_email: payment?.billingEmail ?? null,
  });

  if (error) throw error;
}
