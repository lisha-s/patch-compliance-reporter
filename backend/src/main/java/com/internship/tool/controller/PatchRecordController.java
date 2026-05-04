package com.internship.tool.controller;

import com.internship.tool.entity.PatchRecord;
import com.internship.tool.service.PatchRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patch-records")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Patch Records", description = "CRUD for patch compliance records")
@CrossOrigin(origins = "*")
public class PatchRecordController {

    private final PatchRecordService service;

    @GetMapping
    @Operation(summary = "Get all patch records (paginated)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<PatchRecord>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.getAll(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patch record by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Found"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<PatchRecord> getById(
            @Parameter(description = "Record ID") @PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create new patch record")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Created"),
        @ApiResponse(responseCode = "400", description = "Bad request")
    })
    public ResponseEntity<PatchRecord> create(
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update patch record")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Updated"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<PatchRecord> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete (sets status to EXEMPT)")
    @ApiResponse(responseCode = "204", description = "Deleted")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search records by asset name, patch ID or title")
    public ResponseEntity<List<PatchRecord>> search(
            @Parameter(description = "Search term") @RequestParam String q) {
        return ResponseEntity.ok(service.search(q));
    }

    @GetMapping("/stats")
    @Operation(summary = "Dashboard statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(service.getStats());
    }

    @GetMapping("/export")
    @Operation(summary = "Export all records as CSV")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = service.exportToCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"patch-records.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload file attachment (PDF/PNG/JPG max 5MB)")
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty())
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File is empty"));

        if (file.getSize() > 5L * 1024 * 1024)
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File exceeds 5MB limit"));

        String ct = file.getContentType();
        if (ct == null || (!ct.equals("application/pdf") &&
                           !ct.equals("image/png") &&
                           !ct.equals("image/jpeg")))
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid type. Allowed: PDF, PNG, JPG"));

        String saved = service.saveFile(file);
        return ResponseEntity.ok(Map.of(
                "message",  "Uploaded successfully",
                "filename", saved,
                "size",     file.getSize() + " bytes",
                "type",     ct
        ));
    }
}