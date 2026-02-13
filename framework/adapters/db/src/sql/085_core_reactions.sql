/**
 * Comment Reactions Schema
 *
 * Supports emoji reactions on comments (👍, ❤️, 🎉, 👀, 👎, etc.)
 */

-- Comment Reaction Table
CREATE TABLE IF NOT EXISTS core.comment_reaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  comment_type TEXT NOT NULL,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES core.principal(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_reaction_type_chk CHECK (comment_type IN ('entity_comment', 'approval_comment')),
  CONSTRAINT comment_reaction_emoji_chk CHECK (reaction_type IN ('👍', '❤️', '🎉', '👀', '👎', '🚀', '💡', '🤔')),
  CONSTRAINT comment_reaction_unique UNIQUE (tenant_id, comment_type, comment_id, user_id, reaction_type)
);

-- Indexes for performance
CREATE INDEX idx_comment_reaction_comment
  ON core.comment_reaction (tenant_id, comment_type, comment_id);

CREATE INDEX idx_comment_reaction_user
  ON core.comment_reaction (tenant_id, user_id, created_at DESC);

-- Comment to prevent accidental table drops
COMMENT ON TABLE core.comment_reaction IS 'Stores emoji reactions on comments (entity and approval)';
COMMENT ON COLUMN core.comment_reaction.reaction_type IS 'Emoji character: 👍, ❤️, 🎉, 👀, 👎, 🚀, 💡, 🤔';
