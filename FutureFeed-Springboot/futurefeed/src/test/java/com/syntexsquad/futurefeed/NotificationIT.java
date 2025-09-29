package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.cache.type=NONE",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class NotificationIT {

    @Autowired private MockMvc mockMvc;
    @MockBean private com.syntexsquad.futurefeed.service.MediaService mediaService;
    @Autowired private ObjectMapper objectMapper;

    // --- repositories for cleanup ---
    @Autowired private PresetRuleRepository ruleRepo;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private ReshareRepository reshareRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private LikeRepository likeRepo;
    @Autowired private BookmarkRepository bookmarkRepo;
    @Autowired private BotPostRepository botPostRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private FollowerRepository followerRepo;
    @Autowired private BotRepository botRepo;
    @Autowired private AppUserRepository userRepo;

    @Autowired private ClientRegistrationRepository clientRegistrationRepository;
    @Autowired private CacheManager cacheManager;

    @MockBean private com.syntexsquad.futurefeed.config.S3Config s3Config;

    private AppUser recipient;
    private AppUser sender;

    @BeforeEach
    void clearCacheAndDb() {
        cacheManager.getCacheNames().forEach(n -> cacheManager.getCache(n).clear());

        ruleRepo.deleteAll();
        presetRepo.deleteAll();
        reshareRepo.deleteAll();
        commentRepo.deleteAll();
        likeRepo.deleteAll();
        bookmarkRepo.deleteAll();
        botPostRepo.deleteAll();
        postTopicRepo.deleteAll();
        postRepo.deleteAll();
        notificationRepo.deleteAll();
        followerRepo.deleteAll();
        botRepo.deleteAll();
        userRepo.deleteAll();

        recipient = new AppUser();
        recipient.setUsername("recipient");
        recipient.setEmail("recipient@example.com");
        recipient.setRole("ROLE_USER");
        recipient.setPassword("pw");
        recipient = userRepo.save(recipient);

        sender = new AppUser();
        sender.setUsername("sender");
        sender.setEmail("sender@example.com");
        sender.setRole("ROLE_USER");
        sender.setPassword("pw");
        sender = userRepo.save(sender);
    }

    @Test @Order(1)
    void getAllNotifications_emptyInitially() throws Exception {
        mockMvc.perform(get("/api/notifications")
                        .with(oauth2Login().attributes(a -> a.put("email", recipient.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(content().string("[]"));
    }

    @Test @Order(2)
    void getNotificationsForUser_shouldReturnOne() throws Exception {
        Notification n = new Notification();
        n.setRecipientUserId(recipient.getId());
        n.setSenderUserId(sender.getId());
        n.setType("LIKE");
        n.setSenderUsername("sender");
        n.setMassage("msg");
        n.setPostId(42);
        n.setIsRead(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepo.saveAndFlush(n);

        mockMvc.perform(get("/api/notifications/{userId}", recipient.getId())
                        .with(oauth2Login().attributes(a -> a.put("email", recipient.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("LIKE"))
                .andExpect(jsonPath("$[0].senderUserId").value(sender.getId()));
    }

    @Test @Order(3)
    void markNotificationAsRead_shouldSucceed() throws Exception {
        Notification n = new Notification();
        n.setRecipientUserId(recipient.getId());
        n.setSenderUserId(sender.getId());
        n.setType("COMMENT");
        n = notificationRepo.saveAndFlush(n);

        mockMvc.perform(put("/api/notifications/{id}/read", n.getId())
                        .param("userId", recipient.getId().toString())
                        .with(oauth2Login().attributes(a -> a.put("email", recipient.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(content().string("Notification marked as read"));

        Notification updated = notificationRepo.findById(n.getId()).orElseThrow();
        assertThat(updated.getIsRead()).isTrue();
    }

    @Test @Order(4)
    void markAllNotificationsAsRead_shouldUpdateAll() throws Exception {
        Notification n1 = new Notification();
        n1.setRecipientUserId(recipient.getId());
        n1.setSenderUserId(sender.getId());
        n1.setType("LIKE");
        n1.setIsRead(false);

        Notification n2 = new Notification();
        n2.setRecipientUserId(recipient.getId());
        n2.setSenderUserId(sender.getId());
        n2.setType("FOLLOW");
        n2.setIsRead(false);

        notificationRepo.save(n1);
        notificationRepo.save(n2);

        mockMvc.perform(put("/api/notifications/mark-all-read")
                        .param("userId", recipient.getId().toString())
                        .with(oauth2Login().attributes(a -> a.put("email", recipient.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(content().string("2 notifications marked as read"));

        assertThat(notificationRepo.findAll().stream().allMatch(Notification::getIsRead)).isTrue();
    }

    @Test @Order(5)
    void deleteNotification_shouldRemoveOne() throws Exception {
        Notification n = new Notification();
        n.setRecipientUserId(recipient.getId());
        n.setSenderUserId(sender.getId());
        n.setType("FOLLOW");
        n = notificationRepo.saveAndFlush(n);

        mockMvc.perform(delete("/api/notifications/{id}", n.getId())
                        .param("userId", recipient.getId().toString())
                        .with(oauth2Login().attributes(a -> a.put("email", recipient.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(content().string("Notification deleted successfully."));

        assertThat(notificationRepo.findById(n.getId())).isEmpty();
    }
}
