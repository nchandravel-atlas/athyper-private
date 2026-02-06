import * as z from 'zod';
import type { Prisma } from '@prisma/client';


const makeSchema = () => z.object({
  id: z.literal(true).optional(),
  code: z.literal(true).optional(),
  name: z.literal(true).optional(),
  status: z.literal(true).optional(),
  region: z.literal(true).optional(),
  subscription: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  createdBy: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  updatedBy: z.literal(true).optional()
}).strict();
export const TenantMinAggregateInputObjectSchema: z.ZodType<Prisma.TenantMinAggregateInputType> = makeSchema() as unknown as z.ZodType<Prisma.TenantMinAggregateInputType>;
export const TenantMinAggregateInputObjectZodSchema = makeSchema();
