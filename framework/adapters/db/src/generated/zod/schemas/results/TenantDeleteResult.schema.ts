import * as z from 'zod';
export const TenantDeleteResultSchema = z.nullable(z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: z.string(),
  region: z.string().optional(),
  subscription: z.string(),
  createdAt: z.date(),
  createdBy: z.string(),
  updatedAt: z.date().optional(),
  updatedBy: z.string().optional(),
  principals: z.array(z.unknown()),
  groups: z.array(z.unknown()),
  tenantProfile: z.unknown().optional(),
  idpIdentities: z.array(z.unknown()),
  groupMembers: z.array(z.unknown()),
  roles: z.array(z.unknown()),
  roleBindings: z.array(z.unknown()),
  ouNodes: z.array(z.unknown()),
  principalAttributes: z.array(z.unknown()),
  entitlementSnapshots: z.array(z.unknown()),
  principalProfiles: z.array(z.unknown())
}));