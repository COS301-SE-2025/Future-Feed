package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.BotRequestDTO;
import com.syntexsquad.futurefeed.dto.BotResponseDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            Object emailAttr = oAuth2User.getAttributes().get("email");
            if (emailAttr != null) {
                return appUserRepository.findByEmail(emailAttr.toString())
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB"));
            }
        }

        throw new RuntimeException("Could not extract authenticated user from security context");
    }

    public List<Bot> getAllBots() {
        return botRepository.findAll();
    }

    public BotResponseDTO createBot(BotRequestDTO dto) {
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
                .map(Bot::isActive) // use getter
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

    public List<Bot> getActiveBots() {
        return botRepository.findByActiveTrue();
    }
}
