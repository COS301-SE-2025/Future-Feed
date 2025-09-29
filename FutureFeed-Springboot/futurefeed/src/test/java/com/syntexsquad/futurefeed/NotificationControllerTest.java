package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.NotificationController;
import com.syntexsquad.futurefeed.dto.NotificationDto;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.NotificationRepository;
import com.syntexsquad.futurefeed.service.AppUserService;
import com.syntexsquad.futurefeed.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = NotificationController.class)
@Import(NotificationControllerTest.TestSecurityConfig.class)
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private AppUserRepository appUserRepository;

    @MockBean
    private AppUserService appUserService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetMentionNotifications() throws Exception {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setRecipientUserId(10);
        n1.setSenderUserId(20);
        n1.setType("MENTION");
        n1.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findByRecipientAndType(10, "MENTION"))
                .thenReturn(List.of(n1));

        mockMvc.perform(get("/api/notifications/mentions/{userId}", 10))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].type").value("MENTION"));
    }

    @Test
    void testGetNotifications() throws Exception {
        NotificationDto dto = new NotificationDto(
                1L, "LIKE", 20, "senderUser", "msg",
                99, false, LocalDateTime.now());

        when(notificationService.getNotificationDtosForUser(10))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/notifications/{userId}", 10))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].type").value("LIKE"));
    }

    @Test
    void testGetAllNotifications() throws Exception {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setType("FOLLOW");
        n1.setRecipientUserId(10);
        n1.setSenderUserId(20);

        when(notificationRepository.findAll()).thenReturn(List.of(n1));

        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].type").value("FOLLOW"));
    }

    @Test
    void testMarkNotificationAsRead_success() throws Exception {
        when(notificationService.markNotificationAsRead(10, 1))
                .thenReturn(true);

        mockMvc.perform(put("/api/notifications/{id}/read", 1)
                        .param("userId", "10"))
                .andExpect(status().isOk())
                .andExpect(content().string("Notification marked as read"));
    }

    @Test
    void testMarkNotificationAsRead_forbidden() throws Exception {
        when(notificationService.markNotificationAsRead(10, 1))
                .thenThrow(new RuntimeException("Not your notification"));

        mockMvc.perform(put("/api/notifications/{id}/read", 1)
                        .param("userId", "10"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Not your notification"));
    }

    @Test
    void testMarkAllNotificationsAsRead() throws Exception {
        when(notificationService.markAllNotificationsAsRead(10))
                .thenReturn(3);

        mockMvc.perform(put("/api/notifications/mark-all-read")
                        .param("userId", "10"))
                .andExpect(status().isOk())
                .andExpect(content().string("3 notifications marked as read"));
    }

    @Test
    void testDeleteNotification_success() throws Exception {
        when(notificationService.deleteNotification(10, 1))
                .thenReturn(true);

        mockMvc.perform(delete("/api/notifications/{id}", 1)
                        .param("userId", "10"))
                .andExpect(status().isOk())
                .andExpect(content().string("Notification deleted successfully."));
    }

    @Test
    void testDeleteNotification_notFound() throws Exception {
        when(notificationService.deleteNotification(10, 1))
                .thenReturn(false);

        mockMvc.perform(delete("/api/notifications/{id}", 1)
                        .param("userId", "10"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Notification not found or not yours."));
    }

    @Test
    void testDeleteAllNotifications_success() throws Exception {
        AppUser user = new AppUser();
        user.setId(10);
        user.setEmail("user@example.com");

        when(appUserRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        mockMvc.perform(delete("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(content().string("All notifications deleted successfully."));
    }

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf().disable()
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }
}

