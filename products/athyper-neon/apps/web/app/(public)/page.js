"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PublicHome;
var link_1 = require("next/link");
var ui_1 = require("@neon/ui");
function PublicHome() {
    return (<main className="mx-auto max-w-xl p-8">
      <ui_1.Card>
        <h1 className="text-2xl font-semibold">Neon</h1>
        <p className="mt-2 text-sm text-black/60">
          Base scaffold: Turborepo + Next.js + Tailwind + Keycloak + Traefik + MinIO + Redis.
        </p>
        <div className="mt-6 flex gap-3">
          <link_1.default href="/login">
            <ui_1.Button>Go to Login</ui_1.Button>
          </link_1.default>
          <link_1.default href="/dashboard">
            <ui_1.Button variant="ghost">Dashboard</ui_1.Button>
          </link_1.default>
        </div>
      </ui_1.Card>
    </main>);
}
