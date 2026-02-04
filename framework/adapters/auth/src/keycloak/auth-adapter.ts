// Keycloak OIDC Auth Adapter (minimal stub)

export interface AuthAdapterConfig {
  issuerUrl: string;
  clientId: string;
  clientSecret: string;
}

export interface AuthAdapter {
  verifyToken(token: string): Promise<any>;
  getIssuerUrl(): string;
}

export function createAuthAdapter(config: AuthAdapterConfig): AuthAdapter {
  return {
    async verifyToken(token: string) {
      // Stub: Real implementation would verify JWT against JWKS
      console.log(JSON.stringify({ msg: "auth_verify_token_stub", issuer: config.issuerUrl }));
      return { sub: "stub-user", verified: false };
    },
    getIssuerUrl() {
      return config.issuerUrl;
    },
  };
}
