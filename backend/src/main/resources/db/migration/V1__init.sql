-- ============================================================
-- V1__init.sql  —  Patch Compliance Reporter — Initial Schema
-- ============================================================

-- ENUM type for compliance status
CREATE TYPE patch_status AS ENUM (
    'COMPLIANT',
    'NON_COMPLIANT',
    'PENDING',
    'EXEMPT'
);

-- ENUM type for severity / priority
CREATE TYPE severity_level AS ENUM (
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
    'INFO'
);

-- -------------------------------------------------------
-- Core table: patch_records
-- -------------------------------------------------------
CREATE TABLE patch_records (
    id                  BIGSERIAL           PRIMARY KEY,

    -- Identification
    asset_name          VARCHAR(255)        NOT NULL,
    asset_ip            VARCHAR(45),                        -- supports IPv4 and IPv6
    asset_owner         VARCHAR(255),

    -- Patch details
    patch_id            VARCHAR(100)        NOT NULL,
    patch_title         VARCHAR(500)        NOT NULL,
    patch_description   TEXT,
    severity            severity_level      NOT NULL DEFAULT 'MEDIUM',

    -- Compliance state
    status              patch_status        NOT NULL DEFAULT 'PENDING',
    compliance_score    SMALLINT            CHECK (compliance_score BETWEEN 0 AND 100),

    -- AI-generated content (populated by Flask AI service)
    ai_description      TEXT,
    ai_recommendation   TEXT,
    ai_report           TEXT,
    ai_generated_at     TIMESTAMP,

    -- Dates
    patch_release_date  DATE,
    patch_deadline      DATE,
    patched_at          TIMESTAMP,

    -- Audit timestamps (managed by Spring Data JPA @CreatedDate / @LastModifiedDate)
    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- Indexes on frequently queried / filtered columns
-- -------------------------------------------------------
CREATE INDEX idx_patch_records_status       ON patch_records (status);
CREATE INDEX idx_patch_records_severity     ON patch_records (severity);
CREATE INDEX idx_patch_records_asset_name   ON patch_records (asset_name);
CREATE INDEX idx_patch_records_patch_id     ON patch_records (patch_id);
CREATE INDEX idx_patch_records_deadline     ON patch_records (patch_deadline);
CREATE INDEX idx_patch_records_created_at   ON patch_records (created_at DESC);

-- -------------------------------------------------------
-- Audit log table  (used by Java Dev 2, Day 3 — Flyway V2)
-- Created here as a placeholder so FK references work later
-- -------------------------------------------------------
CREATE TABLE audit_log (
    id              BIGSERIAL   PRIMARY KEY,
    entity_name     VARCHAR(100) NOT NULL,
    entity_id       BIGINT,
    action          VARCHAR(50)  NOT NULL,   -- CREATE | UPDATE | DELETE
    changed_by      VARCHAR(255),
    change_summary  TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log (entity_name, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);

-- -------------------------------------------------------
-- Users table  (used by Spring Security + JWT)
-- -------------------------------------------------------
CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    username    VARCHAR(100)    NOT NULL UNIQUE,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,       -- BCrypt hash
    role        VARCHAR(50)     NOT NULL DEFAULT 'ROLE_USER',
    enabled     BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email    ON users (email);

