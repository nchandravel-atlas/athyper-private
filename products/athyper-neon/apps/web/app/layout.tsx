import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getSessionBootstrap } from "../lib/session-bootstrap";
import { Toaster } from "../components/ui/toaster";

export const metadata: Metadata = {
    title: "Neon",
    description: "athyper Neon Workbench",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const bootstrap = await getSessionBootstrap();
    const cookieStore = await cookies();
    const locale = cookieStore.get("neon_locale")?.value ?? "en";

    return (
        <html lang={locale}>
            <body className="min-h-screen">
                {bootstrap && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `window.__SESSION_BOOTSTRAP__=${JSON.stringify(bootstrap)}`,
                        }}
                    />
                )}
                {children}
                <Toaster />
            </body>
        </html>
    );
}
