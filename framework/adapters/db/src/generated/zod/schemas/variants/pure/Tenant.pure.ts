import * as z from 'zod';
// prettier-ignore
export const TenantModelSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    status: z.string(),
    region: z.string().nullable(),
    subscription: z.string(),
    createdAt: z.date(),
    createdBy: z.string(),
    updatedAt: z.date().nullable(),
    updatedBy: z.string().nullable(),
    principals: z.array(z.unknown()),
    groups: z.array(z.unknown()),
    tenantProfile: z.unknown().nullable(),
    idpIdentities: z.array(z.unknown()),
    groupMembers: z.array(z.unknown()),
    roles: z.array(z.unknown()),
    roleBindings: z.array(z.unknown()),
    ouNodes: z.array(z.unknown()),
    principalAttributes: z.array(z.unknown()),
    entitlementSnapshots: z.array(z.unknown()),
    principalProfiles: z.array(z.unknown())
}).strict();

export type TenantPureType = z.infer<typeof TenantModelSchema>;
