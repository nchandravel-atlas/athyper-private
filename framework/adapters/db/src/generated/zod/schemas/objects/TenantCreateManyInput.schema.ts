import * as z from 'zod';
import type { Prisma } from '@prisma/client';


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
  updatedBy: z.string().optional().nullable()
}).strict();
export const TenantCreateManyInputObjectSchema: z.ZodType<Prisma.TenantCreateManyInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantCreateManyInput>;
export const TenantCreateManyInputObjectZodSchema = makeSchema();
