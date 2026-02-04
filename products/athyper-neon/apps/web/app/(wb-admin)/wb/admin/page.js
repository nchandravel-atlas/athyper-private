"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminHome;
var ui_1 = require("@neon/ui");
function AdminHome() {
    return (<main className="mx-auto max-w-3xl p-8 space-y-4">
      <ui_1.Card>
        <h1 className="text-2xl font-semibold">Admin Workbench</h1>
        <p className="mt-2 text-sm text-black/60">Metadata Studio / Policies / Entities / Governance.</p>
      </ui_1.Card>
    </main>);
}
