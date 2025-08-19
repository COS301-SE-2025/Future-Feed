package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.BotRequestDTO;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.service.BotExecutionService;
import com.syntexsquad.futurefeed.util.PromptValidator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.MockedStatic;
import org.mockito.Mockito;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for BotController/BotService using inlined H2 config.
 * - Proper static mocking of PromptValidator.validatePrompt(String)
 * - BotExecutionService is @MockBean to avoid external API dependency
 * - No @Transactional, real DB writes against in-memory H2
 * - 20 tests total
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
public class BotIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private AppUserRepository userRepo;
    @Autowired private BotRepository botRepo;
    @Autowired private ObjectMapper objectMapper;

    // Avoid calling the external service
    @MockBean private BotExecutionService botExecutionService;

    private AppUser testUser;
    private MockedStatic<PromptValidator> promptValidatorStatic;

    // ---------- helpers

    private void loginAs(AppUser u) {
        Map<String, Object> attributes = Map.of("email", u.getEmail());
        OAuth2User oAuth2User = new DefaultOAuth2User(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );
        OAuth2AuthenticationToken auth = new OAuth2AuthenticationToken(
                oAuth2User,
                oAuth2User.getAuthorities(),
                "google"
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private AppUser ensureUser(String username, String email) {
        return userRepo.findByUsername(username).orElseGet(() -> {
            AppUser u = new AppUser();
            u.setUsername(username);
            u.setEmail(email);
            u.setPassword("test123");
            u.setDisplayName(username);
            u.setBio("bio");
            u.setDateOfBirth(LocalDate.of(2000, 1, 1));
            return userRepo.save(u);
        });
    }

    // ---------- lifecycle

    @BeforeEach
    public void setup() {
        // Reset DB state
        botRepo.deleteAll();
        userRepo.deleteAll();

        // Recreate test user and login
        testUser = ensureUser("testuser", "testuser@example.com");
        loginAs(testUser);

        // Static mock for PromptValidator.validatePrompt(String)
        promptValidatorStatic = Mockito.mockStatic(PromptValidator.class);
        promptValidatorStatic.when(() -> PromptValidator.validatePrompt(anyString()))
                             .thenAnswer(invocation -> null); // no-op

        // Default exec mock
        Mockito.reset(botExecutionService);
        Mockito.when(botExecutionService.executeBot(anyInt()))
               .thenReturn("Mock bot output");
    }

    @AfterEach
    public void tearDown() {
        if (promptValidatorStatic != null) {
            promptValidatorStatic.close();
        }
        SecurityContextHolder.clearContext();
    }

    // ---------- tests (20) ----------

    // 1
    @Test
    public void testCreateBot() throws Exception {
        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("TestBot");
        dto.setPrompt("Generate a motivational quote");
        dto.setSchedule("daily");
        dto.setContextSource(null);

        mockMvc.perform(post("/api/bots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("TestBot"))
                .andExpect(jsonPath("$.ownerId").value(testUser.getId()))
                .andExpect(jsonPath("$.prompt").value("Generate a motivational quote"))
                .andExpect(jsonPath("$.schedule").value("daily"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    // 2
    @Test
    public void testCreateBot_WithContextSource() throws Exception {
        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("CtxBot");
        dto.setPrompt("Use context");
        dto.setSchedule("hourly");
        dto.setContextSource("rss:https://example.com/feed");

        mockMvc.perform(post("/api/bots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("CtxBot"))
                .andExpect(jsonPath("$.contextSource").value("rss:https://example.com/feed"));
    }

    // 3
    @Test
    public void testGetMyBots_Empty() throws Exception {
        mockMvc.perform(get("/api/bots/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // 4
    @Test
    public void testGetMyBots() throws Exception {
        Bot bot = new Bot();
        bot.setName("ExistingBot");
        bot.setPrompt("Test prompt");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("hourly");
        botRepo.save(bot);

        mockMvc.perform(get("/api/bots/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("ExistingBot"))
                .andExpect(jsonPath("$[0].ownerId").value(testUser.getId()));
    }

    // 5
    @Test
    public void testCreateMultipleBots_ListingCount() throws Exception {
        for (int i = 1; i <= 3; i++) {
            BotRequestDTO dto = new BotRequestDTO();
            dto.setName("B" + i);
            dto.setPrompt("P" + i);
            dto.setSchedule("daily");
            mockMvc.perform(post("/api/bots")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(get("/api/bots/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("B1", "B2", "B3")));
    }

    // 6
    @Test
    public void testUpdateBot() throws Exception {
        Bot bot = new Bot();
        bot.setName("BotToUpdate");
        bot.setPrompt("Old prompt");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("daily");
        bot = botRepo.save(bot);

        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("UpdatedBot");
        dto.setPrompt("Updated prompt");
        dto.setSchedule("weekly");
        dto.setContextSource(null);

        mockMvc.perform(put("/api/bots/" + bot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("UpdatedBot"))
                .andExpect(jsonPath("$.prompt").value("Updated prompt"))
                .andExpect(jsonPath("$.schedule").value("weekly"));
    }

    // 7
    @Test
    public void testUpdateBot_NotFound() throws Exception {
        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("Nope");
        dto.setPrompt("None");
        dto.setSchedule("daily");

        mockMvc.perform(put("/api/bots/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                // Service throws RuntimeException -> default 500
                .andExpect(status().isInternalServerError());
    }

    // 8
    @Test
    public void testUpdateBot_OtherUserForbidden() throws Exception {
        // Create bot owned by testUser
        Bot bot = new Bot();
        bot.setName("OwnerBot");
        bot.setPrompt("Owner prompt");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("daily");
        bot = botRepo.save(bot);

        // Login as another user
        AppUser other = ensureUser("other", "other@example.com");
        loginAs(other);

        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("HackerUpdate");
        dto.setPrompt("Try to update");
        dto.setSchedule("hourly");

        mockMvc.perform(put("/api/bots/" + bot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isInternalServerError()); // forbidden -> runtime -> 500
    }

    // 9
    @Test
    public void testDeleteBot() throws Exception {
        Bot bot = new Bot();
        bot.setName("BotToDelete");
        bot.setPrompt("Delete me");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("daily");
        bot = botRepo.save(bot);

        mockMvc.perform(delete("/api/bots/" + bot.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Bot deleted successfully"));

        assertTrue(botRepo.findById(bot.getId()).isEmpty(), "Bot should be deleted");
    }

    // 10
    @Test
    public void testDeleteBot_NotFound() throws Exception {
        mockMvc.perform(delete("/api/bots/777777"))
                .andExpect(status().isInternalServerError());
    }

    // 11
    @Test
    public void testDeleteBot_OtherUserForbidden() throws Exception {
        Bot bot = new Bot();
        bot.setName("ProtectedBot");
        bot.setPrompt("Owner keeps it");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("daily");
        bot = botRepo.save(bot);

        AppUser other = ensureUser("other2", "other2@example.com");
        loginAs(other);

        mockMvc.perform(delete("/api/bots/" + bot.getId()))
                .andExpect(status().isInternalServerError()); // forbidden -> runtime -> 500
    }

    // 12
    @Test
    public void testExecuteBot() throws Exception {
        Bot bot = new Bot();
        bot.setName("BotToExecute");
        bot.setPrompt("Say hello");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("daily");
        bot = botRepo.save(bot);

        mockMvc.perform(get("/api/bots/" + bot.getId() + "/execute"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.output").value("Mock bot output"))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    // 13
    @Test
    public void testExecuteBot_NotFound() throws Exception {
        // Controller catches and returns 500 + {"error": "..."}
        Mockito.when(botExecutionService.executeBot(anyInt()))
               .thenThrow(new RuntimeException("Bot not found"));

        mockMvc.perform(get("/api/bots/123456/execute"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error", containsString("Bot not found")));
    }

    // 14
    @Test
    public void testExecuteBot_ServiceThrows() throws Exception {
        Bot bot = new Bot();
        bot.setName("Exploder");
        bot.setPrompt("Boom");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("hourly");
        bot = botRepo.save(bot);

        Mockito.when(botExecutionService.executeBot(bot.getId()))
               .thenThrow(new RuntimeException("FastAPI down"));

        mockMvc.perform(get("/api/bots/" + bot.getId() + "/execute"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error", containsString("FastAPI down")));
    }

    // 15
    @Test
    public void testCreateBot_AllFieldsPersisted() throws Exception {
        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("PersistBot");
        dto.setPrompt("Persist me");
        dto.setSchedule("weekly");
        dto.setContextSource("db:table");

        mockMvc.perform(post("/api/bots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("PersistBot"))
                .andExpect(jsonPath("$.prompt").value("Persist me"))
                .andExpect(jsonPath("$.schedule").value("weekly"))
                .andExpect(jsonPath("$.contextSource").value("db:table"))
                .andExpect(jsonPath("$.ownerId").value(testUser.getId()));
    }

    // 16
    @Test
    public void testUpdateBot_OnlyFieldsChange() throws Exception {
        Bot bot = new Bot();
        bot.setName("Partial");
        bot.setPrompt("Orig");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("daily");
        bot.setContextSource("x");
        bot = botRepo.save(bot);

        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("PartialUpdated");
        dto.setPrompt("Orig2");
        dto.setSchedule("weekly");
        dto.setContextSource("y");

        mockMvc.perform(put("/api/bots/" + bot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("PartialUpdated"))
                .andExpect(jsonPath("$.prompt").value("Orig2"))
                .andExpect(jsonPath("$.schedule").value("weekly"))
                .andExpect(jsonPath("$.contextSource").value("y"));
    }

    // 17
    @Test
    public void testExecuteAfterUpdate_UsesLatestPrompt() throws Exception {
        Bot bot = new Bot();
        bot.setName("UpdatableExec");
        bot.setPrompt("First");
        bot.setOwnerId(testUser.getId());
        bot.setSchedule("daily");
        bot = botRepo.save(bot);

        // Update
        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("UpdatableExec");
        dto.setPrompt("Second");
        dto.setSchedule("daily");
        mockMvc.perform(put("/api/bots/" + bot.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        // Re-stub execution return to confirm new run
        Mockito.when(botExecutionService.executeBot(bot.getId()))
               .thenReturn("Output after update");

        mockMvc.perform(get("/api/bots/" + bot.getId() + "/execute"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.output").value("Output after update"));
    }

    // 18
    @Test
    public void testCreateThenDeleteThenExecute_NotFound() throws Exception {
        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("TempBot");
        dto.setPrompt("temp");
        dto.setSchedule("daily");

        String createJson = mockMvc.perform(post("/api/bots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // extract id
        Map<?,?> map = objectMapper.readValue(createJson, Map.class);
        Integer id = (Integer) map.get("id");

        mockMvc.perform(delete("/api/bots/" + id))
               .andExpect(status().isOk());

        Mockito.when(botExecutionService.executeBot(id))
               .thenThrow(new RuntimeException("Bot not found"));

        mockMvc.perform(get("/api/bots/" + id + "/execute"))
               .andExpect(status().isInternalServerError())
               .andExpect(jsonPath("$.error", containsString("Bot not found")));
    }

    // 19
    @Test
    public void testCreateManyNames_AreDistinctInListing() throws Exception {
        List<String> names = List.of("Alpha", "Beta", "Gamma", "Delta");
        for (String n : names) {
            BotRequestDTO dto = new BotRequestDTO();
            dto.setName(n);
            dto.setPrompt("p:" + n);
            dto.setSchedule("daily");
            mockMvc.perform(post("/api/bots")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(get("/api/bots/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("Alpha", "Beta", "Gamma", "Delta")));
    }

    // 20
    @Test
    public void testCreateBot_AllowsEmptyPromptBecauseValidatorIsBypassedInTests() throws Exception {
        // Since we mocked PromptValidator.validatePrompt to no-op, empty is allowed here (DB may still allow it)
        BotRequestDTO dto = new BotRequestDTO();
        dto.setName("NoPrompt");
        dto.setPrompt(""); // empty
        dto.setSchedule("daily");

        mockMvc.perform(post("/api/bots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("NoPrompt"))
                .andExpect(jsonPath("$.prompt").value(""));
    }
}
