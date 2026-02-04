import * as z from 'zod';
export const TenantFindUniqueResultSchema = z.nullable(z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: z.string(),
  subscription: z.string(),
  createdAt: z.date(),
  createdBy: z.string()
}));