import * as z from 'zod';
import type { Prisma } from '@prisma/client';


const makeSchema = () => z.object({
  id: z.literal(true).optional(),
  code: z.literal(true).optional(),
  name: z.literal(true).optional(),
  display_name: z.literal(true).optional(),
  realm_key: z.literal(true).optional(),
  status: z.literal(true).optional(),
  region: z.literal(true).optional(),
  subscription: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  createdBy: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  updatedBy: z.literal(true).optional()
}).strict();
export const TenantMaxAggregateInputObjectSchema: z.ZodType<Prisma.TenantMaxAggregateInputType> = makeSchema() as unknown as z.ZodType<Prisma.TenantMaxAggregateInputType>;
export const TenantMaxAggregateInputObjectZodSchema = makeSchema();
