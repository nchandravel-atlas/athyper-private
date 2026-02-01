export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export interface TelemetryLogger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export interface TelemetryAdapter {
  /**
   * Get scoped logger instance (per-request/job).
   */
  getLogger(scopeId: string): TelemetryLogger;

  /**
   * Export pending spans/metrics (OTel SDK).
   */
  flush(): Promise<void>;

  /**
   * Shutdown telemetry backend.
   */
  shutdown(): Promise<void>;
}

export class TelemetryAdapterError extends Error {
  readonly code: string;
  readonly meta?: Record<string, unknown>;

  constructor(code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
