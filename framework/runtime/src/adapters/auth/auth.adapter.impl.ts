import type { JWTPayload } from "jose";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { RuntimeConfig } from "../../kernel/config.schema";
import { getRealmIamConfig } from "../../kernel/tenantContext";
import type { AuthVerifier, AuthAdapter } from "./auth.adapter";
import { AuthAdapterError } from "./auth.adapter";

class KeycloakVerifier implements AuthVerifier {
  private verifyFn: (token: string) => Promise<JWTPayload>;

  constructor(verifyFn: (token: string) => Promise<JWTPayload>) {
    this.verifyFn = verifyFn;
  }

  async verify(token: string): Promise<Record<string, unknown>> {
    try {
      const payload = await this.verifyFn(token);
      return payload as Record<string, unknown>;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AuthAdapterError("JWT_VERIFICATION_FAILED", `Token verification failed: ${msg}`, {
        originalError: msg,
      });
    }
  }
}

export class AuthAdapterImpl implements AuthAdapter {
  private verifierCache = new Map<string, Promise<AuthVerifier>>();
  private readonly config: RuntimeConfig;
  private readonly logger: any;

  constructor(config: RuntimeConfig, logger: any) {
    this.config = config;
    this.logger = logger;
  }

  async getVerifier(realmKey: string): Promise<AuthVerifier> {
    if (!this.verifierCache.has(realmKey)) {
      this.verifierCache.set(
        realmKey,
        (async () => {
          try {
            const realmCfg = getRealmIamConfig(this.config, realmKey);

            // Create JWKS endpoint URL
            const jwksUrl = `${realmCfg.issuerUrl.replace(/\/$/, "")}/protocol/openid-connect/certs`;

            // Create remote JWKS set with HTTP caching
            const jwks = createRemoteJWKSet(new URL(jwksUrl));

            this.logger.debug?.(
              { realmKey, jwksUrl: "[redacted]" },
              "keycloak verifier initialized"
            );

            // Factory for verification
            const verifyFn = async (token: string): Promise<JWTPayload> => {
              const result = await jwtVerify(token, jwks, {
                issuer: realmCfg.issuerUrl,
                audience: realmCfg.clientId,
              });
              return result.payload;
            };

            return new KeycloakVerifier(verifyFn);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new AuthAdapterError(
              "VERIFIER_INIT_FAILED",
              `Failed to initialize verifier for realm ${realmKey}: ${msg}`,
              { realmKey, originalError: msg }
            );
          }
        })()
      );
    }

    return this.verifierCache.get(realmKey)!;
  }

  async warmupRealms(realmKeys: string[]): Promise<void> {
    const results = await Promise.allSettled(
      realmKeys.map((rk) => this.getVerifier(rk))
    );

    const errors = results
      .map((r, i) => (r.status === "rejected" ? { realmKey: realmKeys[i], error: r.reason } : null))
      .filter(Boolean);

    if (errors.length > 0) {
      this.logger.warn?.(
        { errors, warmupCount: realmKeys.length },
        "some realms failed to warmup"
      );
    }
  }

  invalidateRealm(realmKey: string): void {
    this.verifierCache.delete(realmKey);
    this.logger.info?.({ realmKey }, "auth verifier cache invalidated");
  }
}
