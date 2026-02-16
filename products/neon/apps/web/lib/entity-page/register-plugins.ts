// lib/entity-page/register-plugins.ts
//
// Registers built-in entity page tab plugins.
// Import this file once at app startup (e.g., in a root layout or provider)
// to make lifecycle + approvals tabs available.

import { LifecycleTab } from "@/components/entity-page/LifecycleTab";
import { ApprovalsTab } from "@/components/entity-page/ApprovalsTab";

import { registerTabPlugin } from "./plugin-registry";
import { documentsTabPlugin } from "./plugins/documents-plugin";

let registered = false;

export function registerBuiltInPlugins(): void {
  if (registered) return;
  registered = true;

  registerTabPlugin({
    code: "lifecycle",
    component: LifecycleTab,
  });

  registerTabPlugin({
    code: "approvals",
    component: ApprovalsTab,
  });

  registerTabPlugin(documentsTabPlugin);
}
