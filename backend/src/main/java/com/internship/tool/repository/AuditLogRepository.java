package com.internship.tool.repository;

import com.internship.tool.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Find all logs for a specific entity record
    List<AuditLog> findByEntityNameAndEntityIdOrderByCreatedAtDesc(
            String entityName, Long entityId);

    // Find all logs by action type
    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    // Find all logs by user
    List<AuditLog> findByChangedByOrderByCreatedAtDesc(String changedBy);
}