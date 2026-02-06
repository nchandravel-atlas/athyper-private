import "./globals.css";
import type { Metadata } from "next";
import { getSessionBootstrap } from "../lib/session-bootstrap";

export const metadata: Metadata = {
    title: "Neon",
    description: "athyper Neon Workbench",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const bootstrap = await getSessionBootstrap();

    return (
        <html lang="en">
            <body className="min-h-screen">
                {bootstrap && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `window.__SESSION_BOOTSTRAP__=${JSON.stringify(bootstrap)}`,
                        }}
                    />
                )}
                {children}
            </body>
        </html>
    );
}
