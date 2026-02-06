import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { UuidFilterObjectSchema as UuidFilterObjectSchema } from './UuidFilter.schema';
import { StringFilterObjectSchema as StringFilterObjectSchema } from './StringFilter.schema';
import { StringNullableFilterObjectSchema as StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { DateTimeFilterObjectSchema as DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { DateTimeNullableFilterObjectSchema as DateTimeNullableFilterObjectSchema } from './DateTimeNullableFilter.schema';
import { PrincipalListRelationFilterObjectSchema as PrincipalListRelationFilterObjectSchema } from './PrincipalListRelationFilter.schema';
import { GroupListRelationFilterObjectSchema as GroupListRelationFilterObjectSchema } from './GroupListRelationFilter.schema';
import { TenantProfileNullableScalarRelationFilterObjectSchema as TenantProfileNullableScalarRelationFilterObjectSchema } from './TenantProfileNullableScalarRelationFilter.schema';
import { TenantProfileWhereInputObjectSchema as TenantProfileWhereInputObjectSchema } from './TenantProfileWhereInput.schema';
import { IdpIdentityListRelationFilterObjectSchema as IdpIdentityListRelationFilterObjectSchema } from './IdpIdentityListRelationFilter.schema';
import { GroupMemberListRelationFilterObjectSchema as GroupMemberListRelationFilterObjectSchema } from './GroupMemberListRelationFilter.schema';
import { RoleListRelationFilterObjectSchema as RoleListRelationFilterObjectSchema } from './RoleListRelationFilter.schema';
import { RoleBindingListRelationFilterObjectSchema as RoleBindingListRelationFilterObjectSchema } from './RoleBindingListRelationFilter.schema';
import { OuNodeListRelationFilterObjectSchema as OuNodeListRelationFilterObjectSchema } from './OuNodeListRelationFilter.schema';
import { PrincipalAttributeListRelationFilterObjectSchema as PrincipalAttributeListRelationFilterObjectSchema } from './PrincipalAttributeListRelationFilter.schema';
import { EntitlementSnapshotListRelationFilterObjectSchema as EntitlementSnapshotListRelationFilterObjectSchema } from './EntitlementSnapshotListRelationFilter.schema';
import { PrincipalProfileListRelationFilterObjectSchema as PrincipalProfileListRelationFilterObjectSchema } from './PrincipalProfileListRelationFilter.schema'

const tenantwhereinputSchema = z.object({
  AND: z.union([z.lazy(() => TenantWhereInputObjectSchema), z.lazy(() => TenantWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => TenantWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => TenantWhereInputObjectSchema), z.lazy(() => TenantWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => UuidFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  status: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  region: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  subscription: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  createdBy: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  updatedAt: z.union([z.lazy(() => DateTimeNullableFilterObjectSchema), z.coerce.date()]).optional().nullable(),
  updatedBy: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  principals: z.lazy(() => PrincipalListRelationFilterObjectSchema).optional(),
  groups: z.lazy(() => GroupListRelationFilterObjectSchema).optional(),
  tenantProfile: z.union([z.lazy(() => TenantProfileNullableScalarRelationFilterObjectSchema), z.lazy(() => TenantProfileWhereInputObjectSchema)]).optional(),
  idpIdentities: z.lazy(() => IdpIdentityListRelationFilterObjectSchema).optional(),
  groupMembers: z.lazy(() => GroupMemberListRelationFilterObjectSchema).optional(),
  roles: z.lazy(() => RoleListRelationFilterObjectSchema).optional(),
  roleBindings: z.lazy(() => RoleBindingListRelationFilterObjectSchema).optional(),
  ouNodes: z.lazy(() => OuNodeListRelationFilterObjectSchema).optional(),
  principalAttributes: z.lazy(() => PrincipalAttributeListRelationFilterObjectSchema).optional(),
  entitlementSnapshots: z.lazy(() => EntitlementSnapshotListRelationFilterObjectSchema).optional(),
  principalProfiles: z.lazy(() => PrincipalProfileListRelationFilterObjectSchema).optional()
}).strict();
export const TenantWhereInputObjectSchema: z.ZodType<Prisma.TenantWhereInput> = tenantwhereinputSchema as unknown as z.ZodType<Prisma.TenantWhereInput>;
export const TenantWhereInputObjectZodSchema = tenantwhereinputSchema;
