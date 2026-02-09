import * as z from 'zod';
// prettier-ignore
export const TenantInputSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
    status: z.string(),
    region: z.string().optional().nullable(),
    subscription: z.string(),
    createdAt: z.date(),
    createdBy: z.string(),
    updatedAt: z.date().optional().nullable(),
    updatedBy: z.string().optional().nullable(),
    principals: z.array(z.unknown()),
    groups: z.array(z.unknown()),
    tenantProfile: z.unknown().optional().nullable(),
    idpIdentities: z.array(z.unknown()),
    groupMembers: z.array(z.unknown()),
    roles: z.array(z.unknown()),
    roleBindings: z.array(z.unknown()),
    ouNodes: z.array(z.unknown()),
    principalAttributes: z.array(z.unknown()),
    entitlementSnapshots: z.array(z.unknown()),
    principalProfiles: z.array(z.unknown()),
    dashboards: z.array(z.unknown()),
    dashboardVersions: z.array(z.unknown()),
    dashboardAcls: z.array(z.unknown())
}).strict();

export type TenantInputType = z.infer<typeof TenantInputSchema>;
