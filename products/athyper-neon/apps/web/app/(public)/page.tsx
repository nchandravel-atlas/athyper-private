import Link from "next/link";
import { Card, Button } from "@neon/ui";

export default function PublicHome() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <Card>
        <h1 className="text-2xl font-semibold">Neon</h1>
        <p className="mt-2 text-sm text-black/60">
          Base scaffold: Turborepo + Next.js + Tailwind + Keycloak + Traefik + MinIO + Redis.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
