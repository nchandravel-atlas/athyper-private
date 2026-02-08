import { describe, it, expect } from "vitest";

import { RuntimeConfigSchema } from "./runtime-config.js";

describe("RuntimeConfigSchema", () => {
  it("should validate minimal valid config", () => {
    const config = {
      env: "local",
      mode: "api",
      db: { url: "postgres://localhost/test" },
      redis: { url: "redis://localhost" },
      iam: {
        issuerUrl: "https://auth.example.com/realms/main",
        clientId: "test-client",
      },
      s3: {
        endpoint: "http://localhost:9000",
        accessKey: "minioadmin",
        secretKey: "minioadmin",
      },
      telemetry: {},
    };

    const result = RuntimeConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.env).toBe("local");
      expect(result.data.mode).toBe("api");
      expect(result.data.serviceName).toBe("athyper-runtime"); // default
      expect(result.data.port).toBe(3000); // default
      expect(result.data.telemetry.enabled).toBe(true); // default
    }
  });

  it("should reject invalid environment", () => {
    const config = {
      env: "invalid",
      mode: "api",
      db: { url: "postgres://localhost/test" },
      redis: { url: "redis://localhost" },
      iam: {
        issuerUrl: "https://auth.example.com/realms/main",
        clientId: "test-client",
      },
      s3: {
        endpoint: "http://localhost:9000",
        accessKey: "minioadmin",
        secretKey: "minioadmin",
      },
      telemetry: {},
    };

    const result = RuntimeConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("should reject config without required fields", () => {
    const config = {
      env: "local",
      mode: "api",
    };

    const result = RuntimeConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it("should apply defaults for optional fields", () => {
    const config = {
      env: "prod",
      mode: "worker",
      db: { url: "postgres://localhost/test" },
      redis: { url: "redis://localhost" },
      iam: {
        issuerUrl: "https://auth.example.com",
        clientId: "prod-client",
        clientSecret: "secret",
      },
      s3: {
        endpoint: "https://s3.amazonaws.com",
        accessKey: "AKID",
        secretKey: "secret",
      },
      telemetry: {
        otlpEndpoint: "http://otel-collector:4317",
      },
    };

    const result = RuntimeConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.s3.region).toBe("us-east-1"); // default
      expect(result.data.s3.bucket).toBe("athyper"); // default
      expect(result.data.telemetry.enabled).toBe(true); // default
    }
  });
});
