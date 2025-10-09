package com.syntexsquad.futurefeed.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;

import java.util.TimeZone;

@Configuration
public class UtcConfig {

    @PostConstruct
    public void setJvmToUtc() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonUtc() {
        return builder -> builder.timeZone(TimeZone.getTimeZone("UTC"));
    }
}
