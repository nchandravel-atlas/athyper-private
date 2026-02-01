/**
 * Access Control Module 
 */

export * from "./rbac-policy.js";

export type AccessContext = {
  userId: string;
  tenantId: string;
  roles: string[];
};

export interface AccessPolicy {
  can(
    action: string,
    resource: string,
    ctx: AccessContext
  ): boolean | Promise<boolean>;
}
