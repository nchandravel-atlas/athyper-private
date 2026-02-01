import { z } from "zod";
import { EnvSchema, NonEmptyString, PositiveInt, RuntimeModeSchema, UrlString } from "./primitives.js";
import { DbConfigSchema, IamConfigSchema, RedisConfigSchema, S3ConfigSchema, TelemetryConfigSchema } from "./slices.js";

export const RuntimeConfigSchema = z.object({
  env: EnvSchema,
  mode: RuntimeModeSchema,
  serviceName: NonEmptyString.default("athyper-runtime"),
  port: PositiveInt.default(3000),
  publicBaseUrl: UrlString.optional(),
  db: DbConfigSchema,
  iam: IamConfigSchema,
  redis: RedisConfigSchema,
  s3: S3ConfigSchema,
  telemetry: TelemetryConfigSchema,
});

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;
