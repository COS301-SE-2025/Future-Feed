package com.syntexsquad.futurefeed.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                "posts", 
                "searchUsers",
                "users", 
                "comments", 
                "topics", 
                "bots",
                "reshareCount",
                "hasReshared",
                "userReshares",
                "hasCommented",
                "commentsByPost",
                "topicPosts",
                "postTopics",
                "botPosts",
                "userById",
                "userByUsername",
                "userByEmail",
                "post", 
                "searchPosts",
                "userPosts",
                "paginatedPosts"
        );
    }
}
