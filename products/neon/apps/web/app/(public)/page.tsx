import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Command } from "lucide-react";

export default async function PublicLandingPage() {
    const cookieStore = await cookies();
    const sid = cookieStore.get("neon_sid")?.value;

    // If user has a session, redirect to workbench home
    if (sid) {
        redirect("/wb/home");
    }

    return (
        <div className="flex h-dvh flex-col items-center justify-center bg-background">
            <div className="space-y-8 text-center">
                <div className="flex items-center justify-center gap-3">
                    <Command className="size-10 text-primary" />
                    <h1 className="text-4xl font-light tracking-tight">Neon</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                    Enterprise Platform
                </p>
                <Link
                    href="/login"
                    className="inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Sign In
                </Link>
            </div>
        </div>
    );
}
