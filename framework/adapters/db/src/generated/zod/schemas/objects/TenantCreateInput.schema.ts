import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { PrincipalCreateNestedManyWithoutTenantInputObjectSchema as PrincipalCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalCreateNestedManyWithoutTenantInput.schema';
import { GroupCreateNestedManyWithoutTenantInputObjectSchema as GroupCreateNestedManyWithoutTenantInputObjectSchema } from './GroupCreateNestedManyWithoutTenantInput.schema';
import { TenantProfileCreateNestedOneWithoutTenantInputObjectSchema as TenantProfileCreateNestedOneWithoutTenantInputObjectSchema } from './TenantProfileCreateNestedOneWithoutTenantInput.schema';
import { IdpIdentityCreateNestedManyWithoutTenantInputObjectSchema as IdpIdentityCreateNestedManyWithoutTenantInputObjectSchema } from './IdpIdentityCreateNestedManyWithoutTenantInput.schema';
import { GroupMemberCreateNestedManyWithoutTenantInputObjectSchema as GroupMemberCreateNestedManyWithoutTenantInputObjectSchema } from './GroupMemberCreateNestedManyWithoutTenantInput.schema';
import { RoleCreateNestedManyWithoutTenantInputObjectSchema as RoleCreateNestedManyWithoutTenantInputObjectSchema } from './RoleCreateNestedManyWithoutTenantInput.schema';
import { RoleBindingCreateNestedManyWithoutTenantInputObjectSchema as RoleBindingCreateNestedManyWithoutTenantInputObjectSchema } from './RoleBindingCreateNestedManyWithoutTenantInput.schema';
import { OuNodeCreateNestedManyWithoutTenantInputObjectSchema as OuNodeCreateNestedManyWithoutTenantInputObjectSchema } from './OuNodeCreateNestedManyWithoutTenantInput.schema';
import { PrincipalAttributeCreateNestedManyWithoutTenantInputObjectSchema as PrincipalAttributeCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalAttributeCreateNestedManyWithoutTenantInput.schema';
import { EntitlementSnapshotCreateNestedManyWithoutTenantInputObjectSchema as EntitlementSnapshotCreateNestedManyWithoutTenantInputObjectSchema } from './EntitlementSnapshotCreateNestedManyWithoutTenantInput.schema';
import { PrincipalProfileCreateNestedManyWithoutTenantInputObjectSchema as PrincipalProfileCreateNestedManyWithoutTenantInputObjectSchema } from './PrincipalProfileCreateNestedManyWithoutTenantInput.schema';
import { UiDashboardCreateNestedManyWithoutTenantInputObjectSchema as UiDashboardCreateNestedManyWithoutTenantInputObjectSchema } from './UiDashboardCreateNestedManyWithoutTenantInput.schema';
import { UiDashboardVersionCreateNestedManyWithoutTenantInputObjectSchema as UiDashboardVersionCreateNestedManyWithoutTenantInputObjectSchema } from './UiDashboardVersionCreateNestedManyWithoutTenantInput.schema';
import { UiDashboardAclCreateNestedManyWithoutTenantInputObjectSchema as UiDashboardAclCreateNestedManyWithoutTenantInputObjectSchema } from './UiDashboardAclCreateNestedManyWithoutTenantInput.schema'

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
  principals: z.lazy(() => PrincipalCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  groups: z.lazy(() => GroupCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileCreateNestedOneWithoutTenantInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  roles: z.lazy(() => RoleCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  roleBindings: z.lazy(() => RoleBindingCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  ouNodes: z.lazy(() => OuNodeCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principalAttributes: z.lazy(() => PrincipalAttributeCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  entitlementSnapshots: z.lazy(() => EntitlementSnapshotCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  dashboards: z.lazy(() => UiDashboardCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  dashboardVersions: z.lazy(() => UiDashboardVersionCreateNestedManyWithoutTenantInputObjectSchema).optional(),
  dashboardAcls: z.lazy(() => UiDashboardAclCreateNestedManyWithoutTenantInputObjectSchema).optional()
}).strict();
export const TenantCreateInputObjectSchema: z.ZodType<Prisma.TenantCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantCreateInput>;
export const TenantCreateInputObjectZodSchema = makeSchema();
