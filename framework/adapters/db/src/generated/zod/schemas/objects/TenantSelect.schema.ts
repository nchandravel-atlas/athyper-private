import * as z from 'zod';
import type { Prisma } from '@prisma/client';


const makeSchema = () => z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  name: z.boolean().optional(),
  status: z.boolean().optional(),
  subscription: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  createdBy: z.boolean().optional()
}).strict();
export const TenantSelectObjectSchema: z.ZodType<Prisma.TenantSelect> = makeSchema() as unknown as z.ZodType<Prisma.TenantSelect>;
export const TenantSelectObjectZodSchema = makeSchema();
