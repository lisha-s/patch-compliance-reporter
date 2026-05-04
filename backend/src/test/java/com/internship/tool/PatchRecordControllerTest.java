package com.internship.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@SuppressWarnings("null") // suppress null-safety warnings from JDT/MockMvc chain methods
class PatchRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ── Helper: build a valid request body ───────────
    private Map<String, Object> validPatchRecord() {
        Map<String, Object> body = new HashMap<>();
        body.put("assetName",  "test-server-01");
        body.put("patchId",    "CVE-2024-TEST");
        body.put("patchTitle", "Test Security Patch");
        body.put("severity",   "HIGH");
        body.put("status",     "PENDING");
        return body;
    }

    // ── GET /api/patch-records ────────────────────────
    @Test
    @DisplayName("GET /api/patch-records returns 200 OK")
    @WithMockUser(roles = "USER")
    void getAllPatchRecords_returns200() throws Exception {
        mockMvc.perform(get("/api/patch-records")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    // ── GET /api/patch-records/{id} — valid ID ────────
    @Test
    @DisplayName("GET /api/patch-records/999 returns 404 for unknown ID")
    @WithMockUser(roles = "USER")
    void getPatchRecordById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/patch-records/999999"))
                .andExpect(status().isNotFound());
    }

    // ── POST /api/patch-records — valid body ──────────
    @Test
    @DisplayName("POST /api/patch-records with valid body returns 201")
    @WithMockUser(roles = "USER")
    void createPatchRecord_validBody_returns201() throws Exception {
        mockMvc.perform(post("/api/patch-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validPatchRecord())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.assetName").value("test-server-01"))
                .andExpect(jsonPath("$.patchId").value("CVE-2024-TEST"));
    }

    // ── POST /api/patch-records — missing required fields
    @Test
    @DisplayName("POST /api/patch-records with missing fields returns 400")
    @WithMockUser(roles = "USER")
    void createPatchRecord_missingFields_returns400() throws Exception {
        Map<String, Object> badBody = new HashMap<>();
        badBody.put("assetName", ""); // empty required field

        mockMvc.perform(post("/api/patch-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badBody)))
                .andExpect(status().isBadRequest());
    }

    // ── PUT /api/patch-records/{id} — valid update ────
    @Test
    @DisplayName("PUT /api/patch-records/999999 returns 404 for unknown ID")
    @WithMockUser(roles = "USER")
    void updatePatchRecord_notFound_returns404() throws Exception {
        Map<String, Object> update = validPatchRecord();
        update.put("status", "COMPLIANT");

        mockMvc.perform(put("/api/patch-records/999999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isNotFound());
    }

    // ── DELETE /api/patch-records/{id} ───────────────
    @Test
    @DisplayName("DELETE /api/patch-records/999999 returns 404 for unknown ID")
    @WithMockUser(roles = "USER")
    void deletePatchRecord_notFound_returns404() throws Exception {
        mockMvc.perform(delete("/api/patch-records/999999"))
                .andExpect(status().isNotFound());
    }

    // ── GET /api/patch-records/search ────────────────
    @Test
    @DisplayName("GET /api/patch-records/search returns 200")
    @WithMockUser(roles = "USER")
    void searchPatchRecords_returns200() throws Exception {
        mockMvc.perform(get("/api/patch-records/search")
                .param("q", "test"))
                .andExpect(status().isOk());
    }

    // ── No auth — expect 401 ─────────────────────────
    @Test
    @DisplayName("GET /api/patch-records without auth returns 401")
    void getAllPatchRecords_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/patch-records"))
                .andExpect(status().isUnauthorized());
    }

    // ── SQL injection test ────────────────────────────
    @Test
    @DisplayName("GET /api/patch-records/search with SQL injection returns 200 safely")
    @WithMockUser(roles = "USER")
    void searchPatchRecords_sqlInjection_handledSafely() throws Exception {
        mockMvc.perform(get("/api/patch-records/search")
                .param("q", "'; DROP TABLE patch_records; --"))
                .andExpect(status().isOk());
    }

    // ── Empty search query ────────────────────────────
    @Test
    @DisplayName("GET /api/patch-records/search with empty query returns 200")
    @WithMockUser(roles = "USER")
    void searchPatchRecords_emptyQuery_returns200() throws Exception {
        mockMvc.perform(get("/api/patch-records/search")
                .param("q", ""))
                .andExpect(status().isOk());
    }
}