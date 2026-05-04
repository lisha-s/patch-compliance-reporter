package com.internship.tool.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "Login and register")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // ── Simple login — returns a test JWT ─────────────
    @PostMapping("/login")
    @Operation(summary = "Login and get JWT token")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.isBlank() ||
            password == null || password.isBlank()) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Username and password required"));
        }

        log.info("Login attempt for user: {}", username);

        String payload = java.util.Base64.getEncoder()
                .encodeToString(("{\"sub\":\"" + username + "\",\"role\":\"ROLE_USER\"}").getBytes());
        String token = "eyJhbGciOiJIUzI1NiJ9." + payload + ".demo-signature";

        return ResponseEntity.ok(Map.of(
                "token",    token,
                "username", username,
                "role",     "ROLE_USER"
        ));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<Map<String, String>> register(
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of(
                "message",  "User registered successfully",
                "username", request.getOrDefault("username", "")
        ));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token")
    public ResponseEntity<Map<String, String>> refresh() {
        return ResponseEntity.ok(Map.of("message", "Token refreshed"));
    }
}