/**
 * GET /api/entity-page/:entity/:id
 *
 * Dynamic entity page descriptor endpoint.
 * Returns per-record metadata: badges, actions, current lifecycle state, and permissions.
 * Resolves status from the shared mock data store to keep descriptor and data in sync.
 *
 * In production this will evaluate entity policies, lifecycle rules, and approval state.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCOUNTS_BY_ID, PURCHASE_INVOICES_BY_ID } from "@/lib/mock-data/entities";

import type {
    ActionDescriptor,
    BadgeDescriptor,
    EntityPageDynamicDescriptor,
    ViewMode,
} from "@/lib/entity-page/types";

// ---------------------------------------------------------------------------
// Descriptor builders
// ---------------------------------------------------------------------------

/**
 * Build dynamic descriptor for an Account (Master entity).
 * Master entities have simple Active/Inactive status and always-available Edit action.
 * No lifecycle or approval workflow.
 */
function buildAccountDescriptor(entityId: string, viewMode: ViewMode): EntityPageDynamicDescriptor {
    // Derive status from shared mock data — single source of truth
    const record = ACCOUNTS_BY_ID[entityId];
    const status = (record?.status as string) ?? "Active";
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

/**
 * Build dynamic descriptor for a Purchase Invoice (Document entity).
 * Document entities have a lifecycle state machine that determines:
 *  - Which badge variant to show (color-coded by state)
 *  - Which actions are available (state-dependent transitions)
 *  - Whether the record is editable (only in Draft state)
 *  - View mode overrides (read-only when past Draft or in terminal state)
 *
 * Lifecycle: Draft → Submitted → Approved → Paid
 *            Draft → Cancelled (from any pre-terminal state)
 */
function buildInvoiceDescriptor(entityId: string, viewMode: ViewMode): EntityPageDynamicDescriptor {
    // Derive status from shared mock data — single source of truth
    const record = PURCHASE_INVOICES_BY_ID[entityId];
    const status = (record?.status as string) ?? "Draft";

    // Badge variant per lifecycle state
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

    // Lifecycle-dependent actions — only the valid next transition is offered
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

    // Edit is only available in Draft — document is locked once submitted
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

    // Force read-only for non-Draft states; set reason for the UI notice
    const resolvedViewMode = isTerminal || status !== "Draft" ? "view" as ViewMode : viewMode;
    const viewModeReason = isTerminal
        ? "terminal_state"
        : status !== "Draft"
            ? "approval_pending"
            : undefined;

    return {
        entityName: "purchase-invoice",
        entityId,
        resolvedViewMode,
        viewModeReason,
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

    try {
        const builder = BUILDERS[entity];

        if (!builder) {
            console.warn(`[GET /api/entity-page/${entity}/${id}] Unknown entity requested`);
            return NextResponse.json(
                { error: { message: `Unknown entity: ${entity}` } },
                { status: 404 },
            );
        }

        const viewMode = (req.nextUrl.searchParams.get("viewMode") as ViewMode) ?? "view";
        const descriptor = builder(id, viewMode);

        return NextResponse.json({ data: descriptor });
    } catch (error) {
        console.error(`[GET /api/entity-page/${entity}/${id}] Error:`, error);
        return NextResponse.json(
            { error: { message: "Failed to load entity descriptor" } },
            { status: 500 },
        );
    }
}
