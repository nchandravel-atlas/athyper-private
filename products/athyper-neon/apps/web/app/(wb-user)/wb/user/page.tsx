import { Card } from "@neon/ui";

export default function UserHome() {
  return (
    <main className="mx-auto max-w-3xl p-8 space-y-4">
      <Card>
        <h1 className="text-2xl font-semibold">User Workbench</h1>
        <p className="mt-2 text-sm text-black/60">Tasks / approvals / operational pages.</p>
      </Card>
    </main>
  );
}
