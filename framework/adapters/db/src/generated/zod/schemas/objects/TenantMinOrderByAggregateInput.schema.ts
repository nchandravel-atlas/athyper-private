import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  name: SortOrderSchema.optional(),
  status: SortOrderSchema.optional(),
  region: SortOrderSchema.optional(),
  subscription: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  createdBy: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  updatedBy: SortOrderSchema.optional()
}).strict();
export const TenantMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.TenantMinOrderByAggregateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantMinOrderByAggregateInput>;
export const TenantMinOrderByAggregateInputObjectZodSchema = makeSchema();
