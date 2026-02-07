/**
 * Dashboard API client — fetches dashboard data from the BFF/runtime API.
 */

export interface DashboardListItem {
    id: string;
    code: string;
    titleKey: string;
    descriptionKey?: string;
    moduleCode: string;
    workbench: string;
    visibility: string;
    icon?: string;
    sortOrder: number;
    isHidden: boolean;
    forkedFromId?: string;
    permission: string;
}

export interface DashboardGroup {
    moduleCode: string;
    dashboards: DashboardListItem[];
}

export interface DashboardListResponse {
    total: number;
    groups: DashboardGroup[];
}

export interface DashboardLayout {
    schema_version: 1;
    columns: 12;
    row_height: number;
    items: Array<{
        id: string;
        widget_type: string;
        params: Record<string, unknown>;
        grid: { x: number; y: number; w: number; h: number };
    }>;
}

export interface DashboardDetail {
    id: string;
    code: string;
    titleKey: string;
    descriptionKey?: string;
    moduleCode: string;
    workbench: string;
    visibility: string;
    icon?: string;
    layout: DashboardLayout;
    versionNo: number;
    publishedAt?: string;
    permission?: "owner" | "edit" | "view";
    ownerId?: string;
    createdBy?: string;
}

export interface AclEntry {
    id: string;
    principalType: string;
    principalKey: string;
    permission: string;
    createdBy: string;
    createdAt: string;
}

const BASE_URL = "/api/ui";

export async function fetchDashboards(workbench: string): Promise<DashboardListResponse> {
    const res = await fetch(`${BASE_URL}/dashboards?workbench=${encodeURIComponent(workbench)}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to load dashboards: ${res.status}`);
    return (await res.json()) as DashboardListResponse;
}

export async function fetchDashboard(id: string): Promise<DashboardDetail> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to load dashboard: ${res.status}`);
    return (await res.json()) as DashboardDetail;
}

export async function duplicateDashboard(id: string): Promise<{ id: string }> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}/duplicate`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to duplicate dashboard: ${res.status}`);
    return (await res.json()) as { id: string };
}

export async function createDashboard(params: {
    code: string;
    titleKey: string;
    descriptionKey?: string;
    moduleCode: string;
    workbench: string;
    icon?: string;
}): Promise<{ id: string }> {
    const res = await fetch(`${BASE_URL}/dashboards`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Failed to create dashboard: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: { id: string } };
    return json.data;
}

export async function deleteDashboard(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to delete dashboard: ${res.status}`);
}

export async function updateDashboard(
    id: string,
    updates: { titleKey?: string; descriptionKey?: string; isHidden?: boolean; sortOrder?: number },
): Promise<void> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update dashboard: ${res.status}`);
}

export async function saveDraftLayout(id: string, layout: DashboardLayout): Promise<void> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}/layout`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
    });
    if (!res.ok) throw new Error(`Failed to save layout: ${res.status}`);
}

export async function publishDashboard(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}/publish`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to publish dashboard: ${res.status}`);
}

export interface DraftResponse {
    layout: DashboardLayout;
    versionNo: number;
    status: string;
    createdAt?: string;
}

export async function fetchDraft(id: string): Promise<DraftResponse | null> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}/draft`, {
        credentials: "include",
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to load draft: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: DraftResponse };
    return json.data;
}

export async function discardDraft(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}/draft`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to discard draft: ${res.status}`);
}

// ─────────────────────────────────────────────
// ACL Management
// ─────────────────────────────────────────────

export async function fetchAcl(dashboardId: string): Promise<AclEntry[]> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(dashboardId)}/acl`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to load ACL: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: AclEntry[] };
    return json.data;
}

export async function addAcl(
    dashboardId: string,
    entry: { principalType: string; principalKey: string; permission: string },
): Promise<{ id: string }> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(dashboardId)}/acl`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`Failed to add ACL entry: ${res.status}`);
    return (await res.json()) as { id: string };
}

export async function removeAcl(dashboardId: string, aclId: string): Promise<void> {
    const res = await fetch(
        `${BASE_URL}/dashboards/${encodeURIComponent(dashboardId)}/acl/${encodeURIComponent(aclId)}`,
        {
            method: "DELETE",
            credentials: "include",
        },
    );
    if (!res.ok) throw new Error(`Failed to remove ACL entry: ${res.status}`);
}

// ─────────────────────────────────────────────
// Export / Import
// ─────────────────────────────────────────────

export interface DashboardExportData {
    $schema: "athyper-dashboard-export-v1";
    exportedAt: string;
    dashboard: {
        code: string;
        titleKey: string;
        descriptionKey?: string;
        moduleCode: string;
        icon?: string;
    };
    layout: DashboardLayout;
}

export async function exportDashboard(id: string): Promise<DashboardExportData> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(id)}/export`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to export dashboard: ${res.status}`);
    return (await res.json()) as DashboardExportData;
}

export async function importDashboard(
    workbench: string,
    data: DashboardExportData,
): Promise<{ id: string }> {
    const res = await fetch(`${BASE_URL}/dashboards/import`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbench, ...data }),
    });
    if (!res.ok) throw new Error(`Failed to import dashboard: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: { id: string } };
    return json.data;
}

// ─────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────

export interface TemplateItem {
    id: string;
    code: string;
    titleKey: string;
    descriptionKey?: string;
    moduleCode: string;
    icon?: string;
    widgetCount: number;
}

export async function fetchTemplates(workbench: string): Promise<TemplateItem[]> {
    const res = await fetch(`${BASE_URL}/dashboards/templates?workbench=${encodeURIComponent(workbench)}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to load templates: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: TemplateItem[] };
    return json.data;
}

// ─────────────────────────────────────────────
// Version History
// ─────────────────────────────────────────────

export interface VersionSummary {
    id: string;
    versionNo: number;
    status: string;
    publishedAt?: string;
    publishedBy?: string;
    createdAt: string;
    createdBy: string;
    widgetCount: number;
}

export interface VersionDetail {
    id: string;
    versionNo: number;
    status: string;
    layout: DashboardLayout;
    publishedAt?: string;
    publishedBy?: string;
    createdAt: string;
    createdBy: string;
}

export async function fetchVersionHistory(dashboardId: string): Promise<VersionSummary[]> {
    const res = await fetch(`${BASE_URL}/dashboards/${encodeURIComponent(dashboardId)}/versions`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to load version history: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: VersionSummary[] };
    return json.data;
}

export async function fetchVersion(dashboardId: string, versionId: string): Promise<VersionDetail> {
    const res = await fetch(
        `${BASE_URL}/dashboards/${encodeURIComponent(dashboardId)}/versions/${encodeURIComponent(versionId)}`,
        { credentials: "include" },
    );
    if (!res.ok) throw new Error(`Failed to load version: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: VersionDetail };
    return json.data;
}

export async function rollbackToVersion(dashboardId: string, versionId: string): Promise<{ id: string }> {
    const res = await fetch(
        `${BASE_URL}/dashboards/${encodeURIComponent(dashboardId)}/versions/${encodeURIComponent(versionId)}/rollback`,
        {
            method: "POST",
            credentials: "include",
        },
    );
    if (!res.ok) throw new Error(`Failed to rollback to version: ${res.status}`);
    const json = (await res.json()) as { success: boolean; data: { id: string } };
    return json.data;
}
