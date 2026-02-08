import { z } from "zod";

import { BoolCoerce, NonEmptyString, PositiveInt, UrlString } from "./primitives.js";

export const DbConfigSchema = z.object({
  url: NonEmptyString,
  poolMax: PositiveInt.default(10),
});
export type DbConfig = z.infer<typeof DbConfigSchema>;

export const IamConfigSchema = z.object({
  issuerUrl: UrlString,
  clientId: NonEmptyString,
  clientSecret: NonEmptyString.optional(),
});
export type IamConfig = z.infer<typeof IamConfigSchema>;

export const RedisConfigSchema = z.object({
  url: NonEmptyString,
});
export type RedisConfig = z.infer<typeof RedisConfigSchema>;

export const S3ConfigSchema = z.object({
  endpoint: NonEmptyString,
  accessKey: NonEmptyString,
  secretKey: NonEmptyString,
  region: NonEmptyString.default("us-east-1"),
  bucket: NonEmptyString.default("athyper"),
  useSSL: BoolCoerce.default(false),
});
export type S3Config = z.infer<typeof S3ConfigSchema>;

export const TelemetryConfigSchema = z.object({
  otlpEndpoint: NonEmptyString.optional(),
  enabled: BoolCoerce.default(true),
});
export type TelemetryConfig = z.infer<typeof TelemetryConfigSchema>;
