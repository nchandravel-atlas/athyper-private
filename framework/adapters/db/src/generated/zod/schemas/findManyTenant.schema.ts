import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { TenantIncludeObjectSchema as TenantIncludeObjectSchema } from './objects/TenantInclude.schema';
import { TenantOrderByWithRelationInputObjectSchema as TenantOrderByWithRelationInputObjectSchema } from './objects/TenantOrderByWithRelationInput.schema';
import { TenantWhereInputObjectSchema as TenantWhereInputObjectSchema } from './objects/TenantWhereInput.schema';
import { TenantWhereUniqueInputObjectSchema as TenantWhereUniqueInputObjectSchema } from './objects/TenantWhereUniqueInput.schema';
import { TenantScalarFieldEnumSchema } from './enums/TenantScalarFieldEnum.schema';

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TenantFindManySelectSchema: z.ZodType<Prisma.TenantSelect> = z.object({
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
    principals: z.boolean().optional(),
    groups: z.boolean().optional(),
    tenantProfile: z.boolean().optional(),
    idpIdentities: z.boolean().optional(),
    groupMembers: z.boolean().optional(),
    roles: z.boolean().optional(),
    roleBindings: z.boolean().optional(),
    ouNodes: z.boolean().optional(),
    principalAttributes: z.boolean().optional(),
    entitlementSnapshots: z.boolean().optional(),
    principalProfiles: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.TenantSelect>;

export const TenantFindManySelectZodSchema = z.object({
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
    principals: z.boolean().optional(),
    groups: z.boolean().optional(),
    tenantProfile: z.boolean().optional(),
    idpIdentities: z.boolean().optional(),
    groupMembers: z.boolean().optional(),
    roles: z.boolean().optional(),
    roleBindings: z.boolean().optional(),
    ouNodes: z.boolean().optional(),
    principalAttributes: z.boolean().optional(),
    entitlementSnapshots: z.boolean().optional(),
    principalProfiles: z.boolean().optional(),
    _count: z.boolean().optional()
  }).strict();

export const TenantFindManySchema: z.ZodType<Prisma.TenantFindManyArgs> = z.object({ select: TenantFindManySelectSchema.optional(), include: z.lazy(() => TenantIncludeObjectSchema.optional()), orderBy: z.union([TenantOrderByWithRelationInputObjectSchema, TenantOrderByWithRelationInputObjectSchema.array()]).optional(), where: TenantWhereInputObjectSchema.optional(), cursor: TenantWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([TenantScalarFieldEnumSchema, TenantScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.TenantFindManyArgs>;

export const TenantFindManyZodSchema = z.object({ select: TenantFindManySelectSchema.optional(), include: z.lazy(() => TenantIncludeObjectSchema.optional()), orderBy: z.union([TenantOrderByWithRelationInputObjectSchema, TenantOrderByWithRelationInputObjectSchema.array()]).optional(), where: TenantWhereInputObjectSchema.optional(), cursor: TenantWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([TenantScalarFieldEnumSchema, TenantScalarFieldEnumSchema.array()]).optional() }).strict();