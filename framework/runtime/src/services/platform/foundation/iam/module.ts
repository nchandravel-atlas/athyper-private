import { createAuthAdapter } from "../../../../adapters/auth/auth.adapter";
import { createJoseVerifier } from "../../../../adapters/auth/jose.verifier";

c.register(
    TOKENS.auth,
    createAuthAdapter(async (realmCfg) => {
        return createJoseVerifier({
            issuerUrl: realmCfg.issuerUrl,
            clientId: realmCfg.clientId,
            allowedAlgs: ["RS256"],
        });
    }),
    "singleton",
);