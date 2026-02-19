"use client";

// components/shell/UserMenu.tsx
//
// User avatar dropdown in the header bar.
// Replaces TenantSwitcher with a circular avatar showing user initials.
// Contains: profile, subscription, switch tenant, language switcher, logout.

import {
    ArrowLeftRight,
    Check,
    CreditCard,
    Globe,
    LogOut,
    UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMessages } from "@/lib/i18n/messages-context";

import type { SessionBootstrap } from "@/lib/session-bootstrap";

const LOCALES = [
    { code: "en", label: "English", native: "English" },
    { code: "ms", label: "Malay", native: "Bahasa Melayu" },
    { code: "ta", label: "Tamil", native: "தமிழ்" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "ar", label: "Arabic", native: "العربية" },
    { code: "fr", label: "French", native: "Français" },
    { code: "de", label: "German", native: "Deutsch" },
] as const;

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

interface UserMenuProps {
    workbench: string;
}

export function UserMenu({ workbench }: UserMenuProps) {
    const router = useRouter();
    const { t } = useMessages();
    const [bootstrap, setBootstrap] = useState<SessionBootstrap | undefined>(undefined);

    useEffect(() => {
        const bs = (window as unknown as Record<string, unknown>).__SESSION_BOOTSTRAP__ as
            | SessionBootstrap
            | undefined;
        if (bs) setBootstrap(bs);
    }, []);

    const displayName = bootstrap?.displayName ?? "User";
    const persona = bootstrap?.persona ?? "viewer";
    const currentLocale = bootstrap?.locale ?? "en";
    const initials = getInitials(displayName);

    function handleLocaleChange(code: string) {
        if (code === currentLocale) return;
        document.cookie = `neon_locale=${code}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
        window.location.reload();
    }

    async function handleLogout() {
        try {
            const csrfToken = bootstrap?.csrfToken ?? "";
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "x-csrf-token": csrfToken },
            });
            const data = (await res.json()) as { logoutUrl?: string };
            if (data.logoutUrl) {
                window.location.href = data.logoutUrl;
            } else {
                window.location.href = "/login";
            }
        } catch {
            window.location.href = "/login";
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="size-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-2 py-2">
                        <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{displayName}</p>
                            <p className="truncate text-xs capitalize text-muted-foreground">
                                {persona}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push(`/wb/${workbench}/settings/profile`)}>
                        <UserCircle className="mr-2 size-4" />
                        {t("tenant.menu.profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/wb/${workbench}/settings/subscription`)}>
                        <CreditCard className="mr-2 size-4" />
                        {t("tenant.menu.subscription")}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                        <ArrowLeftRight className="mr-2 size-4" />
                        {t("tenant.menu.switch")}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Globe className="mr-2 size-4" />
                        {t("common.header.language")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                        {LOCALES.map(({ code, label, native }) => (
                            <DropdownMenuItem
                                key={code}
                                onClick={() => handleLocaleChange(code)}
                            >
                                <span className="flex-1">
                                    <span className="text-sm">{native}</span>
                                    {native !== label && (
                                        <span className="ml-1.5 text-xs text-muted-foreground">
                                            {label}
                                        </span>
                                    )}
                                </span>
                                {code === currentLocale && (
                                    <Check className="size-3.5 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    {t("common.user.logout")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
