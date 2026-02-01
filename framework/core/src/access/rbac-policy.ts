import { AccessPolicy, AccessContext } from "./index.js";

export class RbacPolicy implements AccessPolicy {

  can(action: string, resource: string, ctx: AccessContext): boolean {

    // Example rules
    /* if (action === "invoice.create" &&
        ctx.roles.includes("athyper:PLATFORM:SUPER_ADMIN")) {
      return true;
    } */

    return false;
  }
}
