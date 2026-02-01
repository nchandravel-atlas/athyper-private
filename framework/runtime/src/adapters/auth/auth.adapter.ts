export interface AuthVerifier {
  /**
   * Verify and decode a JWT token; return decoded claims.
   */
  verify(token: string): Promise<Record<string, unknown>>;
}

export interface AuthAdapter {
  /**
   * Get a realm-scoped verifier (cached per realm).
   */
  getVerifier(realmKey: string): Promise<AuthVerifier>;

  /**
   * Warm up verifier caches (e.g., during boot).
   */
  warmupRealms(realmKeys: string[]): Promise<void>;

  /**
   * Invalidate a realm's verifier cache (for JWKS key rotation).
   */
  invalidateRealm(realmKey: string): void;
}

export class AuthAdapterError extends Error {
  readonly code: string;
  readonly meta?: Record<string, unknown>;

  constructor(code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
