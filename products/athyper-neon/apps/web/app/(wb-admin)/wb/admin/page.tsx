import { Card } from "@neon/ui";

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-3xl p-8 space-y-4">
      <Card>
        <h1 className="text-2xl font-semibold">Admin Workbench</h1>
        <p className="mt-2 text-sm text-black/60">Metadata Studio / Policies / Entities / Governance.</p>
      </Card>
    </main>
  );
}
