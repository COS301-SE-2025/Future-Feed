package com.syntexsquad.futurefeed.util;

import java.net.http.*;
import java.net.URI;
import java.net.http.HttpRequest.BodyPublishers;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TopicSmartTaggerClient {
    private static final String TAGGER_URL = "http://localhost:8000/tag-topics-smart";

    public static Map<String, List<String>> tag(String text, List<String> existingTopics, int maxTopics) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> payload = new HashMap<>();
            payload.put("text", text);
            payload.put("existing_topics", existingTopics);
            payload.put("max_topics", maxTopics);

            String body = mapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(TAGGER_URL))
                    .header("Content-Type", "application/json")
                    .POST(BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            Map<String, Object> json = mapper.readValue(response.body(), Map.class);

            List<String> selected = castStringList(json.get("selected"));
            List<String> nevv = castStringList(json.get("new"));

            Map<String, List<String>> out = new HashMap<>();
            out.put("selected", selected);
            out.put("new", nevv);
            return out;
        } catch (Exception e) {
            return Map.of("selected", List.of(), "new", List.of());
        }
    }

    @SuppressWarnings("unchecked")
    private static List<String> castStringList(Object obj) {
        if (obj instanceof List<?> list) {
            List<String> out = new ArrayList<>();
            for (Object o : list) if (o instanceof String s && !s.isBlank()) out.add(s);
            return out;
        }
        return List.of();
    }
}
