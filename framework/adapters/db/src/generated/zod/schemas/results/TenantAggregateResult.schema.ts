import * as z from 'zod';
export const TenantAggregateResultSchema = z.object({  _count: z.object({
    id: z.number(),
    code: z.number(),
    name: z.number(),
    status: z.number(),
    subscription: z.number(),
    createdAt: z.number(),
    createdBy: z.number()
  }).optional(),
  _min: z.object({
    id: z.string().nullable(),
    code: z.string().nullable(),
    name: z.string().nullable(),
    status: z.string().nullable(),
    subscription: z.string().nullable(),
    createdAt: z.date().nullable(),
    createdBy: z.string().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    code: z.string().nullable(),
    name: z.string().nullable(),
    status: z.string().nullable(),
    subscription: z.string().nullable(),
    createdAt: z.date().nullable(),
    createdBy: z.string().nullable()
  }).nullable().optional()});