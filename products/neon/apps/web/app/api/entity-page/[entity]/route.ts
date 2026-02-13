// app/api/entity-page/[entity]/route.ts
//
// Static entity page descriptor endpoint.
// Returns cacheable metadata (tabs, sections, feature flags) for a given entity type.
// Uses a registry of known entities; returns 404 for unknown entities.

import { NextResponse } from "next/server";

import type { EntityPageStaticDescriptor, SectionDescriptor, TabDescriptor } from "@/lib/entity-page/types";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Entity descriptor registry
// ---------------------------------------------------------------------------

interface EntityDefinition {
    entityClass: string;
    tabs: TabDescriptor[];
    sections: SectionDescriptor[];
    featureFlags: Record<string, boolean>;
}

const ENTITY_REGISTRY: Record<string, EntityDefinition> = {
    account: {
        entityClass: "master",
        tabs: [
            { code: "details", label: "Details", enabled: true },
            { code: "documents", label: "Documents", enabled: true },
        ],
        sections: [
            {
                code: "general",
                label: "General",
                columns: 2,
                fields: ["account_code", "account_name", "account_type", "currency"],
            },
            {
                code: "details",
                label: "Details",
                columns: 2,
                fields: ["parent_account", "status", "description", "created_at"],
            },
        ],
        featureFlags: {
            lifecycle: false,
            approvals: false,
            documents: true,
        },
    },
    "purchase-invoice": {
        entityClass: "document",
        tabs: [
            { code: "details", label: "Details", enabled: true },
            { code: "lifecycle", label: "Lifecycle", enabled: true },
            { code: "approvals", label: "Approvals", enabled: true },
            { code: "documents", label: "Documents", enabled: true },
        ],
        sections: [
            {
                code: "header",
                label: "Header",
                columns: 2,
                fields: ["invoice_number", "supplier", "invoice_date", "due_date", "payment_terms"],
            },
            {
                code: "amounts",
                label: "Amounts",
                columns: 2,
                fields: ["net_amount", "tax_amount", "total_amount", "currency"],
            },
            {
                code: "status",
                label: "Status",
                columns: 1,
                fields: ["status"],
            },
        ],
        featureFlags: {
            lifecycle: true,
            approvals: true,
            documents: true,
        },
    },
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ entity: string }> },
) {
    const { entity } = await params;
    const definition = ENTITY_REGISTRY[entity];

    if (!definition) {
        return NextResponse.json(
            { error: { message: `Unknown entity: ${entity}` } },
            { status: 404 },
        );
    }

    const descriptor: EntityPageStaticDescriptor = {
        entityName: entity,
        entityClass: definition.entityClass,
        featureFlags: definition.featureFlags,
        compiledModelHash: `mock-${entity}-v1`,
        tabs: definition.tabs,
        sections: definition.sections,
    };

    return NextResponse.json({ data: descriptor });
}
