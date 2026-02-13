// app/api/entity-page/[entity]/[id]/route.ts
//
// Dynamic entity page descriptor endpoint.
// Returns per-record metadata (badges, actions, current state, permissions).
// Looks up the record from the mock data store to determine state-dependent actions.

import { NextResponse } from "next/server";

import type {
    ActionDescriptor,
    BadgeDescriptor,
    EntityPageDynamicDescriptor,
    ViewMode,
} from "@/lib/entity-page/types";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock record status lookup (minimal — just status per entity/id)
// ---------------------------------------------------------------------------

const ACCOUNT_STATUSES: Record<string, string> = {
    "ACC-001": "Active",
    "ACC-002": "Active",
    "ACC-003": "Active",
    "ACC-004": "Active",
    "ACC-005": "Inactive",
    "ACC-006": "Active",
    "ACC-007": "Active",
    "ACC-008": "Active",
};

const INVOICE_STATUSES: Record<string, string> = {
    "PI-001": "Draft",
    "PI-002": "Submitted",
    "PI-003": "Approved",
    "PI-004": "Paid",
    "PI-005": "Draft",
    "PI-006": "Submitted",
    "PI-007": "Approved",
    "PI-008": "Cancelled",
};

// ---------------------------------------------------------------------------
// Descriptor builders
// ---------------------------------------------------------------------------

function buildAccountDescriptor(entityId: string, viewMode: ViewMode): EntityPageDynamicDescriptor {
    const status = ACCOUNT_STATUSES[entityId] ?? "Active";
    const isActive = status === "Active";

    const badges: BadgeDescriptor[] = [
        { code: "class", label: "Master", variant: "outline" },
        { code: "status", label: status, variant: isActive ? "success" : "secondary" },
    ];

    const actions: ActionDescriptor[] = [
        {
            code: "edit",
            label: "Edit",
            handler: "entity.edit",
            variant: "default",
            enabled: true,
            requiresConfirmation: false,
        },
    ];

    return {
        entityName: "account",
        entityId,
        resolvedViewMode: viewMode,
        badges,
        actions,
        permissions: { canEdit: true, canDelete: false },
    };
}

function buildInvoiceDescriptor(entityId: string, viewMode: ViewMode): EntityPageDynamicDescriptor {
    const status = INVOICE_STATUSES[entityId] ?? "Draft";

    const stateVariant: Record<string, BadgeDescriptor["variant"]> = {
        Draft: "secondary",
        Submitted: "default",
        Approved: "success",
        Paid: "success",
        Cancelled: "destructive",
    };

    const badges: BadgeDescriptor[] = [
        { code: "class", label: "Document", variant: "outline" },
        { code: "state", label: status, variant: stateVariant[status] ?? "secondary" },
    ];

    // Lifecycle-dependent actions
    const actions: ActionDescriptor[] = [];

    if (status === "Draft") {
        actions.push({
            code: "submit",
            label: "Submit",
            handler: "lifecycle.submit",
            variant: "default",
            enabled: true,
            requiresConfirmation: true,
            confirmationMessage: "Submit this invoice for approval?",
        });
    }

    if (status === "Submitted") {
        actions.push({
            code: "approve",
            label: "Approve",
            handler: "lifecycle.approve",
            variant: "default",
            enabled: true,
            requiresConfirmation: true,
            confirmationMessage: "Approve this invoice for payment?",
        });
    }

    if (status === "Approved") {
        actions.push({
            code: "pay",
            label: "Mark as Paid",
            handler: "lifecycle.pay",
            variant: "default",
            enabled: true,
            requiresConfirmation: true,
            confirmationMessage: "Mark this invoice as paid?",
        });
    }

    // Edit action (only for Draft)
    if (status === "Draft") {
        actions.push({
            code: "edit",
            label: "Edit",
            handler: "entity.edit",
            variant: "outline",
            enabled: true,
            requiresConfirmation: false,
        });
    }

    const isTerminal = status === "Paid" || status === "Cancelled";

    return {
        entityName: "purchase-invoice",
        entityId,
        resolvedViewMode: isTerminal || status !== "Draft" ? "view" : viewMode,
        viewModeReason: isTerminal ? "terminal_state" : status !== "Draft" ? "approval_pending" : undefined,
        currentState: {
            stateId: `state-${status.toLowerCase()}`,
            stateCode: status.toLowerCase(),
            stateName: status,
            isTerminal,
        },
        badges,
        actions,
        permissions: {
            canEdit: status === "Draft",
            canDelete: status === "Draft",
        },
    };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const BUILDERS: Record<string, (id: string, vm: ViewMode) => EntityPageDynamicDescriptor> = {
    account: buildAccountDescriptor,
    "purchase-invoice": buildInvoiceDescriptor,
};

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> },
) {
    const { entity, id } = await params;
    const builder = BUILDERS[entity];

    if (!builder) {
        return NextResponse.json(
            { error: { message: `Unknown entity: ${entity}` } },
            { status: 404 },
        );
    }

    const viewMode = (req.nextUrl.searchParams.get("viewMode") as ViewMode) ?? "view";
    const descriptor = builder(id, viewMode);

    return NextResponse.json({ data: descriptor });
}
