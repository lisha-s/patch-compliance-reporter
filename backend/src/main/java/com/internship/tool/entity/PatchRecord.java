package com.internship.tool.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patch_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Asset name is required")
    @Column(name = "asset_name", nullable = false)
    private String assetName;

    @Column(name = "asset_ip", length = 45)
    private String assetIp;

    @Column(name = "asset_owner")
    private String assetOwner;

    @NotBlank(message = "Patch ID is required")
    @Column(name = "patch_id", nullable = false)
    private String patchId;

    @NotBlank(message = "Patch title is required")
    @Column(name = "patch_title", nullable = false)
    private String patchTitle;

    @Column(name = "patch_description", columnDefinition = "TEXT")
    private String patchDescription;

    @Column(name = "severity", nullable = false)
    @Builder.Default
    private String severity = "MEDIUM";

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Min(0) @Max(100)
    @Column(name = "compliance_score")
    private Integer complianceScore;

    @Column(name = "ai_description", columnDefinition = "TEXT")
    private String aiDescription;

    @Column(name = "ai_recommendation", columnDefinition = "TEXT")
    private String aiRecommendation;

    @Column(name = "ai_report", columnDefinition = "TEXT")
    private String aiReport;

    @Column(name = "ai_generated_at")
    private LocalDateTime aiGeneratedAt;

    @Column(name = "patch_release_date")
    private LocalDate patchReleaseDate;

    @Column(name = "patch_deadline")
    private LocalDate patchDeadline;

    @Column(name = "patched_at")
    private LocalDateTime patchedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}