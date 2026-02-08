
interface ShellLayoutProps {
    children: React.ReactNode;
}

/**
 * Unified shell layout for both /wb/* and /app/* routes.
 * Reads sidebar preferences from cookies.
 *
 * Note: AuthProvider is NOT set here because the workbench is not yet known.
 * It is set in the workbench sub-layout (/wb/[wb]/layout.tsx) and
 * entity sub-layout (/app/[entity]/layout.tsx).
 */
export default async function ShellLayout({ children }: ShellLayoutProps) {
    return <>{children}</>;
}
