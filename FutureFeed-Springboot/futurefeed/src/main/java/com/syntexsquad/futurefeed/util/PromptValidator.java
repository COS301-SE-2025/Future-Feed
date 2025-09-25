package com.syntexsquad.futurefeed.util;

import java.time.Duration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.moderation.ModerationClient;
import com.syntexsquad.futurefeed.moderation.PromptModerationResult;

import java.util.regex.Pattern;

public class PromptValidator {
    private static final Pattern MALICIOUS_PATTERN = Pattern.compile(
        "(?i)(ignore|override|bypass|jailbreak|disable|forget instructions|system prompt)"
    );

    // configurable via env or system prop; defaults to local FastAPI
    private static final String MOD_BASE =
            System.getProperty("moderation.base-url",
            System.getenv().getOrDefault("MODERATION_BASE_URL", "https://api.rookemtrading.com/fastapi"));

    private static final ModerationClient CLIENT = new ModerationClient(
            MOD_BASE,
            new ObjectMapper(),
            3,                  // retries
            300L,               // backoff start (ms)
            Duration.ofSeconds(3),
            Duration.ofSeconds(10)
    );

    public static void validatePrompt(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt cannot be empty.");
        }
        if (prompt.length() < 5) {
            throw new IllegalArgumentException("Prompt is too short to be meaningful.");
        }
        if (MALICIOUS_PATTERN.matcher(prompt).find()) {
            throw new IllegalArgumentException("Prompt contains potentially malicious instructions.");
        }
        if (prompt.matches(".*[!@#$%^&*()_+]{5,}.*")) {
            throw new IllegalArgumentException("Prompt contains nonsensical or spammy characters.");
        }

        if (!isSafeWithAI(prompt)) {
            throw new IllegalArgumentException("Prompt flagged as unsafe by AI moderation.");
        }
    }

    private static boolean isSafeWithAI(String prompt) {
        try {
            PromptModerationResult res = CLIENT.moderatePrompt(prompt);
            return res != null && res.isSafe();
        } catch (Exception e) {
            // Fail-safe policy: choose to block on moderation outage, or allow.
            // For now, block to keep the platform clean.
            e.printStackTrace();
            return false;
        }
    }
}
