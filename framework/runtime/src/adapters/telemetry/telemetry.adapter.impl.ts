import pino, { type Logger } from "pino";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { TelemetryAdapter, TelemetryLogger } from "./telemetry.adapter";
import { TelemetryAdapterError } from "./telemetry.adapter";

class PinoTelemetryLogger implements TelemetryLogger {
  constructor(private pinoLogger: Logger) {}

  log(level: string, message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger[level as any](meta ?? {}, message);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.warn(meta ?? {}, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.error(meta ?? {}, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.debug(meta ?? {}, message);
  }
}

export class TelemetryAdapterImpl implements TelemetryAdapter {
  private rootLogger: Logger;
  private loggerCache = new Map<string, TelemetryLogger>();
  private otelExporter: any = null;

  private constructor(rootLogger: Logger, otelExporter?: any) {
    this.rootLogger = rootLogger;
    this.otelExporter = otelExporter;
  }

  static async create(config: RuntimeConfig): Promise<TelemetryAdapter> {
    const logLevel = config.logLevel ?? "info";

    // Create root Pino logger
    let transport: any = undefined;

    if (process.env.NODE_ENV === "development") {
      try {
        // Optional: use pino-pretty in dev, but don't fail if not installed
        transport = pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        });
      } catch {
        // pino-pretty not installed, use default transport
      }
    }

    const rootLogger = pino(
      {
        level: logLevel,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label: string) => ({ level: label }),
        },
      },
      transport
    );

    // Optional: Initialize OTel exporter
    let otelExporter: any = null;
    if (config.telemetry?.enabled && config.telemetry?.otlpEndpoint) {
      try {
        // Example: Using @opentelemetry/sdk-node (requires additional setup)
        // For now, we log the endpoint for future integration
        rootLogger.info(
          { otlpEndpoint: "[redacted]" },
          "otel exporter would be configured here"
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TelemetryAdapterError(
          "OTEL_INIT_FAILED",
          `Failed to initialize OTel exporter: ${msg}`
        );
      }
    }

    return new TelemetryAdapterImpl(rootLogger, otelExporter);
  }

  getLogger(scopeId: string): TelemetryLogger {
    if (!this.loggerCache.has(scopeId)) {
      // Create a child logger with scope ID in all logs
      const childLogger = this.rootLogger.child({ scopeId });
      this.loggerCache.set(scopeId, new PinoTelemetryLogger(childLogger));
    }
    return this.loggerCache.get(scopeId)!;
  }

  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.rootLogger.flush(() => resolve());
    });
  }

  async shutdown(): Promise<void> {
    await this.flush();
    // Optional: shutdown OTel exporter
    if (this.otelExporter?.shutdown) {
      await this.otelExporter.shutdown();
    }
  }
}
