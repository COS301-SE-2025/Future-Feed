package com.syntexsquad.futurefeed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@Service
public class ImageGenService {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public ImageGenService(
            RestTemplateBuilder builder,
            @Value("${fastapi.base-url:http://localhost:8000}") String baseUrl
    ) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(60))
                .build();
        this.baseUrl = baseUrl;
    }

    /**
     * Calls FastAPI /generate-image and returns base64 PNG.
     */
    public String generateImageBase64(String prompt, Integer width, Integer height, Integer steps, String model) {
        String url = baseUrl + "/generate-image";

        // Build request body
        Map<String, Object> body = Map.of(
                "prompt", prompt,
                "width", width == null ? 1024 : width,
                "height", height == null ? 1024 : height,
                "steps", steps,                 // may be null; FastAPI clamps in its lib
                "model", model,                 // may be null; FastAPI will use default
                "safe_check", true
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new RuntimeException("image service error: " + resp.getStatusCode());
            }
            Object b64 = resp.getBody().get("b64");
            if (b64 == null) {
                throw new RuntimeException("image service returned no 'b64'");
            }
            return b64.toString();
        } catch (RestClientResponseException e) {
            throw new RuntimeException("image service " + e.getRawStatusCode() + ": " + e.getResponseBodyAsString(), e);
        }
    }
}
