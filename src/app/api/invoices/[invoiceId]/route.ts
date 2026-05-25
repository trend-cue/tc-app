import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/billing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("billing_invoices")
    .select(
      "id, invoice_number, period_start, period_end, amount_cents, currency, status, issued_at, paid_at, organizations(name)"
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (!invoice) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const row = invoice as unknown as {
    invoice_number: string;
    period_start: string;
    period_end: string;
    amount_cents: number;
    currency: string;
    status: string;
    issued_at: string;
    paid_at: string | null;
    organizations: { name: string } | { name: string }[] | null;
  };
  const organization = Array.isArray(row.organizations)
    ? row.organizations[0]
    : row.organizations;

  const body = [
    `TrendCue Invoice ${row.invoice_number}`,
    `Organisation: ${organization?.name ?? "TrendCue workspace"}`,
    `Issued: ${new Date(row.issued_at).toLocaleDateString()}`,
    `Period: ${new Date(row.period_start).toLocaleDateString()} - ${new Date(row.period_end).toLocaleDateString()}`,
    `Amount: ${formatCurrency(row.amount_cents, row.currency)}`,
    `Status: ${row.status}`,
    row.paid_at ? `Paid: ${new Date(row.paid_at).toLocaleDateString()}` : "Paid: pending",
    "",
    "This is a mock invoice for local billing validation. No real payment was processed.",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${row.invoice_number}.txt"`,
    },
  });
}
