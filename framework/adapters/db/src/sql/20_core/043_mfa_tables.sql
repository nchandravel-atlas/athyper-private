/* ============================================================================
   Athyper — CORE: MFA (Multi-Factor Authentication)
   TOTP, WebAuthn, backup codes, trusted devices, tenant MFA policies.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: MFA Configuration per Principal
-- ============================================================================

create table if not exists core.mfa_config (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  mfa_type        text not null default 'totp',
  totp_secret     text,
  recovery_email  text,

  is_enabled      boolean not null default false,
  is_verified     boolean not null default false,

  enabled_at      timestamptz,
  verified_at     timestamptz,
  last_used_at    timestamptz,

  metadata        jsonb,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz,

  constraint mfa_config_type_chk
    check (mfa_type in ('totp', 'webauthn', 'sms', 'email')),
  constraint mfa_config_uniq unique (principal_id, mfa_type)
);

comment on table core.mfa_config is
'MFA configuration per principal (TOTP, WebAuthn, SMS, email).';

create index if not exists idx_mfa_config_principal
  on core.mfa_config (principal_id);

create index if not exists idx_mfa_config_tenant
  on core.mfa_config (tenant_id);

create index if not exists idx_mfa_config_enabled
  on core.mfa_config (is_enabled) where is_enabled = true;

-- ============================================================================
-- CORE: Backup Codes (one-time use recovery codes)
-- ============================================================================

create table if not exists core.mfa_backup_code (
  id              uuid primary key default gen_random_uuid(),
  mfa_config_id   uuid not null references core.mfa_config(id) on delete cascade,

  code_hash       text not null,

  is_used         boolean not null default false,
  used_at         timestamptz,
  used_ip         text,
  used_user_agent text,

  created_at      timestamptz not null default now()
);

comment on table core.mfa_backup_code is
'One-time use backup codes for MFA recovery (bcrypt hashed).';

create index if not exists idx_mfa_backup_code_config
  on core.mfa_backup_code (mfa_config_id);

create index if not exists idx_mfa_backup_code_unused
  on core.mfa_backup_code (mfa_config_id) where is_used = false;

-- ============================================================================
-- CORE: MFA Challenges (pending verification during login)
-- ============================================================================

create table if not exists core.mfa_challenge (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  challenge_token text not null unique,

  session_id      text,
  ip_address      text,
  user_agent      text,

  is_completed    boolean not null default false,
  completed_at    timestamptz,

  attempt_count   integer not null default 0,
  max_attempts    integer not null default 5,
  locked_until    timestamptz,

  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);

comment on table core.mfa_challenge is
'Pending MFA verification challenges during login flow.';

create index if not exists idx_mfa_challenge_principal
  on core.mfa_challenge (principal_id);

create index if not exists idx_mfa_challenge_token
  on core.mfa_challenge (challenge_token);

create index if not exists idx_mfa_challenge_expires
  on core.mfa_challenge (expires_at) where is_completed = false;

-- ============================================================================
-- CORE: MFA Audit Log (append-only security events)
-- ============================================================================

create table if not exists core.mfa_audit_log (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  event_type      text not null,

  mfa_type        text,
  ip_address      text,
  user_agent      text,
  geo_location    text,

  details         jsonb,
  correlation_id  text,

  created_at      timestamptz not null default now(),

  constraint mfa_audit_event_type_chk check (event_type in (
    'mfa_enrolled',
    'mfa_verified',
    'mfa_disabled',
    'mfa_login_success',
    'mfa_login_failure',
    'backup_code_used',
    'backup_codes_regenerated',
    'recovery_initiated',
    'recovery_completed',
    'challenge_locked',
    'suspicious_activity'
  ))
);

comment on table core.mfa_audit_log is
'Append-only security audit log for MFA events.';

create index if not exists idx_mfa_audit_principal
  on core.mfa_audit_log (principal_id, created_at desc);

create index if not exists idx_mfa_audit_tenant
  on core.mfa_audit_log (tenant_id, created_at desc);

create index if not exists idx_mfa_audit_event
  on core.mfa_audit_log (event_type, created_at desc);

-- ============================================================================
-- CORE: Trusted Devices ("remember this device")
-- ============================================================================

create table if not exists core.mfa_trusted_device (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  device_id       text not null,
  device_name     text,
  device_type     text,

  trust_token_hash text not null,

  last_used_at    timestamptz,
  last_ip         text,

  expires_at      timestamptz not null,
  is_revoked      boolean not null default false,
  revoked_at      timestamptz,

  metadata        jsonb,

  created_at      timestamptz not null default now(),

  constraint mfa_trusted_device_uniq unique (principal_id, device_id)
);

comment on table core.mfa_trusted_device is
'Devices trusted to skip MFA verification (with expiry and revocation).';

create index if not exists idx_mfa_trusted_device_principal
  on core.mfa_trusted_device (principal_id);

create index if not exists idx_mfa_trusted_device_token
  on core.mfa_trusted_device (trust_token_hash);

create index if not exists idx_mfa_trusted_device_active
  on core.mfa_trusted_device (expires_at)
  where is_revoked = false;

-- ============================================================================
-- CORE: Tenant MFA Policy (enforcement rules)
-- ============================================================================

create table if not exists core.mfa_policy (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  scope_type      text not null,
  scope_ref       text,

  is_required     boolean not null default false,
  allowed_methods text[] not null default array['totp'],
  grace_period_days integer default 7,

  allow_trusted_devices boolean not null default true,
  trusted_device_expiry_days integer default 30,
  backup_codes_count integer not null default 10,

  config          jsonb,
  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,

  constraint mfa_policy_scope_type_chk
    check (scope_type in ('tenant', 'role', 'group')),
  constraint mfa_policy_uniq unique (tenant_id, scope_type, scope_ref)
);

comment on table core.mfa_policy is
'Tenant-level MFA enforcement policies (tenant-wide, per role, per group).';

create index if not exists idx_mfa_policy_tenant
  on core.mfa_policy (tenant_id);

create index if not exists idx_mfa_policy_scope
  on core.mfa_policy (scope_type, scope_ref);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Check if MFA is required for a principal (fixed: joins through core.role)
create or replace function core.is_mfa_required(p_principal_id uuid, p_tenant_id uuid)
returns boolean as $$
declare
  v_required boolean := false;
begin
  -- check tenant-wide policy first
  select is_required into v_required
  from core.mfa_policy
  where tenant_id = p_tenant_id
    and scope_type = 'tenant'
    and scope_ref is null;

  if v_required then
    return true;
  end if;

  -- check role-based policies (join role_binding → role → mfa_policy via role_code)
  if exists (
    select 1
    from core.mfa_policy mp
    join core.role r on r.role_code = mp.scope_ref
    join core.role_binding rb on rb.role_id = r.id
    where mp.tenant_id = p_tenant_id
      and mp.scope_type = 'role'
      and rb.principal_id = p_principal_id
      and rb.is_active = true
      and mp.is_required = true
  ) then
    return true;
  end if;

  -- check group-based policies (join group_member → group → mfa_policy via group_id)
  if exists (
    select 1
    from core.mfa_policy mp
    join core."group" g on g.id::text = mp.scope_ref
    join core.group_member gm on gm.group_id = g.id
    where mp.tenant_id = p_tenant_id
      and mp.scope_type = 'group'
      and gm.principal_id = p_principal_id
      and gm.is_active = true
      and mp.is_required = true
  ) then
    return true;
  end if;

  return false;
end;
$$ language plpgsql stable;

comment on function core.is_mfa_required(uuid, uuid) is
'Check if MFA is required for a principal based on tenant, role, and group policies.';

-- Cleanup expired challenges (to be run periodically)
create or replace function core.cleanup_expired_mfa_challenges()
returns integer as $$
declare
  v_count integer;
begin
  delete from core.mfa_challenge
  where expires_at < now()
    and is_completed = false;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql;

comment on function core.cleanup_expired_mfa_challenges() is
'Cleanup expired MFA challenges. Run periodically via scheduler.';

-- Cleanup expired / revoked trusted devices
create or replace function core.cleanup_expired_trusted_devices()
returns integer as $$
declare
  v_count integer;
begin
  delete from core.mfa_trusted_device
  where expires_at < now()
    or is_revoked = true;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql;

comment on function core.cleanup_expired_trusted_devices() is
'Cleanup expired or revoked trusted devices. Run periodically via scheduler.';
