import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  name: SortOrderSchema.optional(),
  status: SortOrderSchema.optional(),
  subscription: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  createdBy: SortOrderSchema.optional()
}).strict();
export const TenantCountOrderByAggregateInputObjectSchema: z.ZodType<Prisma.TenantCountOrderByAggregateInput> = makeSchema() as unknown as z.ZodType<Prisma.TenantCountOrderByAggregateInput>;
export const TenantCountOrderByAggregateInputObjectZodSchema = makeSchema();
