"use client";

// components/shell/GlobalDrawer.tsx
//
// On-demand overlay navigation drawer.
// Replaces the persistent AppSidebar to give full canvas width to content.
//
// Exports:
//   GlobalDrawerProvider  — React context (open/close state, Ctrl+B shortcut)
//   GlobalDrawerTrigger   — ☰ button that opens the drawer
//   GlobalDrawer          — The Sheet-based overlay drawer

import {
    ArrowLeftRight,
    Check,
    Command,
    CreditCard,
    GitBranch,
    Globe,
    LayoutDashboard,
    LogOut,
    Menu,
    Monitor,
    Moon,
    Package,
    Palette,
    Plug,
    ScrollText,
    Settings,
    Shapes,
    Shield,
    Smartphone,
    Sun,
    SunMoon,
    Tablet,
    UserCircle,
    Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useAuthOptional } from "@/lib/auth/auth-context";
import { WORKBENCH_CONFIGS } from "@/lib/auth/workbench-config";
import { useMessages } from "@/lib/i18n/messages-context";
import { filterNavTree } from "@/lib/nav/filter-nav";
import { useNavTree } from "@/lib/nav/use-nav-tree";
import { applyFont } from "@/lib/preferences/layout-utils";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { applyThemePreset } from "@/lib/preferences/theme-utils";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import type { Workbench } from "@/lib/auth/types";
import type { SessionBootstrap } from "@/lib/session-bootstrap";

// ─── Context ─────────────────────────────────────────────────────────────────

interface GlobalDrawerContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const GlobalDrawerContext = createContext<GlobalDrawerContextValue | null>(null);

export function useGlobalDrawer() {
    const ctx = useContext(GlobalDrawerContext);
    if (!ctx) throw new Error("useGlobalDrawer must be used within GlobalDrawerProvider");
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GlobalDrawerProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);

    // Ctrl+B / Cmd+B to toggle the drawer
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const value = useMemo(() => ({ open, setOpen }), [open]);

    return (
        <GlobalDrawerContext.Provider value={value}>
            {children}
        </GlobalDrawerContext.Provider>
    );
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

export function GlobalDrawerTrigger({ className }: { className?: string }) {
    const { setOpen } = useGlobalDrawer();
    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("size-7", className)}
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
        >
            <Menu className="size-4" />
        </Button>
    );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export interface GlobalDrawerProps {
    workbench: Workbench;
}

export function GlobalDrawer({ workbench }: GlobalDrawerProps) {
    const { open, setOpen } = useGlobalDrawer();
    const pathname = usePathname();

    // Auto-close on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname, setOpen]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
                side="left"
                showCloseButton={false}
                className="w-72 p-0 gap-0 flex flex-col"
            >
                <DrawerHeader workbench={workbench} />
                <ScrollArea className="flex-1">
                    <div className="space-y-1 px-3 py-3">
                        {workbench === "admin" && <MeshAdminSection workbench={workbench} />}
                        <EntitySection workbench={workbench} />
                        <SystemSection workbench={workbench} />
                    </div>
                </ScrollArea>
                <DrawerUser workbench={workbench} />
            </SheetContent>
        </Sheet>
    );
}

// ─── Drawer Header ────────────────────────────────────────────────────────────

function DrawerHeader({ workbench }: { workbench: Workbench }) {
    const config = WORKBENCH_CONFIGS[workbench];
    return (
        <SheetHeader className="flex-row items-center justify-between gap-2 border-b px-4 py-3">
            <SheetTitle className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Command className="size-4" />
                </div>
                <span className="text-sm font-semibold">Neon</span>
                <Badge variant="outline" className="h-5 text-xs capitalize">
                    {config.label}
                </Badge>
            </SheetTitle>
        </SheetHeader>
    );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <p className="px-2 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {children}
        </p>
    );
}

// ─── Mesh Admin Section ───────────────────────────────────────────────────────

const MESH_NAV = [
    { label: "Dashboard", href: "", icon: LayoutDashboard },
    { label: "Meta Studio", href: "/meta-studio", icon: Shapes },
    { label: "Workflow Studio", href: "/workflow-studio", icon: GitBranch },
    { label: "Policy Studio", href: "/policy-studio", icon: Shield },
    { label: "Integration Studio", href: "/integration-studio", icon: Plug },
    { label: "Governance", href: "/governance", icon: ScrollText },
    { label: "Marketplace", href: "/marketplace", icon: Package },
] as const;

function MeshAdminSection({ workbench }: { workbench: Workbench }) {
    const pathname = usePathname();
    const basePath = `/wb/${workbench}/mesh`;

    return (
        <div>
            <Separator />
            <SectionLabel>Mesh Administration</SectionLabel>
            <ul className="space-y-0.5">
                {MESH_NAV.map((item) => {
                    const href = `${basePath}${item.href}`;
                    const isActive =
                        item.href === ""
                            ? pathname === basePath || pathname === `${basePath}/`
                            : pathname.startsWith(href);
                    return (
                        <li key={item.href}>
                            <Link
                                href={href}
                                className={cn(
                                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                                    isActive
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                )}
                            >
                                <item.icon className="size-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

// ─── Entity Quick Access Section ──────────────────────────────────────────────

function EntitySection({ workbench }: { workbench: Workbench }) {
    const [search, setSearch] = useState("");
    const auth = useAuthOptional();
    const csrfToken =
        typeof window !== "undefined"
            ? ((window as unknown as Record<string, unknown>).__SESSION_BOOTSTRAP__ as SessionBootstrap | undefined)?.csrfToken
            : undefined;

    const { tree } = useNavTree(workbench, csrfToken);

    const entities = useMemo(() => {
        if (!tree) return [];
        const filtered = filterNavTree(tree, auth);
        const all = filtered.workspaces.flatMap((ws) =>
            ws.modules.flatMap((mod) => mod.entities),
        );
        // Deduplicate by slug and sort alphabetically
        return [...new Map(all.map((e) => [e.slug, e])).values()].sort((a, b) =>
            a.label.localeCompare(b.label),
        );
    }, [tree, auth]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return entities;
        return entities.filter(
            (e) => e.label.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q),
        );
    }, [entities, search]);

    if (entities.length === 0) return null;

    return (
        <div>
            <Separator />
            <SectionLabel>Quick Access</SectionLabel>
            <Input
                placeholder="Search entities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-1.5 h-7 text-xs"
            />
            {filtered.length > 0 ? (
                <ul className="max-h-48 space-y-0.5 overflow-y-auto">
                    {filtered.map((entity) => (
                        <li key={entity.slug}>
                            <Link
                                href={`/app/${entity.slug}`}
                                className="flex items-center rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                {entity.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                search.trim() && (
                    <p className="px-2 text-xs text-muted-foreground">No entities found.</p>
                )
            )}
        </div>
    );
}

// ─── System Section ───────────────────────────────────────────────────────────

function SystemSection({ workbench }: { workbench: Workbench }) {
    return (
        <div>
            <Separator />
            <SectionLabel>System</SectionLabel>
            <ul className="space-y-0.5">
                <li>
                    <Link
                        href={`/wb/${workbench}/settings`}
                        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <Settings className="size-4 shrink-0" />
                        <span>Settings</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
}

// ─── Drawer User Footer ───────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

const DRAWER_THEME_MODES = [
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

const DRAWER_VIEWPORTS = [
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

function DrawerUser({ workbench }: { workbench: Workbench }) {
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
        setTimeout(() => window.location.reload(), 0);
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
        <div className="border-t p-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-accent">
                        <Avatar className="size-8 shrink-0 rounded-lg">
                            <AvatarFallback className="rounded-lg text-xs">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{displayName}</p>
                            <p className="truncate text-xs capitalize text-muted-foreground">
                                {persona}
                            </p>
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5">
                            <Avatar className="size-8 rounded-lg">
                                <AvatarFallback className="rounded-lg text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
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
                        <DropdownMenuItem onClick={() => router.push(`/wb/${workbench}/settings/debug`)}>
                            <Wrench className="mr-2 size-4" />
                            {t("common.user.diagnostics")}
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
                            {DRAWER_THEME_MODES.map(({ value, icon: Icon, label }) => (
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
                                    {DRAWER_VIEWPORTS.map(({ value, icon: Icon, label }) => (
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
        </div>
    );
}
