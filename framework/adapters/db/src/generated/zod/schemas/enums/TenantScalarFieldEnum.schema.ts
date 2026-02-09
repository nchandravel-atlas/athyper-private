import * as z from 'zod';

export const TenantScalarFieldEnumSchema = z.enum(['id', 'code', 'name', 'display_name', 'realm_key', 'status', 'region', 'subscription', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'])

export type TenantScalarFieldEnum = z.infer<typeof TenantScalarFieldEnumSchema>;