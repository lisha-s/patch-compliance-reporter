package com.internship.tool.repository;

import com.internship.tool.entity.PatchRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatchRecordRepository
        extends JpaRepository<PatchRecord, Long> {

    // ── Search by asset name or patch ID ─────────────
    @Query("""
        SELECT p FROM PatchRecord p
        WHERE LOWER(p.assetName) LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(p.patchId)   LIKE LOWER(CONCAT('%',:q,'%'))
           OR LOWER(p.patchTitle) LIKE LOWER(CONCAT('%',:q,'%'))
        """)
    List<PatchRecord> search(@Param("q") String query);

    // ── Count by status ───────────────────────────────
    long countByStatus(String status);

    // ── Count by severity ─────────────────────────────
    long countBySeverity(String severity);

    // ── Average compliance score ──────────────────────
    @Query("SELECT AVG(p.complianceScore) FROM PatchRecord p WHERE p.complianceScore IS NOT NULL")
    Double avgComplianceScore();

    // ── Count by severity grouped ─────────────────────
    @Query("SELECT p.severity, COUNT(p) FROM PatchRecord p GROUP BY p.severity")
    List<Object[]> countBySeverityGrouped();

    // ── Filter by status ──────────────────────────────
    Page<PatchRecord> findByStatus(String status, Pageable pageable);
}