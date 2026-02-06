"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@neon/ui";
import { useIdleTracker } from "../../../../lib/idle-tracker";
import { useSessionRefresh } from "../../../../lib/auth-refresh";

interface RefreshTokenMeta {
  type: string;
  expiresAt: string | null;
  isExpired: boolean | null;
  remainingSeconds: number | null;
  issuer: string | null;
  keycloakSid: string | null;
}

interface AudiencePolicy {
  aud: unknown;
  azp: unknown;
  enforcement: string;
  note: string;
  grantedScopes: string[];
  requiredScopes: string[];
  missingScopes: string[];
  scopeCheck: "pass" | "fail";
}

interface TenantCheck {
  requestTenantId: string;
  sessionTenantId: string | null;
  tenantSource: string;
  validated: boolean;
  note: string;
}

interface RefreshStrategy {
  refreshTrigger: "auto" | "immediate" | "blocked" | "disabled";
  refreshExecutionStatus: "scheduled" | "awaiting_client" | "blocked" | "locked" | "unavailable";
  refreshBlockedReason: string | null;
  refreshMode: "proactive";
  refreshThresholdSec: number;
  shouldRefreshNow: boolean;
  lastRefreshAt: string | null;
  refreshAttempts: number;
  refreshLocked: boolean;
  refreshValid: boolean;
  refreshTokenPresent: boolean;
  refreshTokenExpired: boolean | null;
  refreshTokenRemaining: number | null;
  note: string;
}

interface JwksStatus {
  reachable: boolean;
  uri: string;
  keyCount: number;
  fetchLatencyMs: number | null;
  lastError: string | null;
}

interface DebugData {
  session: Record<string, unknown>;
  keycloak: Record<string, unknown>;
  audiencePolicy: AudiencePolicy;
  tenantCheck: TenantCheck;
  jwt: {
    header: Record<string, unknown> | null;
    payload: Record<string, unknown> | null;
    signaturePresent: boolean;
    redacted: boolean;
  };
  refreshToken: RefreshTokenMeta | null;
  refreshStrategy: RefreshStrategy;
  jwksStatus: JwksStatus;
  redis: Record<string, unknown>;
  serverTime: string;
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {badge && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{badge}</span>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-800">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function KvRow({ label, value }: { label: string; value: unknown }) {
  const display = value === null || value === undefined ? "—" : String(value);
  return (
    <div className="flex gap-2 py-1 text-sm">
      <span className="min-w-[160px] font-medium text-gray-600">{label}</span>
      <span className="font-mono text-gray-900 break-all">{display}</span>
    </div>
  );
}

function SessionStateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    idle_warning: "bg-orange-100 text-orange-800",
    idle_expired: "bg-red-100 text-red-800",
    revoked: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[state] ?? "bg-gray-100 text-gray-600"}`}>
      {state}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, string> = {
    healthy: "bg-green-100 text-green-800",
    degraded: "bg-yellow-100 text-yellow-800",
    reauth_required: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[verdict] ?? "bg-gray-100 text-gray-600"}`}>
      {verdict}
    </span>
  );
}

function ExecutionStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    awaiting_client: "bg-yellow-100 text-yellow-800",
    blocked: "bg-red-100 text-red-800",
    locked: "bg-red-100 text-red-800",
    unavailable: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function TokenStateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    valid: "bg-green-100 text-green-800",
    expiring: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[state] ?? "bg-gray-100 text-gray-600"}`}>
      {state}
    </span>
  );
}

function CountdownBadge({ label, seconds }: { label: string; seconds: number | null }) {
  if (seconds === null) return null;
  const color = seconds <= 0 ? "text-red-600" : seconds <= 120 ? "text-yellow-600" : "text-green-600";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  return (
    <div className="flex gap-2 py-1 text-sm">
      <span className="min-w-[160px] font-medium text-gray-600">{label}</span>
      <span className={`font-mono font-semibold ${color}`}>{display}</span>
    </div>
  );
}

function ValidationBadge({ ok }: { ok: boolean }) {
  return ok
    ? <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">validated</span>
    : <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">MISMATCH</span>;
}

function formatCountdown(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AdminHome() {
  const [data, setData] = useState<DebugData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showWarning, idleRemaining, staySignedIn } = useIdleTracker();

  async function fetchDebug() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/debug", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setData(await res.json());
    } catch (err: any) {
      setError(err?.message ?? "Failed to load debug info");
    } finally {
      setLoading(false);
    }
  }

  // Proactive token refresh: fires at accessExpiresAt - 90s, reloads debug data on success
  const { refresh: manualRefresh } = useSessionRefresh({ onRefreshSuccess: fetchDebug });

  useEffect(() => { fetchDebug(); }, []);

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-4">
      {/* Idle Warning Banner */}
      {showWarning && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">&#9888;</span>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Session expires in {formatCountdown(idleRemaining)} due to inactivity
                </p>
                <p className="text-xs text-orange-600">
                  Move your mouse or click &quot;Stay signed in&quot; to keep your session active.
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={staySignedIn}>
              Stay signed in
            </Button>
          </div>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Workbench</h1>
            <p className="mt-1 text-sm text-black/60">Session &amp; Authentication Debug Console</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={fetchDebug} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                const res = await fetch("/api/auth/logout", { method: "POST" });
                const data = await res.json();
                if (data.logoutUrl) {
                  window.location.href = data.logoutUrl;
                } else {
                  window.location.href = "/login";
                }
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {data && (
        <>
          {/* Session Info */}
          <Section title="Session" badge={data.session.sessionSource as string}>
            <div className="flex items-center gap-3 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Verdict</span>
              <VerdictBadge verdict={String(data.session.verdict ?? "unknown")} />
            </div>
            <div className="flex items-center gap-3 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Session State</span>
              <SessionStateBadge state={String(data.session.sessionState ?? "unknown")} />
              <span className="text-xs text-gray-400">lifecycle</span>
            </div>
            <div className="flex items-center gap-3 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Token State</span>
              <TokenStateBadge state={String(data.session.tokenState ?? "unknown")} />
              <span className="text-xs text-gray-400">access token</span>
            </div>
            <div className="flex items-center gap-2 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Refresh Valid</span>
              {data.session.refreshValid
                ? <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">yes</span>
                : <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">no</span>}
            </div>
            <KvRow label="User ID" value={data.session.userId} />
            <KvRow label="Username" value={data.session.username} />
            <KvRow label="Display Name" value={data.session.displayName} />
            <KvRow label="Email" value={data.session.email} />
            <KvRow label="Workbench" value={data.session.workbench} />
            <KvRow label="Persona" value={data.session.persona} />
            <KvRow label="Roles" value={Array.isArray(data.session.roles) ? (data.session.roles as string[]).join(", ") : data.session.roles} />
            <KvRow label="Token Type" value={data.session.tokenType} />
            <KvRow label="Scope" value={data.session.scope} />
            <KvRow label="Keycloak Session" value={data.session.keycloakSessionId} />
            <div className="mt-2 border-t border-gray-100 pt-2">
              <CountdownBadge label="Token Remaining" seconds={data.session.tokenRemaining as number | null} />
              <CountdownBadge label="Idle Remaining" seconds={data.session.idleRemaining as number | null} />
              <KvRow label="Idle Timeout" value={data.session.idleTimeoutSec != null ? `${data.session.idleTimeoutSec}s` : null} />
            </div>
            <div className="mt-2 border-t border-gray-100 pt-2">
              <KvRow label="Issued At" value={data.session.issuedAt} />
              <KvRow label="Expires At" value={data.session.expiresAt} />
              <KvRow label="Is Expired" value={data.session.isExpired != null ? String(data.session.isExpired) : null} />
              <KvRow label="Last Seen At" value={data.session.lastSeenAt} />
              <KvRow label="Last Seen Ago" value={data.session.lastSeenAgo != null ? `${data.session.lastSeenAgo}s` : null} />
            </div>
            <KvRow label="Server Time" value={data.serverTime} />
          </Section>

          {/* Keycloak Config */}
          <Section title="Keycloak Configuration">
            <KvRow label="Base URL" value={data.keycloak.baseUrl} />
            <KvRow label="Realm" value={data.keycloak.realm} />
            <KvRow label="Client ID" value={data.keycloak.clientId} />
            <KvRow label="Issuer URL" value={data.keycloak.issuerUrl} />
            <KvRow label="Token Endpoint" value={data.keycloak.tokenEndpoint} />
            <KvRow label="UserInfo Endpoint" value={data.keycloak.userinfoEndpoint} />
          </Section>

          {/* Audience & Scope Policy */}
          <Section title="Audience & Scope Policy">
            <KvRow label="aud (audience)" value={String(data.audiencePolicy.aud)} />
            <KvRow label="azp (authorized party)" value={String(data.audiencePolicy.azp)} />
            <KvRow label="Enforcement" value={data.audiencePolicy.enforcement} />
            <p className="mt-2 text-xs text-gray-500">{data.audiencePolicy.note}</p>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2 py-1 text-sm">
                <span className="min-w-[160px] font-medium text-gray-600">Scope Check</span>
                <ValidationBadge ok={data.audiencePolicy.scopeCheck === "pass"} />
              </div>
              <KvRow label="Granted Scopes" value={data.audiencePolicy.grantedScopes.join(", ") || "none"} />
              <KvRow label="Required Scopes" value={data.audiencePolicy.requiredScopes.join(", ")} />
              {data.audiencePolicy.missingScopes.length > 0 && (
                <div className="flex gap-2 py-1 text-sm">
                  <span className="min-w-[160px] font-medium text-red-600">Missing Scopes</span>
                  <span className="font-mono text-red-700">{data.audiencePolicy.missingScopes.join(", ")}</span>
                </div>
              )}
              {data.audiencePolicy.scopeCheck === "fail" && (
                <p className="mt-1 text-xs text-red-500">
                  API will return 403 — missing required scopes for workbench &quot;{String(data.session.workbench)}&quot;.
                </p>
              )}
            </div>
          </Section>

          {/* Tenant Isolation Check */}
          <Section title="Tenant Isolation">
            <div className="flex items-center gap-2 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Tenant Check</span>
              <ValidationBadge ok={data.tenantCheck.validated} />
            </div>
            <KvRow label="Request Tenant" value={data.tenantCheck.requestTenantId} />
            <KvRow label="Session Tenant" value={data.tenantCheck.sessionTenantId} />
            <KvRow label="Tenant Source" value={data.tenantCheck.tenantSource} />
            <p className="mt-2 text-xs text-gray-500">{data.tenantCheck.note}</p>
          </Section>

          {/* JWT Access Token */}
          <Section title="JWT Access Token" badge={data.jwt.redacted ? "redacted" : "pii-scrubbed"}>
            <p className="text-xs text-gray-500 mb-2">
              {data.jwt.redacted
                ? "Showing safe metadata only. Set AUTH_DEBUG_EXPOSE_TOKENS=true to see full payload."
                : "Full payload with PII scrubbed (email, name, org claims show [redacted]). Safe for screenshots."}
            </p>
            <h3 className="text-sm font-medium text-gray-600 mt-3">Header</h3>
            <JsonBlock data={data.jwt.header} />
            <h3 className="text-sm font-medium text-gray-600 mt-3">Payload</h3>
            <JsonBlock data={data.jwt.payload} />
            <KvRow label="Signature Present" value={String(data.jwt.signaturePresent)} />
          </Section>

          {/* Refresh Token — metadata only, never full payload */}
          <Section title="Refresh Token" badge="metadata only">
            {data.refreshToken ? (
              <>
                <KvRow label="Type" value={data.refreshToken.type} />
                <KvRow label="Expires At" value={data.refreshToken.expiresAt} />
                <KvRow label="Is Expired" value={data.refreshToken.isExpired != null ? String(data.refreshToken.isExpired) : null} />
                <KvRow label="Remaining" value={data.refreshToken.remainingSeconds != null ? `${data.refreshToken.remainingSeconds}s` : null} />
                <KvRow label="Issuer" value={data.refreshToken.issuer} />
                <KvRow label="Keycloak SID" value={data.refreshToken.keycloakSid} />
              </>
            ) : (
              <p className="text-sm text-gray-500">No refresh token present</p>
            )}
          </Section>

          {/* Refresh Strategy */}
          <Section title="Refresh Strategy" badge={data.refreshStrategy.refreshMode}>
            <div className="flex items-center gap-3 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Trigger</span>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                data.refreshStrategy.refreshTrigger === "immediate" ? "bg-red-100 text-red-800"
                  : data.refreshStrategy.refreshTrigger === "blocked" ? "bg-red-100 text-red-800"
                    : data.refreshStrategy.refreshTrigger === "disabled" ? "bg-gray-100 text-gray-600"
                      : "bg-blue-100 text-blue-800"
              }`}>
                {data.refreshStrategy.refreshTrigger}
              </span>
              <span className="text-xs text-gray-400">
                {data.refreshStrategy.refreshTrigger === "auto" && "proactive timer scheduled"}
                {data.refreshStrategy.refreshTrigger === "immediate" && "client must fire now"}
                {data.refreshStrategy.refreshTrigger === "blocked" && "security policy — hard stop"}
                {data.refreshStrategy.refreshTrigger === "disabled" && "refresh not available"}
              </span>
            </div>
            <div className="flex items-center gap-3 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Execution Status</span>
              <ExecutionStatusBadge status={data.refreshStrategy.refreshExecutionStatus} />
            </div>
            {data.refreshStrategy.refreshBlockedReason && (
              <div className="flex items-center gap-2 py-1 text-sm">
                <span className="min-w-[160px] font-medium text-red-600">Blocked Reason</span>
                <span className="font-mono text-red-700">{data.refreshStrategy.refreshBlockedReason}</span>
              </div>
            )}
            <div className="flex items-center gap-2 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Should Refresh Now</span>
              {data.refreshStrategy.shouldRefreshNow
                ? <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">YES — fire now</span>
                : <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">no</span>}
            </div>
            <div className="flex items-center gap-2 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Refresh Valid</span>
              {data.refreshStrategy.refreshValid
                ? <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">yes</span>
                : <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">no — reauth needed</span>}
            </div>
            <KvRow label="Refresh Mode" value={data.refreshStrategy.refreshMode} />
            <KvRow label="Threshold" value={`${data.refreshStrategy.refreshThresholdSec}s`} />
            <KvRow label="Last Refresh At" value={data.refreshStrategy.lastRefreshAt} />
            <KvRow label="Attempts (recent)" value={data.refreshStrategy.refreshAttempts} />
            <div className="flex items-center gap-2 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Locked</span>
              {data.refreshStrategy.refreshLocked
                ? <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">LOCKED</span>
                : <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">no</span>}
            </div>
            <div className="mt-2 border-t border-gray-100 pt-2">
              <KvRow label="Refresh Token" value={data.refreshStrategy.refreshTokenPresent ? "present" : "missing"} />
              <KvRow label="Refresh Expired" value={data.refreshStrategy.refreshTokenExpired != null ? String(data.refreshStrategy.refreshTokenExpired) : null} />
              <CountdownBadge label="Refresh Remaining" seconds={data.refreshStrategy.refreshTokenRemaining} />
            </div>
            <p className="mt-2 text-xs text-gray-500">{data.refreshStrategy.note}</p>
          </Section>

          {/* JWKS Status */}
          <Section title="JWKS Status" badge={data.jwksStatus.reachable ? "reachable" : "unreachable"}>
            <div className="flex items-center gap-2 py-1 text-sm">
              <span className="min-w-[160px] font-medium text-gray-600">Status</span>
              {data.jwksStatus.reachable
                ? <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">reachable</span>
                : <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">unreachable</span>}
            </div>
            <KvRow label="JWKS URI" value={data.jwksStatus.uri} />
            <KvRow label="Key Count" value={data.jwksStatus.keyCount} />
            <KvRow label="Fetch Latency" value={data.jwksStatus.fetchLatencyMs != null ? `${data.jwksStatus.fetchLatencyMs}ms` : null} />
            {data.jwksStatus.lastError && (
              <div className="flex gap-2 py-1 text-sm">
                <span className="min-w-[160px] font-medium text-red-600">Last Error</span>
                <span className="font-mono text-red-700 break-all">{data.jwksStatus.lastError}</span>
              </div>
            )}
          </Section>

          {/* Redis */}
          <Section title="Redis / MemoryCache">
            {Object.entries(data.redis).map(([k, v]) => (
              <KvRow key={k} label={k} value={v} />
            ))}
          </Section>
        </>
      )}
    </main>
  );
}
