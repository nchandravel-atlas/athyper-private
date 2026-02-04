import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { UuidFilterObjectSchema as UuidFilterObjectSchema } from './UuidFilter.schema';
import { StringFilterObjectSchema as StringFilterObjectSchema } from './StringFilter.schema';
import { DateTimeFilterObjectSchema as DateTimeFilterObjectSchema } from './DateTimeFilter.schema'

const tenantwhereinputSchema = z.object({
  AND: z.union([z.lazy(() => TenantWhereInputObjectSchema), z.lazy(() => TenantWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => TenantWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => TenantWhereInputObjectSchema), z.lazy(() => TenantWhereInputObjectSchema).array()]).optional(),
  id: z.union([z.lazy(() => UuidFilterObjectSchema), z.string()]).optional(),
  code: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  status: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  subscription: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  createdAt: z.union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()]).optional(),
  createdBy: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional()
}).strict();
export const TenantWhereInputObjectSchema: z.ZodType<Prisma.TenantWhereInput> = tenantwhereinputSchema as unknown as z.ZodType<Prisma.TenantWhereInput>;
export const TenantWhereInputObjectZodSchema = tenantwhereinputSchema;
