import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StringFieldUpdateOperationsInputObjectSchema as StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema as NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema as DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema as NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { PrincipalUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalUpdateManyWithoutTenantNestedInput.schema';
import { GroupUpdateManyWithoutTenantNestedInputObjectSchema as GroupUpdateManyWithoutTenantNestedInputObjectSchema } from './GroupUpdateManyWithoutTenantNestedInput.schema';
import { TenantProfileUpdateOneWithoutTenantNestedInputObjectSchema as TenantProfileUpdateOneWithoutTenantNestedInputObjectSchema } from './TenantProfileUpdateOneWithoutTenantNestedInput.schema';
import { IdpIdentityUpdateManyWithoutTenantNestedInputObjectSchema as IdpIdentityUpdateManyWithoutTenantNestedInputObjectSchema } from './IdpIdentityUpdateManyWithoutTenantNestedInput.schema';
import { GroupMemberUpdateManyWithoutTenantNestedInputObjectSchema as GroupMemberUpdateManyWithoutTenantNestedInputObjectSchema } from './GroupMemberUpdateManyWithoutTenantNestedInput.schema';
import { RoleUpdateManyWithoutTenantNestedInputObjectSchema as RoleUpdateManyWithoutTenantNestedInputObjectSchema } from './RoleUpdateManyWithoutTenantNestedInput.schema';
import { RoleBindingUpdateManyWithoutTenantNestedInputObjectSchema as RoleBindingUpdateManyWithoutTenantNestedInputObjectSchema } from './RoleBindingUpdateManyWithoutTenantNestedInput.schema';
import { OuNodeUpdateManyWithoutTenantNestedInputObjectSchema as OuNodeUpdateManyWithoutTenantNestedInputObjectSchema } from './OuNodeUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalAttributeUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalAttributeUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalAttributeUpdateManyWithoutTenantNestedInput.schema';
import { EntitlementSnapshotUpdateManyWithoutTenantNestedInputObjectSchema as EntitlementSnapshotUpdateManyWithoutTenantNestedInputObjectSchema } from './EntitlementSnapshotUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalProfileUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalProfileUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalProfileUpdateManyWithoutTenantNestedInput.schema';
import { UiDashboardUpdateManyWithoutTenantNestedInputObjectSchema as UiDashboardUpdateManyWithoutTenantNestedInputObjectSchema } from './UiDashboardUpdateManyWithoutTenantNestedInput.schema';
import { UiDashboardVersionUpdateManyWithoutTenantNestedInputObjectSchema as UiDashboardVersionUpdateManyWithoutTenantNestedInputObjectSchema } from './UiDashboardVersionUpdateManyWithoutTenantNestedInput.schema';
import { UiDashboardAclUpdateManyWithoutTenantNestedInputObjectSchema as UiDashboardAclUpdateManyWithoutTenantNestedInputObjectSchema } from './UiDashboardAclUpdateManyWithoutTenantNestedInput.schema'

const makeSchema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  code: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  region: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  subscription: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdBy: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  updatedBy: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  principals: z.lazy(() => PrincipalUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  groups: z.lazy(() => GroupUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileUpdateOneWithoutTenantNestedInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  roles: z.lazy(() => RoleUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  roleBindings: z.lazy(() => RoleBindingUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  ouNodes: z.lazy(() => OuNodeUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principalAttributes: z.lazy(() => PrincipalAttributeUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entitlementSnapshots: z.lazy(() => EntitlementSnapshotUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  dashboards: z.lazy(() => UiDashboardUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  dashboardVersions: z.lazy(() => UiDashboardVersionUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  dashboardAcls: z.lazy(() => UiDashboardAclUpdateManyWithoutTenantNestedInputObjectSchema).optional()
}).strict();
export const TenantUpdateInputObjectSchema: z.ZodType<Prisma.TenantUpdateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantUpdateInput>;
export const TenantUpdateInputObjectZodSchema = makeSchema();
