package com.syntexsquad.futurefeed.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.env.Environment;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

public class TopicSmartTaggerClient {

    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static Environment env;

    // Called once by Spring (see TaggerConfig)
    public static void setEnvironment(Environment environment) {
        env = environment;
    }

    private static boolean isEnabled() {
        if (env != null) {
            return env.getProperty("tagger.enabled", Boolean.class, true);
        }
        return Boolean.parseBoolean(
            System.getProperty("tagger.enabled",
                System.getenv().getOrDefault("TAGGER_ENABLED", "true"))//make true for ai
        );
    }

    private static String getTaggerUrl() {
        if (env != null) {
            String val = env.getProperty("tagger.base-url");
            if (val != null && !val.isBlank()) return val;
        }
        String sysProp = System.getProperty("tagger.base-url");
        if (sysProp != null && !sysProp.isBlank()) return sysProp;

        String envVar = System.getenv("TAGGER_BASE_URL");
        if (envVar != null && !envVar.isBlank()) return envVar;

        throw new IllegalStateException("Tagger base URL not configured");
    }

    public static Map<String, List<String>> tag(String text, List<String> existingTopics, int maxTopics) {
        if (!isEnabled()) {
            return Map.of("selected", List.of(), "new", List.of());
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("text", text);
            payload.put("existing_topics", existingTopics != null ? existingTopics : List.of());
            payload.put("max_topics", maxTopics);

            String body = MAPPER.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(getTaggerUrl()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());
            Map<String, Object> json = MAPPER.readValue(response.body(), Map.class);

            List<String> selected = castStringList(json.get("selected"));
            List<String> nevv = castStringList(json.get("new"));

            return Map.of("selected", selected, "new", nevv);

        } catch (Exception e) {
            return Map.of("selected", List.of(), "new", List.of());
        }
    }

    @SuppressWarnings("unchecked")
    private static List<String> castStringList(Object obj) {
        if (obj instanceof List<?> list) {
            List<String> out = new ArrayList<>();
            for (Object o : list) {
                if (o instanceof String s && !s.isBlank()) {
                    out.add(s);
                }
            }
            return out;
        }
        return List.of();
    }
}
