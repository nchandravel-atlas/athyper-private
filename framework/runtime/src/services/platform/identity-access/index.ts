/**
 * Identity & Access Management Module
 *
 * Provides identity mapping, role binding, group sync, and tenant resolution services.
 */

export const moduleCode = "identity-access";
export const moduleName = "Identity & Access Management";

// Services
export { EntitlementSnapshotService } from "./entitlement-snapshot.service.js";
export { GroupSyncService } from "./group-sync.service.js";
export { IdentityMapperService } from "./identity-mapper.service.js";
export { OUMembershipService } from "./ou-membership.service.js";
export { RoleBindingService } from "./role-binding.service.js";
export { TenantResolverService } from "./tenant-resolver.service.js";

// Factory
export { createIAMServices, type IAMServices } from "./iam-factory.service.js";

// Types re-exported from services
export type {
  PrincipalType,
  PrincipalStatus,
  IdpIdentityInfo,
  PrincipalResult,
} from "./identity-mapper.service.js";

export type {
  TenantStatus,
  SubscriptionTier,
  TenantInfo,
  TenantProfileInfo,
} from "./tenant-resolver.service.js";

export type {
  GroupSourceType,
  GroupInfo,
  GroupMemberInfo,
} from "./group-sync.service.js";

export type {
  ScopeKind,
  ScopeMode,
  RoleInfo,
  RoleBindingInfo,
} from "./role-binding.service.js";

export type {
  OUNodeInfo,
  PrincipalAttributeInfo,
} from "./ou-membership.service.js";

export type { EntitlementSnapshot } from "./entitlement-snapshot.service.js";
