package com.syntexsquad.futurefeed.mapper;

import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.UserPublicDTO;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.BotPostRepository;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class PostViewMapper {

    private final BotPostRepository botPostRepository;

    public PostViewMapper(BotPostRepository botPostRepository) {
        this.botPostRepository = botPostRepository;
    }

    // --- Single post mapping ---
    public PostDTO toDto(Post post) {
        PostDTO dto = baseDto(post);

        if (post instanceof BotPost) {
            botPostRepository.findBotByPostId(post.getId()).ifPresentOrElse(
                bot -> {
                    dto.setIsBot(true);
                    dto.setBotId(bot.getId());
                    dto.setUser(toBotUser(bot));
                },
                () -> {
                    dto.setIsBot(true);
                    dto.setUser(placeholderBotUser());
                }
            );
        } else {
            dto.setIsBot(false);
            dto.setUser(toAppUser(post.getUser()));
        }
        return dto;
    }

    // --- Batch optimized mapping ---
    public List<PostDTO> toDtoList(List<Post> posts) {
        if (posts.isEmpty()) return List.of();

        // Collect only BOT posts
        List<Integer> botPostIds = posts.stream()
                .filter(p -> p instanceof BotPost)
                .map(Post::getId)
                .toList();

        // Fetch bot relations in bulk
        Map<Integer, Bot> botMap = new HashMap<>();
        if (!botPostIds.isEmpty()) {
            for (Object[] row : botPostRepository.findBotsByPostIds(botPostIds)) {
                Integer postId = (Integer) row[0];
                Bot bot = (Bot) row[1];
                botMap.put(postId, bot);
            }
        }

        // Map everything
        return posts.stream().map(p -> {
            PostDTO dto = baseDto(p);

            if (p instanceof BotPost) {
                dto.setIsBot(true);
                Bot bot = botMap.get(p.getId());
                if (bot != null) {
                    dto.setBotId(bot.getId());
                    dto.setUser(toBotUser(bot));
                } else {
                    dto.setUser(placeholderBotUser());
                }
            } else {
                dto.setIsBot(false);
                dto.setUser(toAppUser(p.getUser()));
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // --- Helpers ---
    private PostDTO baseDto(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt() != null
                ? post.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null);
        return dto;
    }

    private UserPublicDTO toAppUser(AppUser u) {
        if (u == null) return null;
        UserPublicDTO dto = new UserPublicDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setDisplayName(u.getDisplayName());
        dto.setBio(u.getBio());
        dto.setProfilePictureUrl(
                (u.getProfilePictureUrl() != null && !u.getProfilePictureUrl().isBlank())
                        ? u.getProfilePictureUrl()
                        : u.getProfilePicture()
        );
        return dto;
    }

    private UserPublicDTO toBotUser(Bot bot) {
        UserPublicDTO dto = new UserPublicDTO();
        dto.setId(bot.getId());
        dto.setUsername("@" + safe(bot.getName()));
        dto.setDisplayName(bot.getName());
        dto.setProfilePictureUrl(null); // extend Bot if you want pic
        return dto;
    }

    private UserPublicDTO placeholderBotUser() {
        UserPublicDTO dto = new UserPublicDTO();
        dto.setId(null);
        dto.setUsername("@bot");
        dto.setDisplayName("Bot");
        return dto;
    }

    private String safe(String s) { return s == null ? "" : s; }
}
