"use client";

// components/shell/TenantSwitcher.tsx
//
// Tenant dropdown in the header bar.
// Shows tenant initials/logo with dropdown for profile, subscription, and future multi-tenant switching.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, UserCircle, CreditCard, ArrowLeftRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { SessionBootstrap } from "@/lib/session-bootstrap";
import { useMessages } from "@/lib/i18n/messages-context";

function getTenantInitials(tenantId: string): string {
    return tenantId.slice(0, 2).toUpperCase();
}

interface TenantSwitcherProps {
    workbench: string;
}

export function TenantSwitcher({ workbench }: TenantSwitcherProps) {
    const router = useRouter();
    const { t } = useMessages();
    const [bootstrap, setBootstrap] = useState<SessionBootstrap | undefined>(undefined);

    useEffect(() => {
        const bs = (window as any).__SESSION_BOOTSTRAP__ as SessionBootstrap | undefined;
        if (bs) setBootstrap(bs);
    }, []);

    const tenantId = bootstrap?.tenantId ?? "default";
    const initials = getTenantInitials(tenantId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                    <Avatar className="size-5 rounded">
                        <AvatarFallback className="rounded text-[10px] bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-xs">{tenantId}</span>
                    <ChevronsUpDown className="size-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push(`/wb/${workbench}/settings/profile`)}>
                    <UserCircle className="mr-2 size-4" />
                    {t("tenant.menu.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/wb/${workbench}/settings/subscription`)}>
                    <CreditCard className="mr-2 size-4" />
                    {t("tenant.menu.subscription")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <ArrowLeftRight className="mr-2 size-4" />
                    {t("tenant.menu.switch")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
