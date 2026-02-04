import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { TenantSelectObjectSchema as TenantSelectObjectSchema } from './objects/TenantSelect.schema';
import { TenantWhereUniqueInputObjectSchema as TenantWhereUniqueInputObjectSchema } from './objects/TenantWhereUniqueInput.schema';

export const TenantFindUniqueOrThrowSchema: z.ZodType<Prisma.TenantFindUniqueOrThrowArgs> = z.object({ select: TenantSelectObjectSchema.optional(),  where: TenantWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.TenantFindUniqueOrThrowArgs>;

export const TenantFindUniqueOrThrowZodSchema = z.object({ select: TenantSelectObjectSchema.optional(),  where: TenantWhereUniqueInputObjectSchema }).strict();