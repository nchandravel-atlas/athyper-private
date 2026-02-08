-- 044_tenant_iam_profile.sql
-- Adds iam_profile JSONB column to tenant_profile for per-tenant security policies.
--
-- Schema:
-- {
--   "mfaRequired": boolean,
--   "allowedMfaTypes": ["totp", "webauthn", "sms", "email"],
--   "maxLoginFailures": number,
--   "lockoutDurationMinutes": number,
--   "passwordPolicy": {
--     "minLength": number,
--     "history": number,
--     "requireUppercase": boolean,
--     "requireLowercase": boolean,
--     "requireDigit": boolean,
--     "requireSpecial": boolean
--   }
-- }

ALTER TABLE core.tenant_profile
    ADD COLUMN IF NOT EXISTS iam_profile JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN core.tenant_profile.iam_profile IS
    'Per-tenant IAM security profile (MFA, password policy, brute-force limits). Platform minimums enforced in application layer.';

-- Index for querying tenants with MFA required
CREATE INDEX IF NOT EXISTS idx_tenant_profile_mfa_required
    ON core.tenant_profile USING btree ((iam_profile->>'mfaRequired'))
    WHERE iam_profile->>'mfaRequired' = 'true';
