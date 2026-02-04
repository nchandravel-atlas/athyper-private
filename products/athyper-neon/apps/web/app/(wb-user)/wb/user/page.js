"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UserHome;
var ui_1 = require("@neon/ui");
function UserHome() {
    return (<main className="mx-auto max-w-3xl p-8 space-y-4">
      <ui_1.Card>
        <h1 className="text-2xl font-semibold">User Workbench</h1>
        <p className="mt-2 text-sm text-black/60">Tasks / approvals / operational pages.</p>
      </ui_1.Card>
    </main>);
}
