import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { TenantSelectObjectSchema as TenantSelectObjectSchema } from './TenantSelect.schema'

const makeSchema = () => z.object({
  select: z.lazy(() => TenantSelectObjectSchema).optional()
}).strict();
export const TenantArgsObjectSchema = makeSchema();
export const TenantArgsObjectZodSchema = makeSchema();
