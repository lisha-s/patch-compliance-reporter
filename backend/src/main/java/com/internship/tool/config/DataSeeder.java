package com.internship.tool.config;

import com.internship.tool.entity.PatchRecord;
import com.internship.tool.repository.PatchRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataSeeder {

    private final PatchRecordRepository repo;

    @Bean
    @Profile("!test")
    public CommandLineRunner seedData() {
        return args -> {
            if (repo.count() > 0) {
                log.info("DataSeeder: database already has {} records — skipping seed", repo.count());
                return;
            }
            log.info("DataSeeder: seeding 15 demo records...");

            repo.save(PatchRecord.builder().assetName("web-server-01").assetIp("192.168.1.10").assetOwner("DevOps").patchId("CVE-2024-1234").patchTitle("OpenSSL Critical Vulnerability Fix").severity("CRITICAL").status("NON_COMPLIANT").complianceScore(25).patchReleaseDate(LocalDate.of(2024,3,1)).patchDeadline(LocalDate.of(2024,3,15)).build());
            repo.save(PatchRecord.builder().assetName("db-server-01").assetIp("192.168.1.20").assetOwner("DBA Team").patchId("CVE-2024-5678").patchTitle("PostgreSQL Authentication Bypass").severity("CRITICAL").status("PENDING").complianceScore(40).patchReleaseDate(LocalDate.of(2024,3,5)).patchDeadline(LocalDate.of(2024,3,20)).build());
            repo.save(PatchRecord.builder().assetName("app-server-01").assetIp("192.168.1.30").assetOwner("Backend Team").patchId("KB5034441").patchTitle("Windows Server 2022 Security Update").severity("HIGH").status("COMPLIANT").complianceScore(90).patchReleaseDate(LocalDate.of(2024,2,1)).patchDeadline(LocalDate.of(2024,2,28)).build());
            repo.save(PatchRecord.builder().assetName("app-server-02").assetIp("192.168.1.31").assetOwner("Backend Team").patchId("KB5034442").patchTitle("Windows Server 2019 Cumulative Update").severity("HIGH").status("COMPLIANT").complianceScore(85).patchReleaseDate(LocalDate.of(2024,2,1)).patchDeadline(LocalDate.of(2024,2,28)).build());
            repo.save(PatchRecord.builder().assetName("mail-server-01").assetIp("192.168.1.40").assetOwner("IT Team").patchId("CVE-2024-2345").patchTitle("Exchange Server Remote Code Execution").severity("CRITICAL").status("NON_COMPLIANT").complianceScore(10).patchReleaseDate(LocalDate.of(2024,3,10)).patchDeadline(LocalDate.of(2024,3,25)).build());
            repo.save(PatchRecord.builder().assetName("file-server-01").assetIp("192.168.1.50").assetOwner("IT Team").patchId("CVE-2024-3456").patchTitle("SMB Protocol Vulnerability").severity("HIGH").status("COMPLIANT").complianceScore(80).patchReleaseDate(LocalDate.of(2024,1,15)).patchDeadline(LocalDate.of(2024,2,15)).build());
            repo.save(PatchRecord.builder().assetName("api-gateway-01").assetIp("10.0.0.1").assetOwner("DevOps").patchId("CVE-2024-4567").patchTitle("Nginx HTTP/2 Rapid Reset Attack").severity("HIGH").status("COMPLIANT").complianceScore(75).patchReleaseDate(LocalDate.of(2024,2,20)).patchDeadline(LocalDate.of(2024,3,5)).build());
            repo.save(PatchRecord.builder().assetName("cache-server-01").assetIp("10.0.0.10").assetOwner("Backend Team").patchId("CVE-2024-6789").patchTitle("Redis Unauthenticated Access").severity("MEDIUM").status("PENDING").complianceScore(55).patchReleaseDate(LocalDate.of(2024,3,15)).patchDeadline(LocalDate.of(2024,4,1)).build());
            repo.save(PatchRecord.builder().assetName("dev-server-01").assetIp("192.168.2.10").assetOwner("Dev Team").patchId("CVE-2024-7890").patchTitle("Java Log4j Remote Code Execution").severity("CRITICAL").status("COMPLIANT").complianceScore(95).patchReleaseDate(LocalDate.of(2024,1,1)).patchDeadline(LocalDate.of(2024,1,31)).build());
            repo.save(PatchRecord.builder().assetName("backup-server-01").assetIp("192.168.1.60").assetOwner("IT Team").patchId("CVE-2024-8901").patchTitle("Backup Agent Privilege Escalation").severity("MEDIUM").status("COMPLIANT").complianceScore(70).patchReleaseDate(LocalDate.of(2024,2,10)).patchDeadline(LocalDate.of(2024,3,10)).build());
            repo.save(PatchRecord.builder().assetName("vpn-server-01").assetIp("10.0.1.1").assetOwner("Security").patchId("CVE-2024-9012").patchTitle("VPN Client Buffer Overflow").severity("HIGH").status("NON_COMPLIANT").complianceScore(30).patchReleaseDate(LocalDate.of(2024,3,20)).patchDeadline(LocalDate.of(2024,4,5)).build());
            repo.save(PatchRecord.builder().assetName("load-balancer-01").assetIp("10.0.0.2").assetOwner("DevOps").patchId("CVE-2024-0123").patchTitle("HAProxy HTTP Request Smuggling").severity("MEDIUM").status("COMPLIANT").complianceScore(88).patchReleaseDate(LocalDate.of(2024,2,25)).patchDeadline(LocalDate.of(2024,3,25)).build());
            repo.save(PatchRecord.builder().assetName("monitor-server").assetIp("192.168.1.70").assetOwner("IT Team").patchId("CVE-2024-1357").patchTitle("Prometheus Metrics Exposure").severity("LOW").status("EXEMPT").complianceScore(60).patchReleaseDate(LocalDate.of(2024,3,1)).patchDeadline(LocalDate.of(2024,4,30)).build());
            repo.save(PatchRecord.builder().assetName("ci-server-01").assetIp("192.168.2.20").assetOwner("Dev Team").patchId("CVE-2024-2468").patchTitle("Jenkins Remote Code Execution").severity("CRITICAL").status("COMPLIANT").complianceScore(92).patchReleaseDate(LocalDate.of(2024,1,20)).patchDeadline(LocalDate.of(2024,2,20)).build());
            repo.save(PatchRecord.builder().assetName("proxy-server-01").assetIp("10.0.0.3").assetOwner("DevOps").patchId("CVE-2024-3579").patchTitle("Squid Proxy Cache Poisoning").severity("MEDIUM").status("PENDING").complianceScore(45).patchReleaseDate(LocalDate.of(2024,3,25)).patchDeadline(LocalDate.of(2024,4,25)).build());

            log.info("DataSeeder: {} records seeded successfully!", repo.count());
        };
    }
}