package com.syntexsquad.futurefeed.util;

import java.util.regex.Pattern;
import java.net.http.*;
import java.net.URI;
import java.net.http.HttpRequest.BodyPublishers;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class PromptValidator {
    private static final Pattern MALICIOUS_PATTERN = Pattern.compile(
        "(?i)(ignore|override|bypass|jailbreak|disable|forget instructions|system prompt)"
    );

    private static final String MODERATION_API_URL = "http://localhost:8000/moderate";

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

        // Calls AI moderation endpoint
        if (!isSafeWithAI(prompt)) {
            throw new IllegalArgumentException("Prompt flagged as unsafe by AI moderation.");
        }
    }

    private static boolean isSafeWithAI(String prompt) {
        try {
                HttpClient client = HttpClient.newHttpClient();
                ObjectMapper mapper = new ObjectMapper();
                String jsonBody = mapper.writeValueAsString(Map.of("prompt", prompt));

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(MODERATION_API_URL))
                        .header("Content-Type", "application/json")
                        .POST(BodyPublishers.ofString(jsonBody))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                Map<String, Object> result = mapper.readValue(response.body(), Map.class);

                // Expect result contains "safe": true/false
                return Boolean.TRUE.equals(result.get("safe"));
        } catch (Exception e) {
            // Fail safe: block prompt on error or allow based on your policy
            e.printStackTrace();
            return false;
        }
    }
}

