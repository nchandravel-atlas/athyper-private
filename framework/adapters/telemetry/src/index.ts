import pino, { type Logger, type LoggerOptions } from "pino";

export type TelemetryLogger = Logger;

export type CreateLoggerOptions = {
  name?: string;
  level?: string;
  base?: Record<string, unknown>;
  pino?: LoggerOptions;
};

export function createLogger(opts: CreateLoggerOptions = {}): TelemetryLogger {
  const { name, level, base, pino: pinoOpts } = opts;

  return pino({
    name,
    level,
    base,
    ...pinoOpts
  });
}
