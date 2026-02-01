"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Button, Select } from "@neon/ui";

type WorkbenchType = "admin" | "user" | "partner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin1");
  const [password, setPassword] = useState("admin1");
  const [workbench, setWorkbench] = useState<WorkbenchType>("admin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, workbench })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center p-8">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-black/60">Enter your credentials and choose a workbench.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">User ID</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. user1" />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div>
            <label className="text-sm font-medium">Type of Workbench</label>
            <Select value={workbench} onChange={(e) => setWorkbench(e.target.value as any)}>
              <option value="admin">Admin Workbench</option>
              <option value="user">User Workbench</option>
              <option value="partner">Partner Workbench</option>
            </Select>
            <p className="mt-1 text-xs text-black/50">
              This selection controls the dashboard redirect (you can later derive it from Keycloak roles).
            </p>
          </div>

          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.refresh();
              }}
            >
              Clear Session
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
