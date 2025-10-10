package com.syntexsquad.futurefeed.service;

import com.syntexsquad.futurefeed.dto.BotRequestDTO;
import com.syntexsquad.futurefeed.dto.BotResponseDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.util.PromptValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BotService {

    private static final Logger log = LoggerFactory.getLogger(BotService.class);

    private final BotRepository botRepository;
    private final AppUserRepository appUserRepository;

    public BotService(BotRepository botRepository, AppUserRepository appUserRepository) {
        this.botRepository = botRepository;
        this.appUserRepository = appUserRepository;
    }

    private Optional<AppUser> tryGetCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return Optional.empty();

        if (auth instanceof OAuth2AuthenticationToken oauth) {
            OAuth2User principal = oauth.getPrincipal();
            if (principal != null) {
                Map<String, Object> attrs = principal.getAttributes();
                Object emailAttr = attrs == null ? null : attrs.get("email");
                if (emailAttr != null) {
                    String email = String.valueOf(emailAttr);
                    Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                    if (byEmail.isPresent()) return byEmail;
                }
            }
        }

        Object principal = auth.getPrincipal();

        try {
            Class<?> audClass = Class.forName("com.syntexsquad.futurefeed.security.AppUserDetails");
            if (audClass.isInstance(principal)) {
                Object aud = principal;
                try {
                    Integer id = (Integer) audClass.getMethod("getId").invoke(aud);
                    if (id != null) {
                        Optional<AppUser> byId = appUserRepository.findById(id);
                        if (byId.isPresent()) return byId;
                    }
                } catch (NoSuchMethodException ignored) {}
                try {
                    String email = String.valueOf(audClass.getMethod("getEmail").invoke(aud));
                    if (email != null && !email.isBlank()) {
                        Optional<AppUser> byEmail = appUserRepository.findByEmail(email);
                        if (byEmail.isPresent()) return byEmail;
                    }
                } catch (NoSuchMethodException ignored) {}
                try {
                    String username = String.valueOf(audClass.getMethod("getUsername").invoke(aud));
                    if (username != null && !username.isBlank()) {
                        Optional<AppUser> byName = appUserRepository.findByEmail(username)
                                .or(() -> appUserRepository.findByUsername(username));
                        if (byName.isPresent()) return byName;
                    }
                } catch (NoSuchMethodException ignored) {}
            }
        } catch (ClassNotFoundException ignored) {
        } catch (Exception reflectErr) {
            log.warn("tryGetCurrentUser (BotService): AppUserDetails reflection error: {}", reflectErr.toString());
        }

        if (principal instanceof UserDetails ud) {
            String name = ud.getUsername();
            if (name != null && !name.isBlank()) {
                Optional<AppUser> byName = appUserRepository.findByEmail(name)
                        .or(() -> appUserRepository.findByUsername(name));
                if (byName.isPresent()) return byName;
            }
        }

        if (principal instanceof String s && !s.isBlank()) {
            Optional<AppUser> byName = appUserRepository.findByEmail(s)
                    .or(() -> appUserRepository.findByUsername(s));
            if (byName.isPresent()) return byName;
        }

        String fallback = auth.getName();
        if (fallback != null && !fallback.isBlank()) {
            Optional<AppUser> byName = appUserRepository.findByEmail(fallback)
                    .or(() -> appUserRepository.findByUsername(fallback));
            if (byName.isPresent()) return byName;
        }

        return Optional.empty();
    }

    private AppUser getAuthenticatedUser() {
        return tryGetCurrentUser()
                .orElseThrow(() -> new RuntimeException("Could not extract authenticated user from security context"));
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
