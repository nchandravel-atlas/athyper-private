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
    Monitor,
    Moon,
    Palette,
    Smartphone,
    Sun,
    SunMoon,
    Tablet,
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
import { applyFont } from "@/lib/preferences/layout-utils";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { applyThemePreset } from "@/lib/preferences/theme-utils";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import type { SessionBootstrap } from "@/lib/session-bootstrap";

const THEME_MODES = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
];

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTHS: Record<Viewport, number | null> = {
    desktop: null,
    tablet: 768,
    mobile: 375,
};

const VIEWPORTS = [
    { value: "desktop" as const, icon: Monitor, label: "Desktop" },
    { value: "tablet" as const, icon: Tablet, label: "Tablet (768px)" },
    { value: "mobile" as const, icon: Smartphone, label: "Mobile (375px)" },
];

function applyViewport(viewport: Viewport) {
    const container = document.querySelector<HTMLElement>('[data-slot="shell-container"]');
    if (!container) return;
    const width = VIEWPORT_WIDTHS[viewport];
    if (width === null) {
        container.style.removeProperty("max-width");
        container.style.removeProperty("margin-left");
        container.style.removeProperty("margin-right");
        container.style.removeProperty("border-left");
        container.style.removeProperty("border-right");
        container.style.removeProperty("transition");
    } else {
        container.style.setProperty("max-width", `${width}px`, "important");
        container.style.setProperty("margin-left", "auto", "important");
        container.style.setProperty("margin-right", "auto", "important");
        container.style.setProperty("border-left", "1px dashed oklch(0.7 0 0 / 30%)");
        container.style.setProperty("border-right", "1px dashed oklch(0.7 0 0 / 30%)");
        container.style.setProperty("transition", "max-width 0.3s ease");
    }
}

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
    const themeMode = usePreferencesStore((s) => s.themeMode);
    const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
    const resolvedThemeMode = usePreferencesStore((s) => s.resolvedThemeMode);
    const themePreset = usePreferencesStore((s) => s.themePreset);
    const setThemePreset = usePreferencesStore((s) => s.setThemePreset);
    const setFont = usePreferencesStore((s) => s.setFont);
    const [viewport, setViewport] = useState<Viewport>("desktop");
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

    function handleThemeChange(mode: ThemeMode) {
        setThemeMode(mode);
        persistPreference("theme_mode", mode);
    }

    function handlePresetChange(preset: ThemePreset) {
        applyThemePreset(preset);
        setThemePreset(preset);
        persistPreference("theme_preset", preset);

        const presetFont = THEME_PRESET_OPTIONS.find((p) => p.value === preset)?.font;
        if (presetFont) {
            applyFont(presetFont);
            setFont(presetFont);
            persistPreference("font", presetFont);
        }
    }

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
                {/* ── Theme Preset Palette ── */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Palette className="mr-2 size-4" />
                        {t("common.header.palette")}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                        {THEME_PRESET_OPTIONS.map((preset) => {
                            const isActive = themePreset === preset.value;
                            const colors =
                                (resolvedThemeMode ?? "light") === "dark"
                                    ? preset.swatch.dark
                                    : preset.swatch.light;
                            return (
                                <DropdownMenuItem
                                    key={preset.value}
                                    onClick={() => handlePresetChange(preset.value as ThemePreset)}
                                >
                                    <span className="mr-2 inline-grid size-7 shrink-0 grid-cols-2 overflow-hidden rounded-lg">
                                        {colors.map((c, i) => (
                                            <span key={i} style={{ backgroundColor: c }} />
                                        ))}
                                    </span>
                                    <span className="flex-1 text-sm">{preset.label}</span>
                                    {isActive && (
                                        <Check className="size-3.5 text-primary" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                {/* ── Theme Mode ── */}
                <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="flex items-center gap-2 text-sm">
                        <SunMoon className="size-4 text-muted-foreground" />
                        {t("common.header.theme")}
                    </span>
                    <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
                        {THEME_MODES.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                type="button"
                                aria-label={label}
                                title={label}
                                onClick={() => handleThemeChange(value)}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-md p-1.5 transition-all",
                                    themeMode === value
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <Icon className="size-3.5" />
                            </button>
                        ))}
                    </div>
                </div>
                {process.env.NODE_ENV === "development" && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="flex items-center justify-between px-2 py-1.5">
                            <span className="flex items-center gap-2 text-sm">
                                <Monitor className="size-4 text-muted-foreground" />
                                Viewport
                            </span>
                            <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
                                {VIEWPORTS.map(({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-label={label}
                                        title={label}
                                        onClick={() => {
                                            setViewport(value);
                                            applyViewport(value);
                                        }}
                                        className={cn(
                                            "inline-flex items-center justify-center rounded-md p-1.5 transition-all",
                                            viewport === value
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="size-3.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    {t("common.user.logout")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
