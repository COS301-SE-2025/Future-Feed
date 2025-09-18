package com.syntexsquad.futurefeed.mapper;

import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.UserPublicDTO;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.BotPostRepository;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class PostViewMapper {

    private final BotPostRepository botPostRepository;

    public PostViewMapper(BotPostRepository botPostRepository) {
        this.botPostRepository = botPostRepository;
    }

    public PostDTO toDto(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setCreatedAt(post.getCreatedAt() != null
                ? post.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null);

        if (post instanceof BotPost) {
            dto.setIsBot(true);
            // Resolve the bot through the join table
            var botOpt = botPostRepository.findBotByPostId(post.getId());
            botOpt.ifPresent(bot -> {
                dto.setBotId(bot.getId());
                dto.setUser(adaptBotToUser(bot));
            });
            // In case bot isn't linked yet, provide a graceful fallback
            if (dto.getUser() == null) {
                dto.setUser(placeholderBotUser());
            }
        } else {
            dto.setIsBot(false);
            dto.setBotId(null);
            dto.setUser(adaptAppUserToUser(post.getUser()));
        }

        return dto;
    }

    private UserPublicDTO adaptAppUserToUser(AppUser appUser) {
        if (appUser == null) return null;
        UserPublicDTO u = new UserPublicDTO();
        u.setId(appUser.getId());
        u.setUsername(appUser.getUsername());
        u.setDisplayName(appUser.getDisplayName());   // if your DTO has it
        u.setProfilePictureUrl(appUser.getProfilePictureUrl());       // if your DTO has it
        return u;
    }

    private UserPublicDTO adaptBotToUser(Bot bot) {
        UserPublicDTO u = new UserPublicDTO();
        // Important: present bot “as a user”
        // We keep id in same numeric space if your frontend relies on uniqueness per type;
        // if collisions are possible, consider `-botId` or a composite key on the client.
        u.setId(bot.getId());
        u.setUsername("@" + safe(bot.getName()));
        u.setDisplayName(bot.getName());
        u.setProfilePictureUrl(null);;           // add field in Bot if not present
        return u;
    }

    private UserPublicDTO placeholderBotUser() {
        UserPublicDTO u = new UserPublicDTO();
        u.setId(null);
        u.setUsername("@bot");
        u.setDisplayName("Bot");
        u.setProfilePictureUrl(null);
        return u;
    }

    private String safe(String s) { return s == null ? "" : s; }
}
