import { describe, it, expect } from "vitest";
import { RuntimeConfigSchema } from "./config.schema.js";

describe("RuntimeConfigSchema", () => {
  it("should validate minimal valid config", () => {
    const config = {
      env: "local",
      mode: "api",
      db: { url: "postgres://localhost/test" },
      redis: { url: "redis://localhost" },
      iam: {
        strategy: "single_realm",
        defaultRealmKey: "main",
        realms: {
          main: {
            iam: {
              issuerUrl: "https://auth.example.com/realms/main",
              clientId: "test-client",
              clientSecretRef: "TEST_SECRET"
            }
          }
        },
      },
    };

    const result = RuntimeConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.env).toBe("local");
      expect(result.data.mode).toBe("api");
    }
  });

  it("should reject invalid environment", () => {
    const config = {
      env: "invalid",
      mode: "api",
      db: { url: "postgres://localhost/test" },
      redis: { url: "redis://localhost" },
      iam: {
        strategy: "single_realm",
        defaultRealmKey: "main",
        realms: {},
      },
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
});
