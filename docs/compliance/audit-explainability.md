# Audit Explainability

The Audit Explainability Service provides detailed decision traces for compliance auditing. It answers three key questions:

1. **What happened?** — Full event chain for a correlation ID
2. **Why was this decided?** — Permission decision reconstruction
3. **What affected this entity?** — Timeline of all decisions for an entity

## Service API

### `explain(tenantId, correlationId): EventExplanation`

Resolves a correlation ID into a full event chain with workflow context and trace links.

**Response:**
```json
{
  "correlationId": "abc-123",
  "events": [
    {
      "id": "evt-1",
      "eventType": "workflow.step.started",
      "severity": "info",
      "actorUserId": "user-42",
      "timestamp": "2026-01-15T10:00:00Z",
      "summary": "Approval step started"
    }
  ],
  "workflowInstance": {
    "instanceId": "inst-99",
    "status": "approved"
  },
  "traceUrl": "https://telemetry.example.com/trace/abc123"
}
```

### `explainDecision(tenantId, decisionId): DecisionExplanation`

Reconstructs the full decision path for a specific permission decision.

**Response:**
```json
{
  "decisionId": "dec-456",
  "timestamp": "2026-01-15T10:00:00Z",
  "principalId": "user-42",
  "resourceType": "invoice",
  "resourceId": "inv-789",
  "action": "entity:update",
  "effect": "allow",
  "policyMatch": {
    "policyId": "pol-1",
    "policyName": "Invoice Editors",
    "ruleId": "rule-5",
    "effect": "allow",
    "priority": 100
  },
  "conditionsEvaluated": [
    {
      "field": "subject.attributes.department",
      "operator": "eq",
      "expectedValue": "finance",
      "actualValue": "finance",
      "passed": true
    }
  ],
  "subjectSnapshot": {
    "roles": ["agent", "finance_editor"],
    "department": "finance"
  },
  "relatedEvents": []
}
```

### `explainEntityHistory(tenantId, entityType, entityId, options): EntityHistory`

Returns a timeline of all permission decisions affecting a specific entity.

**Query options:**
- `startDate` / `endDate` — date range filter
- `limit` — max entries (default 100)

**Response:**
```json
{
  "entityType": "invoice",
  "entityId": "inv-789",
  "entries": [
    {
      "decisionId": "dec-456",
      "timestamp": "2026-01-15T10:00:00Z",
      "principalId": "user-42",
      "action": "entity:update",
      "effect": "allow",
      "policyId": "pol-1",
      "summary": "user-42 entity:update -> allow"
    }
  ],
  "totalCount": 47
}
```

### `generateExplainabilityReport(tenantId, options): ExplainabilityReport`

Generates a batch report of permission decisions with aggregated statistics.

**Query options:**
- `startDate` / `endDate` — date range
- `userId` — filter by principal
- `entityType` — filter by resource type
- `effect` — filter by decision effect (`allow` / `deny`)
- `limit` / `offset` — pagination

**Response:**
```json
{
  "tenantId": "tenant-1",
  "generatedAt": "2026-01-15T12:00:00Z",
  "decisions": [...],
  "totalCount": 1250,
  "statistics": {
    "totalDecisions": 1250,
    "allowCount": 1100,
    "denyCount": 150,
    "uniquePrincipals": 45,
    "uniqueResources": 320,
    "topPolicies": [
      { "policyId": "pol-1", "count": 800 },
      { "policyId": "pol-2", "count": 300 }
    ]
  }
}
```

## Data Sources

| Source Table | Used By | Purpose |
|---|---|---|
| `core.workflow_event_log` | `explain()` | Event chain by correlation ID |
| `core.permission_decision_log` | `explainDecision()`, `explainEntityHistory()`, `generateExplainabilityReport()` | Permission decision records |
| `core.approval_instance` | `explain()` | Workflow instance resolution |
| `core.policy` | `explainDecision()` | Policy name resolution |

## Retention

- Permission decision logs follow the audit retention policy (default 365 days)
- Event chain data is retained per workflow event retention settings
- Reports are generated on-demand and not stored

## Integration with Other Report Types

The Audit Governance module provides 5 report types:

1. **Access Report** (`audit-access-report.service.ts`) — Who accessed what
2. **Activity Report** (`audit-activity-report.service.ts`) — What actions were performed
3. **Change Report** (`audit-change-report.service.ts`) — What data changed
4. **Compliance Report** (`audit-compliance-report.service.ts`) — Compliance status summary
5. **Explainability Report** (`audit-explainability.service.ts`) — Decision traces (this service)
