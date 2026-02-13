// app/api/data/[entity]/[id]/route.ts
//
// Single entity record endpoint.
// Returns one mock record by entity type and ID.

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

// Re-use the same mock data as the list endpoint.
// In production this would be a DB query.

const ACCOUNTS: Record<string, Record<string, unknown>> = {
    "ACC-001": { id: "ACC-001", account_code: "1000", account_name: "Cash and Cash Equivalents", account_type: "Asset", currency: "USD", parent_account: null, status: "Active", description: "Primary cash account for operating funds", created_at: "2025-01-15" },
    "ACC-002": { id: "ACC-002", account_code: "1100", account_name: "Accounts Receivable", account_type: "Asset", currency: "USD", parent_account: null, status: "Active", description: "Trade receivables from customers", created_at: "2025-01-15" },
    "ACC-003": { id: "ACC-003", account_code: "2000", account_name: "Accounts Payable", account_type: "Liability", currency: "USD", parent_account: null, status: "Active", description: "Trade payables to suppliers", created_at: "2025-01-15" },
    "ACC-004": { id: "ACC-004", account_code: "3000", account_name: "Retained Earnings", account_type: "Equity", currency: "USD", parent_account: null, status: "Active", description: "Cumulative retained earnings", created_at: "2025-01-15" },
    "ACC-005": { id: "ACC-005", account_code: "4000", account_name: "Sales Revenue (Legacy)", account_type: "Revenue", currency: "USD", parent_account: null, status: "Inactive", description: "Deprecated revenue account — migrated to 4100", created_at: "2025-01-15" },
    "ACC-006": { id: "ACC-006", account_code: "4100", account_name: "Sales Revenue", account_type: "Revenue", currency: "USD", parent_account: null, status: "Active", description: "Primary revenue from product and service sales", created_at: "2025-03-01" },
    "ACC-007": { id: "ACC-007", account_code: "5000", account_name: "Cost of Goods Sold", account_type: "Expense", currency: "USD", parent_account: null, status: "Active", description: "Direct costs of goods and services sold", created_at: "2025-01-15" },
    "ACC-008": { id: "ACC-008", account_code: "6000", account_name: "Operating Expenses", account_type: "Expense", currency: "USD", parent_account: null, status: "Active", description: "General and administrative operating expenses", created_at: "2025-01-15" },
};

const PURCHASE_INVOICES: Record<string, Record<string, unknown>> = {
    "PI-001": { id: "PI-001", invoice_number: "INV-2026-0001", supplier: "Acme Industrial Supplies", invoice_date: "2026-02-01", due_date: "2026-03-03", currency: "USD", net_amount: 12500.00, tax_amount: 1125.00, total_amount: 13625.00, status: "Draft", payment_terms: "Net 30" },
    "PI-002": { id: "PI-002", invoice_number: "INV-2026-0002", supplier: "Global Tech Components", invoice_date: "2026-01-28", due_date: "2026-02-27", currency: "USD", net_amount: 8750.00, tax_amount: 787.50, total_amount: 9537.50, status: "Submitted", payment_terms: "Net 30" },
    "PI-003": { id: "PI-003", invoice_number: "INV-2026-0003", supplier: "Premier Office Solutions", invoice_date: "2026-01-15", due_date: "2026-02-14", currency: "USD", net_amount: 3200.00, tax_amount: 288.00, total_amount: 3488.00, status: "Approved", payment_terms: "Net 30" },
    "PI-004": { id: "PI-004", invoice_number: "INV-2026-0004", supplier: "Swift Logistics Ltd", invoice_date: "2026-01-05", due_date: "2026-01-20", currency: "USD", net_amount: 15000.00, tax_amount: 1350.00, total_amount: 16350.00, status: "Paid", payment_terms: "Net 15" },
    "PI-005": { id: "PI-005", invoice_number: "INV-2026-0005", supplier: "NorthStar Raw Materials", invoice_date: "2026-02-10", due_date: "2026-04-11", currency: "EUR", net_amount: 22000.00, tax_amount: 1980.00, total_amount: 23980.00, status: "Draft", payment_terms: "Net 60" },
    "PI-006": { id: "PI-006", invoice_number: "INV-2026-0006", supplier: "CloudServe Hosting Inc", invoice_date: "2026-02-01", due_date: "2026-02-15", currency: "USD", net_amount: 4500.00, tax_amount: 405.00, total_amount: 4905.00, status: "Submitted", payment_terms: "Net 15" },
    "PI-007": { id: "PI-007", invoice_number: "INV-2026-0007", supplier: "Pinnacle Consulting Group", invoice_date: "2026-01-20", due_date: "2026-03-21", currency: "GBP", net_amount: 18500.00, tax_amount: 3700.00, total_amount: 22200.00, status: "Approved", payment_terms: "Net 60" },
    "PI-008": { id: "PI-008", invoice_number: "INV-2026-0008", supplier: "EcoClean Facility Services", invoice_date: "2025-12-15", due_date: "2026-01-14", currency: "USD", net_amount: 2800.00, tax_amount: 252.00, total_amount: 3052.00, status: "Cancelled", payment_terms: "Net 30" },
};

const DATA_REGISTRY: Record<string, Record<string, Record<string, unknown>>> = {
    account: ACCOUNTS,
    "purchase-invoice": PURCHASE_INVOICES,
};

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> },
) {
    const { entity, id } = await params;
    const store = DATA_REGISTRY[entity];

    if (!store) {
        return NextResponse.json(
            { error: { message: `Unknown entity: ${entity}` } },
            { status: 404 },
        );
    }

    const record = store[id];

    if (!record) {
        return NextResponse.json(
            { error: { message: `Record not found: ${entity}/${id}` } },
            { status: 404 },
        );
    }

    return NextResponse.json({ data: record });
}
