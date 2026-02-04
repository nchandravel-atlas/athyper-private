import * as z from 'zod';
// prettier-ignore
export const TenantModelSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    status: z.string(),
    subscription: z.string(),
    createdAt: z.date(),
    createdBy: z.string()
}).strict();

export type TenantPureType = z.infer<typeof TenantModelSchema>;
