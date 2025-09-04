package com.syntexsquad.futurefeed.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.model.BotPost;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class BotExecutionService {

    @Autowired
    private BotRepository botRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private BotPostService botPostService;

    private final String FASTAPI_URL = "http://localhost:8000/execute-bot";  // update if hosted differently

    public String executeBot(Integer botId) {
        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));

        try {
            // Prepare request payload
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("prompt", bot.getPrompt());
            requestBody.put("context_source", bot.getContextSource());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(FASTAPI_URL, request, String.class);

            String responseBody = response.getBody();
            System.out.println("FastAPI raw response: " + responseBody);  // Log raw response for debugging

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to execute bot: FastAPI responded with " + response.getStatusCode());
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(responseBody);

            // Check if FastAPI returned an error
            if (jsonNode.has("error")) {
                throw new RuntimeException("FastAPI error: " + jsonNode.get("error").asText());
            }

            JsonNode outputNode = jsonNode.get("output");
            if (outputNode == null || outputNode.isNull()) {
                throw new RuntimeException("FastAPI response missing 'output' field: " + jsonNode.toString());
            }

            String output = outputNode.asText().trim();

            // Validate output before saving
            if (isInvalidOutput(output)) {
                throw new RuntimeException("Bot output is invalid or empty, skipping post creation.");
            }

            // Save post
            BotPost post = new BotPost();
            post.setContent(output);
            post.setBot(bot);
            post.setUser(bot.getOwner());
            post.setCreatedAt(LocalDateTime.now());

            Post savedPost = postRepository.save(post);

            // Link bot-post
            botPostService.linkBotToPost(bot.getId(), savedPost.getId());

            return output;

        } catch (Exception e) {
            throw new RuntimeException("Bot execution failed: " + e.getMessage(), e);
        }
    }

    private boolean isInvalidOutput(String output) {
        if (output == null || output.isEmpty()) {
            return true;
        }

        String lower = output.toLowerCase();

        // Check minimal length
        if (output.length() < 20) {
            return true;
        }

        // Check for known failure or irrelevant phrases
        if (lower.contains("sorry, i couldn't extract meaningful content") ||
            lower.contains("failed to fetch context") ||
            lower.contains("no relevant news found") ||
            lower.contains("error") ||
            lower.contains("could not") ||
            lower.contains("unable to")) {
            return true;
        }

        return false;
    }
}

