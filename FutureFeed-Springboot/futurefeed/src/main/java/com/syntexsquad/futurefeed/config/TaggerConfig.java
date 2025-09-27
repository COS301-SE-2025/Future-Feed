package com.syntexsquad.futurefeed.config;

import com.syntexsquad.futurefeed.util.TopicSmartTaggerClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class TaggerConfig {
    public TaggerConfig(Environment env) {
        TopicSmartTaggerClient.setEnvironment(env);
    }
}
