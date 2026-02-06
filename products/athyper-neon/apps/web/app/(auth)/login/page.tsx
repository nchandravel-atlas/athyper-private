"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button, Select } from "@neon/ui";

type WorkbenchType = "admin" | "user" | "partner";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  const [workbench, setWorkbench] = useState<WorkbenchType>("admin");

  function handleLogin() {
    const params = new URLSearchParams({
      workbench,
      returnUrl,
    });
    window.location.href = `/api/auth/login?${params.toString()}`;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center p-8">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-black/60">
          Choose a workbench and sign in with your identity provider.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Type of Workbench</label>
            <Select value={workbench} onChange={(e) => setWorkbench(e.target.value as WorkbenchType)}>
              <option value="admin">Admin Workbench</option>
              <option value="user">User Workbench</option>
              <option value="partner">Partner Workbench</option>
            </Select>
            <p className="mt-1 text-xs text-black/50">
              This selection controls the dashboard redirect (you can later derive it from Keycloak roles).
            </p>
          </div>

          {errorParam && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorParam}</div>
          )}

          <div className="flex gap-3">
            <Button type="button" onClick={handleLogin}>
              Sign in with Keycloak
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                const res = await fetch("/api/auth/logout", { method: "POST" });
                const data = await res.json();
                if (data.logoutUrl) {
                  window.location.href = data.logoutUrl;
                } else {
                  window.location.reload();
                }
              }}
            >
              Clear Session
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
