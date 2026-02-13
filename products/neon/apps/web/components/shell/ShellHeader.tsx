"use client";

// components/shell/ShellHeader.tsx
//
// Header bar for the workbench shell.
// Left: SidebarTrigger + Separator + SearchDialog
// Right: Notification/Help/AI icons + WorkbenchSwitcher + TenantSwitcher

import { CircleHelp, Sparkles } from "lucide-react";
import { useState } from "react";

import { LocaleSwitcher } from "@/components/shell/LocaleSwitcher";
import { TenantSwitcher } from "@/components/shell/TenantSwitcher";
import { ViewportSwitcher } from "@/components/shell/ViewportSwitcher";
import { WorkbenchSwitcher } from "@/components/shell/WorkbenchSwitcher";
import { SearchDialog } from "@/components/sidebar/search-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationBell, NotificationInboxPanel } from "@athyper/ui";
import { useMessages } from "@/lib/i18n/messages-context";
import { useNotifications } from "@/lib/notifications/useNotifications";
import { useNotificationStream } from "@/lib/notifications/useNotificationStream";
import { useUnreadCount } from "@/lib/notifications/useUnreadCount";
import { cn } from "@/lib/utils";

interface ShellHeaderProps {
    workbench: string;
}

export function ShellHeader({ workbench }: ShellHeaderProps) {
    const { t } = useMessages();
    const [inboxOpen, setInboxOpen] = useState(false);

    // Fetch notifications data
    const { count: unreadCount, refresh: refreshCount } = useUnreadCount();
    const {
        notifications,
        isLoading,
        markRead,
        markAllRead,
        dismiss,
        refresh: refreshNotifications,
    } = useNotifications({ limit: 50 });

    // Subscribe to real-time notification events via SSE
    useNotificationStream({
        onNotificationNew: () => {
            // New notification received - refresh count and list
            refreshCount();
            refreshNotifications();
        },
        onNotificationRead: () => {
            // Notification marked as read - refresh count
            refreshCount();
        },
        onNotificationDismissed: () => {
            // Notification dismissed - refresh count
            refreshCount();
        },
    });

    return (
        <header
            className={cn(
                "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
                "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
            )}
        >
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
                {/* Left section: Sidebar trigger + Search */}
                <div className="flex items-center gap-1 lg:gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <SearchDialog />
                    <ViewportSwitcher />
                </div>

                {/* Right section: Icons + Switchers */}
                <div className="flex items-center gap-1">
                    {/* Notifications */}
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
                            // Mark as read when clicked
                            if (!notification.isRead) {
                                markRead(notification.id);
                            }
                            // Close panel
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

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <Sparkles className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("common.header.ai_assistant")}</TooltipContent>
                    </Tooltip>

                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />

                    <LocaleSwitcher />

                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />

                    <WorkbenchSwitcher />

                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />

                    <TenantSwitcher workbench={workbench} />
                </div>
            </div>
        </header>
    );
}
