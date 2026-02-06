import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { PrincipalUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PrincipalUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalUncheckedCreateNestedManyWithoutTenantInput.schema';
import { GroupUncheckedCreateNestedManyWithoutTenantInputObjectSchema as GroupUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './GroupUncheckedCreateNestedManyWithoutTenantInput.schema';
import { TenantProfileUncheckedCreateNestedOneWithoutTenantInputObjectSchema as TenantProfileUncheckedCreateNestedOneWithoutTenantInputObjectSchema } from './TenantProfileUncheckedCreateNestedOneWithoutTenantInput.schema';
import { IdpIdentityUncheckedCreateNestedManyWithoutTenantInputObjectSchema as IdpIdentityUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './IdpIdentityUncheckedCreateNestedManyWithoutTenantInput.schema';
import { GroupMemberUncheckedCreateNestedManyWithoutTenantInputObjectSchema as GroupMemberUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './GroupMemberUncheckedCreateNestedManyWithoutTenantInput.schema';
import { RoleUncheckedCreateNestedManyWithoutTenantInputObjectSchema as RoleUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './RoleUncheckedCreateNestedManyWithoutTenantInput.schema';
import { RoleBindingUncheckedCreateNestedManyWithoutTenantInputObjectSchema as RoleBindingUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './RoleBindingUncheckedCreateNestedManyWithoutTenantInput.schema';
import { OuNodeUncheckedCreateNestedManyWithoutTenantInputObjectSchema as OuNodeUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './OuNodeUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PrincipalAttributeUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PrincipalAttributeUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalAttributeUncheckedCreateNestedManyWithoutTenantInput.schema';
import { EntitlementSnapshotUncheckedCreateNestedManyWithoutTenantInputObjectSchema as EntitlementSnapshotUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './EntitlementSnapshotUncheckedCreateNestedManyWithoutTenantInput.schema';
import { PrincipalProfileUncheckedCreateNestedManyWithoutTenantInputObjectSchema as PrincipalProfileUncheckedCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalProfileUncheckedCreateNestedManyWithoutTenantInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  status: z.string().optional(),
  region: z.string().optional().nullable(),
  subscription: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string(),
  updatedAt: z.coerce.date().optional().nullable(),
  updatedBy: z.string().optional().nullable(),
  principals: z.lazy(() => PrincipalUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  groups: z.lazy(() => GroupUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileUncheckedCreateNestedOneWithoutTenantInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  roles: z.lazy(() => RoleUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  roleBindings: z.lazy(() => RoleBindingUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  ouNodes: z.lazy(() => OuNodeUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principalAttributes: z.lazy(() => PrincipalAttributeUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entitlementSnapshots: z.lazy(() => EntitlementSnapshotUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileUncheckedCreateNestedManyWithoutTenantInputObjectSchema).optional()
}).strict();
export const TenantUncheckedCreateInputObjectSchema: z.ZodType<Prisma.TenantUncheckedCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantUncheckedCreateInput>;
export const TenantUncheckedCreateInputObjectZodSchema = makeSchema();
