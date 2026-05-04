package com.internship.tool.config;

import com.internship.tool.entity.AuditLog;
import com.internship.tool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    // ── Pointcuts — which methods to watch ───────────
    @Pointcut("execution(* com.internship.tool.service.*Service.create*(..))")
    public void createMethods() {}

    @Pointcut("execution(* com.internship.tool.service.*Service.update*(..))")
    public void updateMethods() {}

    @Pointcut("execution(* com.internship.tool.service.*Service.delete*(..))")
    public void deleteMethods() {}

    // ── After CREATE succeeds ─────────────────────────
    @AfterReturning(pointcut = "createMethods()", returning = "result")
    public void afterCreate(JoinPoint joinPoint, Object result) {
        saveAuditLog("CREATE", joinPoint, result);
    }

    // ── After UPDATE succeeds ─────────────────────────
    @AfterReturning(pointcut = "updateMethods()", returning = "result")
    public void afterUpdate(JoinPoint joinPoint, Object result) {
        saveAuditLog("UPDATE", joinPoint, result);
    }

    // ── After DELETE succeeds ─────────────────────────
    @AfterReturning(pointcut = "deleteMethods()", returning = "result")
    public void afterDelete(JoinPoint joinPoint, Object result) {
        saveAuditLog("DELETE", joinPoint, result);
    }

    // ── Save to audit_log table ───────────────────────
    @SuppressWarnings("null")
    private void saveAuditLog(String action, JoinPoint joinPoint, Object result) {
        try {
            // Get currently logged-in username
            String username = "system";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                username = auth.getName();
            }

            // Get method name to derive entity name
            String methodName = joinPoint.getSignature().getName();
            String className  = joinPoint.getTarget().getClass().getSimpleName();

            // Try to get entity ID from result
            Long entityId = null;
            if (result != null) {
                try {
                    entityId = (Long) result.getClass().getMethod("getId").invoke(result);
                } catch (Exception ignored) {}
            }

            AuditLog auditLog = AuditLog.builder()
                    .entityName(className)
                    .entityId(entityId)
                    .action(action)
                    .changedBy(username)
                    .changeSummary(methodName + " called")
                    .build();

            auditLogRepository.save(auditLog);

        } catch (Exception e) {
            // Never let audit logging crash the main operation
            log.warn("Audit logging failed: {}", e.getMessage());
        }
    }
}