-- ============================================================
-- V3__performance_indexes.sql  —  Performance Optimisation
-- Adds composite indexes to fix N+1 queries and
-- speed up common filter/sort operations
-- ============================================================

-- ── Composite: status + severity (dashboard filter) ───────
CREATE INDEX IF NOT EXISTS idx_patch_status_severity
    ON patch_records (status, severity);

-- ── Composite: status + deadline (deadline filter) ────────
CREATE INDEX IF NOT EXISTS idx_patch_status_deadline
    ON patch_records (status, patch_deadline);

-- ── Composite: asset_name + status (search + filter) ──────
CREATE INDEX IF NOT EXISTS idx_patch_asset_status
    ON patch_records (asset_name, status);

-- ── Compliance score (sorting by score) ───────────────────
CREATE INDEX IF NOT EXISTS idx_patch_compliance_score
    ON patch_records (compliance_score DESC NULLS LAST);

-- ── Full-text search index on asset_name + patch_title ────
CREATE INDEX IF NOT EXISTS idx_patch_fulltext
    ON patch_records
    USING gin(to_tsvector('english', asset_name || ' ' || patch_title));

-- ── Audit log: entity + created_at (timeline queries) ─────
CREATE INDEX IF NOT EXISTS idx_audit_entity_created
    ON audit_log (entity_name, entity_id, created_at DESC);

-- ── Users: role index (RBAC queries) ──────────────────────
CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);