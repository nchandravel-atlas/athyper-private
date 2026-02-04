import * as z from 'zod';
import type { Prisma } from '@prisma/client';


const makeSchema = () => z.object({
  id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  status: z.string().optional(),
  subscription: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string()
}).strict();
export const TenantCreateInputObjectSchema: z.ZodType<Prisma.TenantCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantCreateInput>;
export const TenantCreateInputObjectZodSchema = makeSchema();
