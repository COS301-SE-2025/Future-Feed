package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.BotRequestDTO;
import com.syntexsquad.futurefeed.dto.BotResponseDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.util.PromptValidator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BotService {

    private final BotRepository botRepository;
    private final AppUserRepository appUserRepository;

    public BotService(BotRepository botRepository, AppUserRepository appUserRepository) {
        this.botRepository = botRepository;
        this.appUserRepository = appUserRepository;
    }

   private AppUser getAuthenticatedUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
        throw new RuntimeException("User not authenticated");
    }

    // --- Case 1: OAuth2 login (e.g., Google) ---
    if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        if (email == null) {
            throw new RuntimeException("Email not found in OAuth2 attributes");
        }

        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated OAuth2 user not found in DB"));
    }

    // --- Case 2: Manual login (form-based) ---
    Object principal = authentication.getPrincipal();
    String usernameOrEmail;

    if (principal instanceof com.syntexsquad.futurefeed.security.AppUserDetails appUserDetails) {
        usernameOrEmail = appUserDetails.getUsername();
    } else if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
        usernameOrEmail = userDetails.getUsername();
    } else if (principal instanceof String strPrincipal) {
        usernameOrEmail = strPrincipal;
    } else {
        throw new RuntimeException("Unsupported authentication principal type: " + principal.getClass());
    }

    // Try lookup by email first, fallback to username
    return appUserRepository.findByEmail(usernameOrEmail)
            .or(() -> appUserRepository.findByUsername(usernameOrEmail))
            .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
}

    public List<Bot> getAllBots() {
        return botRepository.findAll();
    }

    public BotResponseDTO createBot(BotRequestDTO dto) {
        PromptValidator.validatePrompt(dto.getPrompt());

        AppUser user = getAuthenticatedUser();

        Bot bot = new Bot();
        bot.setOwnerId(user.getId());
        bot.setName(dto.getName());
        bot.setPrompt(dto.getPrompt());
        bot.setSchedule(dto.getSchedule());
        bot.setContextSource(dto.getContextSource());

        Bot saved = botRepository.save(bot);
        return toResponseDTO(saved);
    }

    public BotResponseDTO getBotById(Integer botId) {
        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));
        return toResponseDTO(bot);
    }

    public BotResponseDTO updateBot(Integer botId, BotRequestDTO dto) {
        PromptValidator.validatePrompt(dto.getPrompt()); 

        AppUser user = getAuthenticatedUser();

        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));

        if (!bot.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to update this bot");
        }

        bot.setName(dto.getName());
        bot.setPrompt(dto.getPrompt());
        bot.setSchedule(dto.getSchedule());
        bot.setContextSource(dto.getContextSource());

        Bot updated = botRepository.save(bot);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteBot(Integer botId) {
        AppUser user = getAuthenticatedUser();

        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));

        if (!bot.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to delete this bot");
        }

        botRepository.delete(bot);
    }

    public List<BotResponseDTO> getMyBots() {
        AppUser user = getAuthenticatedUser();
        return botRepository.findByOwnerId(user.getId())
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private BotResponseDTO toResponseDTO(Bot bot) {
        BotResponseDTO dto = new BotResponseDTO();
        dto.setId(bot.getId());
        dto.setOwnerId(bot.getOwnerId());
        dto.setName(bot.getName());
        dto.setPrompt(bot.getPrompt());
        dto.setSchedule(bot.getSchedule());
        dto.setContextSource(bot.getContextSource());
        dto.setCreatedAt(bot.getCreatedAt());
        return dto;
    }

    public boolean isBotActive(Integer botId) {
        return botRepository.findById(botId)
                .map(Bot::isActive)
                .orElseThrow(() -> new RuntimeException("Bot not found"));
    }

    public Bot activateBot(Integer botId) {
        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));
        bot.setActive(true);
        return botRepository.save(bot);
    }

    public Bot deactivateBot(Integer botId) {
        Bot bot = botRepository.findById(botId)
                .orElseThrow(() -> new RuntimeException("Bot not found"));
        bot.setActive(false);
        return botRepository.save(bot);
    }
}
