package com.internship.tool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PatchComplianceReporterApplication {
    public static void main(String[] args) {
        SpringApplication.run(PatchComplianceReporterApplication.class, args);
    }
}