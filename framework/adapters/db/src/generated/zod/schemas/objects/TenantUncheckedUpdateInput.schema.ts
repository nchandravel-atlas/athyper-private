import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StringFieldUpdateOperationsInputObjectSchema as StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema as NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema as DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema as NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { PrincipalUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { GroupUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as GroupUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './GroupUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { TenantProfileUncheckedUpdateOneWithoutTenantNestedInputObjectSchema as TenantProfileUncheckedUpdateOneWithoutTenantNestedInputObjectSchema } from './TenantProfileUncheckedUpdateOneWithoutTenantNestedInput.schema';
import { IdpIdentityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as IdpIdentityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './IdpIdentityUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { GroupMemberUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as GroupMemberUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './GroupMemberUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { RoleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as RoleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './RoleUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { RoleBindingUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as RoleBindingUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './RoleBindingUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { OuNodeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as OuNodeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './OuNodeUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalAttributeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalAttributeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalAttributeUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { EntitlementSnapshotUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as EntitlementSnapshotUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './EntitlementSnapshotUncheckedUpdateManyWithoutTenantNestedInput.schema';
import { PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInputObjectSchema as PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInputObjectSchema } from './PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInput.schema'

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
  principals: z.lazy(() => PrincipalUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  groups: z.lazy(() => GroupUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  tenantProfile: z.lazy(() => TenantProfileUncheckedUpdateOneWithoutTenantNestedInputObjectSchema).optional(),
  idpIdentities: z.lazy(() => IdpIdentityUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  roles: z.lazy(() => RoleUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  roleBindings: z.lazy(() => RoleBindingUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  ouNodes: z.lazy(() => OuNodeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principalAttributes: z.lazy(() => PrincipalAttributeUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  entitlementSnapshots: z.lazy(() => EntitlementSnapshotUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileUncheckedUpdateManyWithoutTenantNestedInputObjectSchema).optional()
}).strict();
export const TenantUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.TenantUncheckedUpdateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantUncheckedUpdateInput>;
export const TenantUncheckedUpdateInputObjectZodSchema = makeSchema();
