package com.internship.tool.service;

import com.internship.tool.entity.PatchRecord;
import com.internship.tool.repository.PatchRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class PatchRecordService {

    private final PatchRecordRepository repo;

    // ── Get all paginated ─────────────────────────────
    public Page<PatchRecord> getAll(Pageable pageable) {
        return repo.findAll(pageable);
    }

    // ── Get by ID ─────────────────────────────────────
    public PatchRecord getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found: " + id));
    }

    // ── Create ────────────────────────────────────────
    public PatchRecord create(Map<String, Object> request) {
        PatchRecord record = PatchRecord.builder()
                .assetName   ((String) request.get("assetName"))
                .assetIp     ((String) request.get("assetIp"))
                .assetOwner  ((String) request.get("assetOwner"))
                .patchId     ((String) request.get("patchId"))
                .patchTitle  ((String) request.get("patchTitle"))
                .patchDescription((String) request.get("patchDescription"))
                .severity    (getOrDefault(request, "severity",  "MEDIUM"))
                .status      (getOrDefault(request, "status",    "PENDING"))
                .complianceScore(parseInteger(request.get("complianceScore")))
                .build();
        return repo.save(record);
    }

    // ── Update ────────────────────────────────────────
    public PatchRecord update(Long id, Map<String, Object> request) {
        PatchRecord record = getById(id);
        if (request.get("assetName")        != null) record.setAssetName((String) request.get("assetName"));
        if (request.get("assetIp")          != null) record.setAssetIp((String) request.get("assetIp"));
        if (request.get("assetOwner")       != null) record.setAssetOwner((String) request.get("assetOwner"));
        if (request.get("patchId")          != null) record.setPatchId((String) request.get("patchId"));
        if (request.get("patchTitle")       != null) record.setPatchTitle((String) request.get("patchTitle"));
        if (request.get("patchDescription") != null) record.setPatchDescription((String) request.get("patchDescription"));
        if (request.get("severity")         != null) record.setSeverity((String) request.get("severity"));
        if (request.get("status")           != null) record.setStatus((String) request.get("status"));
        if (request.get("complianceScore")  != null) record.setComplianceScore(parseInteger(request.get("complianceScore")));
        return repo.save(record);
    }

    // ── Soft delete (set status to EXEMPT) ───────────
    public void delete(Long id) {
        PatchRecord record = getById(id);
        record.setStatus("EXEMPT");
        repo.save(record);
        log.info("Soft deleted record: {}", id);
    }

    // ── Search ────────────────────────────────────────
    public List<PatchRecord> search(String query) {
        return repo.search(query);
    }

    // ── Dashboard stats ───────────────────────────────
    public Map<String, Object> getStats() {
        long total        = repo.count();
        long compliant    = repo.countByStatus("COMPLIANT");
        long nonCompliant = repo.countByStatus("NON_COMPLIANT");
        long pending      = repo.countByStatus("PENDING");
        Double avgScore   = repo.avgComplianceScore();

        List<Map<String, Object>> bySeverity = new ArrayList<>();
        for (String sev : List.of("CRITICAL","HIGH","MEDIUM","LOW","INFO")) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("severity", sev);
            entry.put("count", repo.countBySeverity(sev));
            bySeverity.add(entry);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("total",        total);
        stats.put("compliant",    compliant);
        stats.put("nonCompliant", nonCompliant);
        stats.put("pending",      pending);
        stats.put("avgScore",     avgScore != null ? Math.round(avgScore) : 0);
        stats.put("bySeverity",   bySeverity);
        return stats;
    }

    // ── Export CSV ────────────────────────────────────
    public byte[] exportToCsv() {
        try {
            List<PatchRecord> records = repo.findAll();
            ByteArrayOutputStream out    = new ByteArrayOutputStream();
            PrintWriter           writer = new PrintWriter(out);
            writer.println("ID,Asset Name,Asset IP,Asset Owner,Patch ID,Patch Title,Severity,Status,Compliance Score,Deadline,Created At");
            for (PatchRecord r : records) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    r.getId(),
                    safe(r.getAssetName()), safe(r.getAssetIp()), safe(r.getAssetOwner()),
                    safe(r.getPatchId()),   safe(r.getPatchTitle()),
                    safe(r.getSeverity()),  safe(r.getStatus()),
                    r.getComplianceScore() != null ? r.getComplianceScore() : "",
                    r.getPatchDeadline()   != null ? r.getPatchDeadline()   : "",
                    r.getCreatedAt()       != null ? r.getCreatedAt()       : ""
                );
            }
            writer.flush();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("CSV export failed: {}", e.getMessage());
            return new byte[0];
        }
    }

    // ── Save uploaded file ────────────────────────────
    public String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads/");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            String original  = Objects.requireNonNull(file.getOriginalFilename());
            String extension = original.substring(original.lastIndexOf('.'));
            String savedName = UUID.randomUUID() + extension;
            Files.write(uploadPath.resolve(savedName), file.getBytes());
            log.info("File saved: {}", savedName);
            return savedName;
        } catch (Exception e) {
            log.error("File save failed: {}", e.getMessage());
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────
    private String getOrDefault(Map<String,Object> map, String key, String def) {
        Object val = map.get(key);
        return val != null ? val.toString() : def;
    }

    private Integer parseInteger(Object val) {
        if (val == null) return null;
        try { return Integer.parseInt(val.toString()); }
        catch (Exception e) { return null; }
    }

    private String safe(Object val) {
        if (val == null) return "";
        return val.toString().replace(",", ";");
    }
}