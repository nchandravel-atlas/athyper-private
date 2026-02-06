import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema as SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { PrincipalOrderByRelationAggregateInputObjectSchema as PrincipalOrderByRelationAggregateInputObjectSchema } from './PrincipalOrderByRelationAggregateInput.schema';
import { GroupOrderByRelationAggregateInputObjectSchema as GroupOrderByRelationAggregateInputObjectSchema } from './GroupOrderByRelationAggregateInput.schema';
import { TenantProfileOrderByWithRelationInputObjectSchema as TenantProfileOrderByWithRelationInputObjectSchema } from './TenantProfileOrderByWithRelationInput.schema';
import { IdpIdentityOrderByRelationAggregateInputObjectSchema as IdpIdentityOrderByRelationAggregateInputObjectSchema } from './IdpIdentityOrderByRelationAggregateInput.schema';
import { GroupMemberOrderByRelationAggregateInputObjectSchema as GroupMemberOrderByRelationAggregateInputObjectSchema } from './GroupMemberOrderByRelationAggregateInput.schema';
import { RoleOrderByRelationAggregateInputObjectSchema as RoleOrderByRelationAggregateInputObjectSchema } from './RoleOrderByRelationAggregateInput.schema';
import { RoleBindingOrderByRelationAggregateInputObjectSchema as RoleBindingOrderByRelationAggregateInputObjectSchema } from './RoleBindingOrderByRelationAggregateInput.schema';
import { OuNodeOrderByRelationAggregateInputObjectSchema as OuNodeOrderByRelationAggregateInputObjectSchema } from './OuNodeOrderByRelationAggregateInput.schema';
import { PrincipalAttributeOrderByRelationAggregateInputObjectSchema as PrincipalAttributeOrderByRelationAggregateInputObjectSchema } from './PrincipalAttributeOrderByRelationAggregateInput.schema';
import { EntitlementSnapshotOrderByRelationAggregateInputObjectSchema as EntitlementSnapshotOrderByRelationAggregateInputObjectSchema } from './EntitlementSnapshotOrderByRelationAggregateInput.schema';
import { PrincipalProfileOrderByRelationAggregateInputObjectSchema as PrincipalProfileOrderByRelationAggregateInputObjectSchema } from './PrincipalProfileOrderByRelationAggregateInput.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  name: SortOrderSchema.optional(),
  status: SortOrderSchema.optional(),
  region: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  subscription: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  createdBy: SortOrderSchema.optional(),
  updatedAt: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  updatedBy: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  principals: z.lazy(() => PrincipalOrderByRelationAggregateInputObjectSchema).optional(),
  groups: z.lazy(() => GroupOrderByRelationAggregateInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileOrderByWithRelationInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityOrderByRelationAggregateInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberOrderByRelationAggregateInputObjectSchema).optional(),
  roles: z.lazy(() => RoleOrderByRelationAggregateInputObjectSchema).optional(),
  roleBindings: z.lazy(() => RoleBindingOrderByRelationAggregateInputObjectSchema).optional(),
  ouNodes: z.lazy(() => OuNodeOrderByRelationAggregateInputObjectSchema).optional(),
  principalAttributes: z.lazy(() => PrincipalAttributeOrderByRelationAggregateInputObjectSchema).optional(),
  entitlementSnapshots: z.lazy(() => EntitlementSnapshotOrderByRelationAggregateInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileOrderByRelationAggregateInputObjectSchema).optional()
}).strict();
export const TenantOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.TenantOrderByWithRelationInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantOrderByWithRelationInput>;
export const TenantOrderByWithRelationInputObjectZodSchema = makeSchema();
