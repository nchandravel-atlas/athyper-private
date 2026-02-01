import { z } from "zod";

export const EnvSchema = z.enum(["local", "staging", "prod"]).default("local");
export type Env = z.infer<typeof EnvSchema>;

export const RuntimeModeSchema = z.enum(["api", "worker", "scheduler"]).default("api");
export type RuntimeMode = z.infer<typeof RuntimeModeSchema>;

export const NonEmptyString = z.string().min(1);
export const UrlString = z.string().url();
export const PositiveInt = z.coerce.number().int().positive();
export const BoolCoerce = z.coerce.boolean();
