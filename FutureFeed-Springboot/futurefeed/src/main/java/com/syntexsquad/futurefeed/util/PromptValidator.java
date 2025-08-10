package com.syntexsquad.futurefeed.util;

import java.util.regex.Pattern;

public class PromptValidator {

    // block known dangerous patterns
    private static final Pattern MALICIOUS_PATTERN = Pattern.compile(
            "(?i)(ignore|override|bypass|jailbreak|disable|forget instructions|system prompt)"
    );

    public static void validatePrompt(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt cannot be empty.");
        }

        if (prompt.length() < 5) {
            throw new IllegalArgumentException("Prompt is too short to be meaningful.");
        }

        // Check for malicious instruction injection
        if (MALICIOUS_PATTERN.matcher(prompt).find()) {
            throw new IllegalArgumentException("Prompt contains potentially malicious instructions.");
        }

        // Check for excessive nonsensical characters
        if (prompt.matches(".*[!@#$%^&*()_+]{5,}.*")) {
            throw new IllegalArgumentException("Prompt contains nonsensical or spammy characters.");
        }
    }
}
