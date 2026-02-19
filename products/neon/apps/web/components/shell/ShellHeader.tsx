"use client";

// components/shell/ShellHeader.tsx
//
// Header bar for the workbench shell (SAP Business Network style).
// Left:  ⌘ Neon | ☰ | Workbench ▼ | Test Mode badge
// Right: Search | Tier + Upgrade | 📢 🔔 ❓ | User avatar

import { CircleHelp, Command, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { GlobalDrawerTrigger } from "@/components/shell/GlobalDrawer";
import { UserMenu } from "@/components/shell/UserMenu";
import { WorkbenchSwitcher } from "@/components/shell/WorkbenchSwitcher";
import { SearchDialog } from "@/components/sidebar/search-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationBell, NotificationInboxPanel } from "@athyper/ui";
import { useMessages } from "@/lib/i18n/messages-context";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { useNotificationStream } from "@/lib/notifications/useNotificationStream";
import { useUnreadCount } from "@/lib/notifications/useUnreadCount";
import { cn } from "@/lib/utils";

import type { SessionBootstrap } from "@/lib/session-bootstrap";

interface ShellHeaderProps {
    workbench: string;
}

export function ShellHeader({ workbench }: ShellHeaderProps) {
    const { t } = useMessages();
    const [inboxOpen, setInboxOpen] = useState(false);
    const [bootstrap, setBootstrap] = useState<SessionBootstrap | undefined>(undefined);

    useEffect(() => {
        const bs = (window as unknown as Record<string, unknown>).__SESSION_BOOTSTRAP__ as
            | SessionBootstrap
            | undefined;
        if (bs) setBootstrap(bs);
    }, []);

    const environment = bootstrap?.environment ?? null;
    const subscriptionTier = bootstrap?.subscriptionTier ?? "Standard";

    const { count: unreadCount, refresh: refreshCount } = useUnreadCount();
    const {
        notifications,
        isLoading,
        markRead,
        markAllRead,
        dismiss,
        refresh: refreshNotifications,
    } = useNotifications({ limit: 50 });

    useNotificationStream({
        onNotificationNew: () => {
            refreshCount();
            refreshNotifications();
        },
        onNotificationRead: () => {
            refreshCount();
        },
        onNotificationDismissed: () => {
            refreshCount();
        },
    });

    return (
        <header
            className={cn(
                "flex h-12 shrink-0 items-center gap-2 border-b",
                "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
            )}
        >
            <div className="flex w-full items-center px-4 lg:px-6">
                {/* ── Left: Brand + Drawer + Workbench + Test Mode ── */}
                <div className="flex items-center gap-2">
                    <Link href={`/wb/${workbench}/home`} className="flex items-center gap-2">
                        <Command className="size-4 text-primary" />
                        <span className="text-sm font-semibold tracking-tight">Neon</span>
                    </Link>

                    <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />

                    <GlobalDrawerTrigger />

                    <WorkbenchSwitcher />

                    {environment !== null && environment !== "production" && (
                        <Badge
                            variant="secondary"
                            className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800"
                        >
                            {t("common.header.test_mode")}
                        </Badge>
                    )}
                </div>

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Right: Search + Tier + Icons + User ── */}
                <div className="flex items-center gap-1">
                    <SearchDialog />

                    <span className="hidden sm:inline text-sm text-muted-foreground px-2">
                        {subscriptionTier}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        asChild
                    >
                        <Link href={`/wb/${workbench}/settings/subscription`}>
                            {t("common.header.upgrade")}
                        </Link>
                    </Button>

                    <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <Megaphone className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("common.header.announcements")}</TooltipContent>
                    </Tooltip>

                    <NotificationBell
                        unreadCount={unreadCount}
                        onClick={() => setInboxOpen(true)}
                        tooltipContent={t("common.header.notifications")}
                    />
                    <NotificationInboxPanel
                        open={inboxOpen}
                        onOpenChange={setInboxOpen}
                        notifications={notifications}
                        isLoading={isLoading}
                        unreadCount={unreadCount}
                        onMarkRead={markRead}
                        onMarkAllRead={markAllRead}
                        onDismiss={dismiss}
                        onNotificationClick={(notification) => {
                            if (!notification.isRead) markRead(notification.id);
                            setInboxOpen(false);
                        }}
                    />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <CircleHelp className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("common.header.help")}</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />

                    <UserMenu workbench={workbench} />
                </div>
            </div>
        </header>
    );
}
