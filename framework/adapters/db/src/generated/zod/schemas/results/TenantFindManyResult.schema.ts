import * as z from 'zod';
export const TenantFindManyResultSchema = z.object({
  data: z.array(z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: z.string(),
  subscription: z.string(),
  createdAt: z.date(),
  createdBy: z.string()
})),
  pagination: z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean()
})
});