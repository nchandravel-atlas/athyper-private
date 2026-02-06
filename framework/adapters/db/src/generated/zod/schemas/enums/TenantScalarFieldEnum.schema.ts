import * as z from 'zod';

export const TenantScalarFieldEnumSchema = z.enum(['id', 'code', 'name', 'status', 'region', 'subscription', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'])

export type TenantScalarFieldEnum = z.infer<typeof TenantScalarFieldEnumSchema>;