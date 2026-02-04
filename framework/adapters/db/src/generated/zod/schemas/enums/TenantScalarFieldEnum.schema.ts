import * as z from 'zod';

export const TenantScalarFieldEnumSchema = z.enum(['id', 'code', 'name', 'status', 'subscription', 'createdAt', 'createdBy'])

export type TenantScalarFieldEnum = z.infer<typeof TenantScalarFieldEnumSchema>;