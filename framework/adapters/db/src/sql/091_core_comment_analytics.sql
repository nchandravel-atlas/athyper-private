/**
 * Enhancement: Comment Engagement Analytics
 *
 * Tracks comment engagement metrics for analytics and reporting.
 * Aggregates data for dashboards and insights.
 */

-- Daily Comment Analytics (Aggregated)
CREATE TABLE IF NOT EXISTS core.comment_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entity_type TEXT,
  total_comments INT NOT NULL DEFAULT 0,
  total_replies INT NOT NULL DEFAULT 0,
  unique_commenters INT NOT NULL DEFAULT 0,
  total_reactions INT NOT NULL DEFAULT 0,
  total_flags INT NOT NULL DEFAULT 0,
  avg_comment_length INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One row per tenant per date (or per tenant+entity_type per date)
  CONSTRAINT comment_analytics_daily_unique UNIQUE (tenant_id, date, entity_type)
);

-- Index for time-series queries
CREATE INDEX IF NOT EXISTS idx_comment_analytics_daily_date
  ON core.comment_analytics_daily (tenant_id, date DESC);

-- User Engagement Metrics
CREATE TABLE IF NOT EXISTS core.comment_user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES core.principal(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_comments INT NOT NULL DEFAULT 0,
  total_replies INT NOT NULL DEFAULT 0,
  total_reactions_given INT NOT NULL DEFAULT 0,
  total_reactions_received INT NOT NULL DEFAULT 0,
  total_mentions_received INT NOT NULL DEFAULT 0,
  avg_response_time_seconds INT,
  engagement_score INT, -- Calculated score based on activity
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_user_engagement_unique UNIQUE (tenant_id, user_id, period_start, period_end)
);

-- Index for user leaderboards
CREATE INDEX IF NOT EXISTS idx_comment_user_engagement_score
  ON core.comment_user_engagement (tenant_id, engagement_score DESC NULLS LAST, period_start DESC);

-- Thread Analytics (Most Active Threads)
CREATE TABLE IF NOT EXISTS core.comment_thread_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  total_comments INT NOT NULL DEFAULT 0,
  unique_participants INT NOT NULL DEFAULT 0,
  total_reactions INT NOT NULL DEFAULT 0,
  thread_depth INT NOT NULL DEFAULT 0,
  first_comment_at TIMESTAMPTZ NOT NULL,
  last_comment_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true, -- Active in last 7 days
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_thread_analytics_unique UNIQUE (tenant_id, entity_type, entity_id)
);

-- Index for most active threads
CREATE INDEX IF NOT EXISTS idx_comment_thread_analytics_active
  ON core.comment_thread_analytics (tenant_id, is_active, total_comments DESC)
  WHERE is_active = true;

-- Index for recent threads
CREATE INDEX IF NOT EXISTS idx_comment_thread_analytics_recent
  ON core.comment_thread_analytics (tenant_id, last_comment_at DESC);

COMMENT ON TABLE core.comment_analytics_daily IS 'Daily aggregated comment metrics for dashboards';
COMMENT ON TABLE core.comment_user_engagement IS 'User engagement metrics for leaderboards and gamification';
COMMENT ON TABLE core.comment_thread_analytics IS 'Per-entity thread analytics for identifying hot topics';
COMMENT ON COLUMN core.comment_user_engagement.engagement_score IS 'Calculated engagement score (0-100)';
