-- ============================================================
-- V2__add_audit_log.sql  —  Patch Compliance Reporter
-- Enhances audit_log table created in V1
-- ============================================================

-- Add extra columns to audit_log for richer tracking
ALTER TABLE audit_log
    ADD COLUMN IF NOT EXISTS old_values   JSONB,
    ADD COLUMN IF NOT EXISTS new_values   JSONB,
    ADD COLUMN IF NOT EXISTS ip_address   VARCHAR(45);

-- -------------------------------------------------------
-- Auto-audit function: fires on every INSERT/UPDATE/DELETE
-- on patch_records and writes a row to audit_log
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_patch_records()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (entity_name, entity_id, action, new_values, created_at)
        VALUES ('patch_records', NEW.id, 'CREATE', row_to_json(NEW)::jsonb, NOW());
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (entity_name, entity_id, action, old_values, new_values, created_at)
        VALUES ('patch_records', NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, NOW());
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (entity_name, entity_id, action, old_values, created_at)
        VALUES ('patch_records', OLD.id, 'DELETE', row_to_json(OLD)::jsonb, NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Trigger: attach function to patch_records table
-- -------------------------------------------------------
DROP TRIGGER IF EXISTS trg_audit_patch_records ON patch_records;

CREATE TRIGGER trg_audit_patch_records
AFTER INSERT OR UPDATE OR DELETE ON patch_records
FOR EACH ROW EXECUTE FUNCTION fn_audit_patch_records();

-- Extra index for querying by action type
CREATE INDEX IF NOT EXISTS idx_audit_log_action
    ON audit_log (action);