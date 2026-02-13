/**
 * Enhancement: Comment SLA Tracking
 *
 * Tracks response times and SLA compliance for comments.
 * Useful for customer support, internal collaboration metrics.
 */

-- Comment SLA Metrics Table
CREATE TABLE IF NOT EXISTS core.comment_sla_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  first_comment_at TIMESTAMPTZ NOT NULL,
  first_comment_by UUID NOT NULL REFERENCES core.principal(id) ON DELETE CASCADE,
  first_response_at TIMESTAMPTZ,
  first_response_by UUID REFERENCES core.principal(id) ON DELETE SET NULL,
  first_response_time_seconds INT, -- Time to first response in seconds
  total_comments INT NOT NULL DEFAULT 1,
  total_responses INT NOT NULL DEFAULT 0,
  avg_response_time_seconds INT,
  max_response_time_seconds INT,
  sla_target_seconds INT, -- SLA target (e.g., 3600 = 1 hour)
  is_sla_breached BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One SLA metric per entity
  CONSTRAINT comment_sla_metrics_unique UNIQUE (tenant_id, entity_type, entity_id)
);

-- Index for SLA breaches
CREATE INDEX IF NOT EXISTS idx_comment_sla_breached
  ON core.comment_sla_metrics (tenant_id, is_sla_breached, first_comment_at DESC)
  WHERE is_sla_breached = true;

-- Index for pending responses
CREATE INDEX IF NOT EXISTS idx_comment_sla_pending
  ON core.comment_sla_metrics (tenant_id, first_comment_at DESC)
  WHERE first_response_at IS NULL;

-- Index for response time analytics
CREATE INDEX IF NOT EXISTS idx_comment_sla_response_time
  ON core.comment_sla_metrics (tenant_id, first_response_time_seconds);

-- Comment Response Time History
CREATE TABLE IF NOT EXISTS core.comment_response_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  comment_id UUID NOT NULL,
  parent_comment_id UUID,
  commenter_id UUID NOT NULL REFERENCES core.principal(id) ON DELETE CASCADE,
  response_time_seconds INT, -- Time since previous comment (NULL for first comment)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_response_history_unique UNIQUE (tenant_id, comment_id)
);

-- Index for response time queries
CREATE INDEX IF NOT EXISTS idx_comment_response_history_entity
  ON core.comment_response_history (tenant_id, entity_type, entity_id, created_at DESC);

-- SLA Configuration Table
CREATE TABLE IF NOT EXISTS core.comment_sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  sla_target_seconds INT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  business_hours_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_sla_config_unique UNIQUE (tenant_id, entity_type)
);

COMMENT ON TABLE core.comment_sla_metrics IS 'Tracks first response time and SLA compliance per entity';
COMMENT ON TABLE core.comment_response_history IS 'Historical log of all comment response times';
COMMENT ON TABLE core.comment_sla_config IS 'SLA configuration per entity type';
COMMENT ON COLUMN core.comment_sla_metrics.first_response_time_seconds IS 'Seconds from first comment to first response';
COMMENT ON COLUMN core.comment_sla_metrics.avg_response_time_seconds IS 'Average response time across all responses';
