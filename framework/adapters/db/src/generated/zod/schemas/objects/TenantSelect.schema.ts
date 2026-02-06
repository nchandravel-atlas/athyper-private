import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { PrincipalFindManySchema as PrincipalFindManySchema } from '../findManyPrincipal.schema';
import { GroupFindManySchema as GroupFindManySchema } from '../findManyGroup.schema';
import { TenantProfileArgsObjectSchema as TenantProfileArgsObjectSchema } from './TenantProfileArgs.schema';
import { IdpIdentityFindManySchema as IdpIdentityFindManySchema } from '../findManyIdpIdentity.schema';
import { GroupMemberFindManySchema as GroupMemberFindManySchema } from '../findManyGroupMember.schema';
import { RoleFindManySchema as RoleFindManySchema } from '../findManyRole.schema';
import { RoleBindingFindManySchema as RoleBindingFindManySchema } from '../findManyRoleBinding.schema';
import { OuNodeFindManySchema as OuNodeFindManySchema } from '../findManyOuNode.schema';
import { PrincipalAttributeFindManySchema as PrincipalAttributeFindManySchema } from '../findManyPrincipalAttribute.schema';
import { EntitlementSnapshotFindManySchema as EntitlementSnapshotFindManySchema } from '../findManyEntitlementSnapshot.schema';
import { PrincipalProfileFindManySchema as PrincipalProfileFindManySchema } from '../findManyPrincipalProfile.schema';
import { TenantCountOutputTypeArgsObjectSchema as TenantCountOutputTypeArgsObjectSchema } from './TenantCountOutputTypeArgs.schema'

const makeSchema = () => z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  name: z.boolean().optional(),
  status: z.boolean().optional(),
  region: z.boolean().optional(),
  subscription: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  createdBy: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  updatedBy: z.boolean().optional(),
  principals: z.union([z.boolean(), z.lazy(() => PrincipalFindManySchema)]).optional(),
  groups: z.union([z.boolean(), z.lazy(() => GroupFindManySchema)]).optional(),
  tenantProfile: z.union([z.boolean(), z.lazy(() => TenantProfileArgsObjectSchema)]).optional(),
  idpIdentities: z.union([z.boolean(), z.lazy(() => IdpIdentityFindManySchema)]).optional(),
  groupMembers: z.union([z.boolean(), z.lazy(() => GroupMemberFindManySchema)]).optional(),
  roles: z.union([z.boolean(), z.lazy(() => RoleFindManySchema)]).optional(),
  roleBindings: z.union([z.boolean(), z.lazy(() => RoleBindingFindManySchema)]).optional(),
  ouNodes: z.union([z.boolean(), z.lazy(() => OuNodeFindManySchema)]).optional(),
  principalAttributes: z.union([z.boolean(), z.lazy(() => PrincipalAttributeFindManySchema)]).optional(),
  entitlementSnapshots: z.union([z.boolean(), z.lazy(() => EntitlementSnapshotFindManySchema)]).optional(),
  principalProfiles: z.union([z.boolean(), z.lazy(() => PrincipalProfileFindManySchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => TenantCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const TenantSelectObjectSchema: z.ZodType<Prisma.TenantSelect> = makeSchema() as unknown as z.ZodType<Prisma.TenantSelect>;
export const TenantSelectObjectZodSchema = makeSchema();
