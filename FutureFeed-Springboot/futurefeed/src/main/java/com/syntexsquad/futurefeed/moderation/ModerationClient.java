package com.syntexsquad.futurefeed.moderation;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ModerationClient {

    private final String baseUrl; // e.g., http://localhost:8000
    private final ObjectMapper mapper;
    private final HttpClient http;

    private final int maxRetries;
    private final long backoffMillis;
    private final Duration connectTimeout;
    private final Duration requestTimeout;

    public ModerationClient(String baseUrl,
                            ObjectMapper mapper,
                            int maxRetries,
                            long backoffMillis,
                            Duration connectTimeout,
                            Duration requestTimeout) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.mapper = mapper != null ? mapper : new ObjectMapper();
        this.maxRetries = Math.max(1, maxRetries);
        this.backoffMillis = Math.max(100L, backoffMillis);
        this.connectTimeout = connectTimeout != null ? connectTimeout : Duration.ofSeconds(3);
        this.requestTimeout = requestTimeout != null ? requestTimeout : Duration.ofSeconds(10);

        // 🔑 Force HTTP/1.1 so the request body is always sent
        this.http = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(this.connectTimeout)
                .build();
    }

    /** POST /moderate-post */
    public ModerationResult moderatePost(String text, List<String> links, List<String> imagePaths, boolean allowMildProfanity) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("text", text == null ? "" : text);
        body.put("links", links == null ? List.of() : links);
        body.put("image_paths", imagePaths == null ? List.of() : imagePaths);
        body.put("allow_mild_profanity", allowMildProfanity);

        String url = baseUrl + "/moderate-post";
        String json = mapper.writeValueAsString(body);

        // Debug log
        System.out.println("[ModerationClient] Sending JSON to " + url + " => " + json);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(requestTimeout)
                .header("Content-Type", "application/json; charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> resp = sendWithRetry(req);

        // Debug log
        System.out.println("[ModerationClient] Response status=" + resp.statusCode() + " body=" + resp.body());

        if (resp.statusCode() / 100 != 2) {
            throw new RuntimeException("Moderation service error " + resp.statusCode() + ": " + resp.body());
        }
        return mapper.readValue(resp.body(), ModerationResult.class);
    }

    /** POST /moderate (prompt-only safety) */
    public PromptModerationResult moderatePrompt(String prompt) throws Exception {
        String url = baseUrl + "/moderate";
        Map<String, Object> body = Map.of("prompt", prompt == null ? "" : prompt);
        String json = mapper.writeValueAsString(body);

        System.out.println("[ModerationClient] Sending JSON to " + url + " => " + json);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(requestTimeout)
                .header("Content-Type", "application/json; charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> resp = sendWithRetry(req);

        System.out.println("[ModerationClient] Response status=" + resp.statusCode() + " body=" + resp.body());

        if (resp.statusCode() / 100 != 2) {
            throw new RuntimeException("Moderation prompt error " + resp.statusCode() + ": " + resp.body());
        }
        return mapper.readValue(resp.body(), PromptModerationResult.class);
    }

    private HttpResponse<String> sendWithRetry(HttpRequest request) throws Exception {
        int attempt = 0;
        Exception last = null;
        while (attempt < maxRetries) {
            try {
                return http.send(request, HttpResponse.BodyHandlers.ofString());
            } catch (Exception ex) {
                last = ex;
                Thread.sleep(backoffMillis * (1L << attempt)); // exponential backoff
                attempt++;
            }
        }
        throw last != null ? last : new RuntimeException("Unknown error calling moderation service");
    }
}
