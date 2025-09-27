package com.syntexsquad.futurefeed.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.moderation.ModerationClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class ModerationConfig {

    @Bean
    @ConditionalOnProperty(name = "moderation.enabled", havingValue = "true")
    public ModerationClient moderationClient(
            ObjectMapper mapper,
            @Value("${moderation.base-url:http://localhost:8000}") String baseUrl,
            @Value("${moderation.retries:3}") int retries,
            @Value("${moderation.backoff-ms:300}") long backoffMs,
            @Value("${moderation.connect-timeout-ms:3000}") long connectTimeoutMs,
            @Value("${moderation.request-timeout-ms:10000}") long requestTimeoutMs
    ) {
        return new ModerationClient(
                baseUrl,
                mapper,
                retries,
                backoffMs,
                Duration.ofMillis(connectTimeoutMs),
                Duration.ofMillis(requestTimeoutMs)
        );
    }
}
