"use client";

// components/entity-page/EntityPageShell.tsx
//
// Universal entity page container. Fetches static + dynamic descriptors
// from the backend and renders badges, actions, tabs using only the
// descriptor output. "React is a renderer."

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button, Card, Separator } from "@neon/ui";

import { Skeleton } from "@/components/ui/skeleton";
import { useEntityPageDescriptor } from "@/lib/entity-page/use-entity-page-descriptor";
import { useEntityAction } from "@/lib/entity-page/use-entity-action";
import { registerBuiltInPlugins } from "@/lib/entity-page/register-plugins";
import { EntityBadgeStrip } from "./EntityBadgeStrip";
import { EntityActionBar } from "./EntityActionBar";
import { EntityTabBar } from "./EntityTabBar";

import type { SessionBootstrap } from "@/lib/session-bootstrap";
import type { ViewMode } from "@/lib/entity-page/types";

interface EntityPageShellProps {
  entityName: string;
  entityId: string;
  initialViewMode?: ViewMode;
}

function getCsrfToken(): string {
  if (typeof window === "undefined") return "";
  const bootstrap = (window as any).__SESSION_BOOTSTRAP__ as SessionBootstrap | undefined;
  return bootstrap?.csrfToken ?? "";
}

// Register built-in tab plugins (lifecycle, approvals)
registerBuiltInPlugins();

export function EntityPageShell({ entityName, entityId, initialViewMode }: EntityPageShellProps) {
  const {
    staticDescriptor,
    dynamicDescriptor,
    loading,
    error,
    refresh,
  } = useEntityPageDescriptor(entityName, entityId, initialViewMode);

  const { execute: executeAction, loading: actionLoading } = useEntityAction(
    entityName,
    entityId,
    refresh, // Refresh descriptors after successful action
  );

  const [activeTab, setActiveTab] = useState("details");
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);

  // Fetch entity record data for the details tab
  useEffect(() => {
    let cancelled = false;

    async function fetchRecord() {
      try {
        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = {};
        if (csrfToken) headers["x-csrf-token"] = csrfToken;

        const res = await fetch(
          `/api/data/${encodeURIComponent(entityName)}/${encodeURIComponent(entityId)}`,
          { headers, credentials: "same-origin" },
        );
        if (!res.ok) return;
        const body = (await res.json()) as { data?: Record<string, unknown> };
        if (!cancelled && body.data) {
          setRecord(body.data);
        }
      } catch {
        // Record fetch is best-effort; descriptor still works without it
      }
    }

    fetchRecord();
    return () => { cancelled = true; };
  }, [entityName, entityId]);

  const handleAction = useCallback(
    (actionCode: string) => {
      executeAction(actionCode);
    },
    [executeAction],
  );

  // ---- Loading State ----
  if (loading && !staticDescriptor) {
    return <EntityPageSkeleton />;
  }

  // ---- Error State ----
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="size-5" />
          <div>
            <p className="font-medium">Failed to load entity page</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button variant="ghost" className="mt-4" onClick={refresh}>
          <RefreshCw className="size-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  if (!staticDescriptor || !dynamicDescriptor) {
    return <EntityPageSkeleton />;
  }

  // ---- Main Render ----
  return (
    <div className="space-y-4">
      {/* Header: badges + actions */}
      <div className="flex items-center justify-between">
        <EntityBadgeStrip badges={dynamicDescriptor.badges} />
        <div className="flex items-center gap-2">
          <EntityActionBar
            actions={dynamicDescriptor.actions}
            onAction={handleAction}
            disabled={actionLoading}
          />
          <Button variant="ghost" onClick={refresh} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* View mode downgrade notice */}
      {dynamicDescriptor.viewModeReason && dynamicDescriptor.viewModeReason !== "ok" && (
        <ViewModeNotice reason={dynamicDescriptor.viewModeReason} />
      )}

      <Separator />

      {/* Tabs */}
      <EntityTabBar
        tabs={staticDescriptor.tabs}
        sections={staticDescriptor.sections}
        record={record}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        entityName={entityName}
        entityId={entityId}
        staticDescriptor={staticDescriptor}
        dynamicDescriptor={dynamicDescriptor}
      />
    </div>
  );
}

// ---- Skeleton ----

function EntityPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

// ---- View Mode Notice ----

const reasonMessages: Record<string, string> = {
  policy_denied: "You do not have permission to edit this record.",
  terminal_state: "This record is in a terminal state and cannot be edited.",
  approval_pending: "This record has a pending approval and cannot be edited.",
  approval_rejected: "The approval for this record was rejected.",
  approval_canceled: "The approval for this record was canceled.",
};

function ViewModeNotice({ reason }: { reason: string }) {
  const message = reasonMessages[reason] ?? "This record is read-only.";

  return (
    <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
