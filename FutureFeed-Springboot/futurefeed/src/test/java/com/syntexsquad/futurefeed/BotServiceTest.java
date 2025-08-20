package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.BotRequestDTO;
import com.syntexsquad.futurefeed.dto.BotResponseDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.service.BotService;
import com.syntexsquad.futurefeed.util.PromptValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BotServiceTest {

    private BotRepository botRepository;
    private AppUserRepository userRepository;
    private BotService botService;

    private AppUser testUser;

    @BeforeEach
    void setUp() {
        botRepository = mock(BotRepository.class);
        userRepository = mock(AppUserRepository.class);
        botService = new BotService(botRepository, userRepository);

        // Mock authenticated user
        testUser = new AppUser();
        testUser.setId(1);
        testUser.setEmail("user@example.com");

        OAuth2User oAuth2User = mock(OAuth2User.class);
        when(oAuth2User.getAttributes()).thenReturn(Map.of("email", testUser.getEmail()));

        OAuth2AuthenticationToken authToken = mock(OAuth2AuthenticationToken.class);
        when(authToken.getPrincipal()).thenReturn(oAuth2User);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authToken);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
    }

    // ===== GET ALL BOTS =====
    @Test
    void testGetAllBots() {
        Bot bot1 = new Bot();
        Bot bot2 = new Bot();
        when(botRepository.findAll()).thenReturn(List.of(bot1, bot2));

        List<Bot> bots = botService.getAllBots();
        assertEquals(2, bots.size());
    }

    // ===== CREATE BOT =====
    @Test
    void testCreateBot_success() {
        BotRequestDTO request = new BotRequestDTO();
        request.setName("TestBot");
        request.setPrompt("Safe prompt");
        request.setSchedule("daily");
        request.setContextSource("http://example.com");

        Bot savedBot = new Bot();
        savedBot.setId(10);
        savedBot.setOwnerId(testUser.getId());
        savedBot.setName(request.getName());
        savedBot.setPrompt(request.getPrompt());
        savedBot.setSchedule(request.getSchedule());
        savedBot.setContextSource(request.getContextSource());
        savedBot.setCreatedAt(LocalDateTime.now());

        when(botRepository.save(any(Bot.class))).thenReturn(savedBot);

        try (MockedStatic<PromptValidator> mockedValidator = mockStatic(PromptValidator.class)) {
            mockedValidator.when(() -> PromptValidator.validatePrompt(anyString())).thenAnswer(i -> null);

            BotResponseDTO response = botService.createBot(request);

            assertNotNull(response);
            assertEquals(savedBot.getId(), response.getId());
            assertEquals(testUser.getId(), response.getOwnerId());
            assertEquals(request.getName(), response.getName());
            assertEquals(request.getPrompt(), response.getPrompt());
            assertEquals(savedBot.getSchedule(), response.getSchedule());
            assertEquals(savedBot.getContextSource(), response.getContextSource());
            assertEquals(savedBot.getCreatedAt(), response.getCreatedAt());

            // Verify save
            ArgumentCaptor<Bot> captor = ArgumentCaptor.forClass(Bot.class);
            verify(botRepository).save(captor.capture());
            Bot captured = captor.getValue();
            assertEquals(request.getName(), captured.getName());
            assertEquals(request.getPrompt(), captured.getPrompt());
        }
    }

    @Test
    void testCreateBot_invalidPrompt() {
        BotRequestDTO request = new BotRequestDTO();
        request.setPrompt(""); // empty, invalid

        try (MockedStatic<PromptValidator> mockedValidator = mockStatic(PromptValidator.class)) {
            mockedValidator.when(() -> PromptValidator.validatePrompt("")).thenThrow(new RuntimeException("Invalid prompt"));

            RuntimeException ex = assertThrows(RuntimeException.class, () -> botService.createBot(request));
            assertTrue(ex.getMessage().contains("Invalid prompt"));
        }
    }

    // ===== UPDATE BOT =====
    @Test
    void testUpdateBot_success() {
        Bot existingBot = new Bot();
        existingBot.setId(5);
        existingBot.setOwnerId(testUser.getId());
        existingBot.setName("OldName");
        existingBot.setPrompt("Old prompt");

        when(botRepository.findById(5)).thenReturn(Optional.of(existingBot));
        when(botRepository.save(any(Bot.class))).thenAnswer(i -> i.getArguments()[0]);

        BotRequestDTO updateRequest = new BotRequestDTO();
        updateRequest.setName("NewName");
        updateRequest.setPrompt("New prompt safe");
        updateRequest.setSchedule("weekly");
        updateRequest.setContextSource("source");

        try (MockedStatic<PromptValidator> mockedValidator = mockStatic(PromptValidator.class)) {
            mockedValidator.when(() -> PromptValidator.validatePrompt(anyString())).thenAnswer(i -> null);

            BotResponseDTO response = botService.updateBot(5, updateRequest);
            assertEquals("NewName", response.getName());
            assertEquals("New prompt safe", response.getPrompt());
            assertEquals("weekly", response.getSchedule());
            assertEquals("source", response.getContextSource());
        }
    }

    @Test
    void testUpdateBot_notOwner() {
        Bot bot = new Bot();
        bot.setId(5);
        bot.setOwnerId(999); // different owner
        when(botRepository.findById(5)).thenReturn(Optional.of(bot));

        BotRequestDTO request = new BotRequestDTO();
        request.setPrompt("Safe prompt");

        try (MockedStatic<PromptValidator> mockedValidator = mockStatic(PromptValidator.class)) {
            mockedValidator.when(() -> PromptValidator.validatePrompt(anyString())).thenAnswer(i -> null);

            RuntimeException ex = assertThrows(RuntimeException.class, () -> botService.updateBot(5, request));
            assertTrue(ex.getMessage().contains("permission"));
        }
    }

    @Test
    void testUpdateBot_notFound() {
        when(botRepository.findById(999)).thenReturn(Optional.empty());
        BotRequestDTO request = new BotRequestDTO();
        request.setPrompt("Safe prompt");

        try (MockedStatic<PromptValidator> mockedValidator = mockStatic(PromptValidator.class)) {
            mockedValidator.when(() -> PromptValidator.validatePrompt(anyString())).thenAnswer(i -> null);

            RuntimeException ex = assertThrows(RuntimeException.class, () -> botService.updateBot(999, request));
            assertTrue(ex.getMessage().contains("Bot not found"));
        }
    }

    // ===== DELETE BOT =====
    @Test
    void testDeleteBot_success() {
        Bot bot = new Bot();
        bot.setId(7);
        bot.setOwnerId(testUser.getId());
        when(botRepository.findById(7)).thenReturn(Optional.of(bot));

        assertDoesNotThrow(() -> botService.deleteBot(7));
        verify(botRepository).delete(bot);
    }

    @Test
    void testDeleteBot_notOwner() {
        Bot bot = new Bot();
        bot.setId(7);
        bot.setOwnerId(999);
        when(botRepository.findById(7)).thenReturn(Optional.of(bot));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> botService.deleteBot(7));
        assertTrue(ex.getMessage().contains("permission"));
    }

    @Test
    void testDeleteBot_notFound() {
        when(botRepository.findById(123)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> botService.deleteBot(123));
        assertTrue(ex.getMessage().contains("Bot not found"));
    }

    // ===== GET MY BOTS =====
    @Test
    void testGetMyBots() {
        Bot bot1 = new Bot();
        bot1.setOwnerId(testUser.getId());
        Bot bot2 = new Bot();
        bot2.setOwnerId(testUser.getId());
        when(botRepository.findByOwnerId(testUser.getId())).thenReturn(List.of(bot1, bot2));

        List<BotResponseDTO> myBots = botService.getMyBots();
        assertEquals(2, myBots.size());
    }

    @Test
    void testGetMyBots_empty() {
        when(botRepository.findByOwnerId(testUser.getId())).thenReturn(List.of());
        List<BotResponseDTO> myBots = botService.getMyBots();
        assertTrue(myBots.isEmpty());
    }

    // ===== AUTHENTICATION FAILURES =====
    @Test
    void testGetAuthenticatedUser_noAuth() {
        SecurityContextHolder.setContext(mock(SecurityContext.class));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> botService.getMyBots());
        assertTrue(ex.getMessage().contains("Could not extract authenticated user"));
    }
}
