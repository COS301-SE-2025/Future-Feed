package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.NotificationDto;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.NotificationRepository;
import com.syntexsquad.futurefeed.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class NotificationServiceTest {

    private NotificationRepository notificationRepository;
    private AppUserRepository appUserRepository;
    private NotificationService notificationService;

    private final Integer recipientId = 1;
    private final Integer senderId = 2;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationRepository.class);
        appUserRepository = mock(AppUserRepository.class);
        notificationService = new NotificationService(notificationRepository, appUserRepository);
    }

    @Test
    void testCreateNotification_shouldSaveWhenDifferentUsers() {
        Notification notification = new Notification();
        notification.setId(10L);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.createNotification(recipientId, senderId,
                "LIKE", "Hello", "senderUser", 123);

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testCreateNotification_shouldNotSaveWhenSameUser() {
        notificationService.createNotification(recipientId, recipientId,
                "LIKE", "Hello", "senderUser", 123);

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void testGetNotificationsForUser_shouldReturnList() {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setRecipientUserId(recipientId);

        when(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(recipientId))
                .thenReturn(List.of(n1));

        List<Notification> result = notificationService.getNotificationsForUser(recipientId);
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getId());
    }

    @Test
    void testGetNotificationDtosForUser_shouldReturnDtosWithSenderUsername() {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setRecipientUserId(recipientId);
        n1.setSenderUserId(senderId);
        n1.setType("COMMENT");
        n1.setSenderUsername("msg");
        n1.setMassage("senderName");
        n1.setPostId(200);
        n1.setIsRead(false);
        n1.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(recipientId))
                .thenReturn(List.of(n1));

        AppUser sender = new AppUser();
        sender.setId(senderId);
        sender.setUsername("realSender");
        when(appUserRepository.findById(senderId)).thenReturn(Optional.of(sender));

        List<NotificationDto> dtos = notificationService.getNotificationDtosForUser(recipientId);

        assertEquals(1, dtos.size());
        assertEquals("COMMENT", dtos.get(0).getType());
        assertEquals(senderId, dtos.get(0).getSenderUserId());
    }

    @Test
    void testMarkNotificationAsRead_shouldUpdateIfOwned() {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setRecipientUserId(recipientId);
        n1.setIsRead(false);

        when(notificationRepository.findById(1)).thenReturn(Optional.of(n1));

        boolean result = notificationService.markNotificationAsRead(recipientId, 1);

        assertTrue(result);
        assertTrue(n1.getIsRead());
        verify(notificationRepository).save(n1);
    }

    @Test
    void testMarkNotificationAsRead_shouldThrowIfNotOwned() {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setRecipientUserId(999); // not recipient

        when(notificationRepository.findById(1)).thenReturn(Optional.of(n1));

        assertThrows(RuntimeException.class,
                () -> notificationService.markNotificationAsRead(recipientId, 1));
    }

    @Test
    void testMarkAllNotificationsAsRead_shouldUpdateAll() {
        Notification n1 = new Notification();
        n1.setRecipientUserId(recipientId);
        n1.setIsRead(false);

        Notification n2 = new Notification();
        n2.setRecipientUserId(recipientId);
        n2.setIsRead(false);

        when(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(recipientId))
                .thenReturn(List.of(n1, n2));

        int updatedCount = notificationService.markAllNotificationsAsRead(recipientId);

        assertEquals(2, updatedCount);
        assertTrue(n1.getIsRead());
        assertTrue(n2.getIsRead());
        verify(notificationRepository).saveAll(any());
    }

    @Test
    void testDeleteNotification_shouldDeleteIfOwned() {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setRecipientUserId(recipientId);

        when(notificationRepository.findByIdAndRecipientUserId(1, recipientId))
                .thenReturn(Optional.of(n1));

        boolean result = notificationService.deleteNotification(recipientId, 1);

        assertTrue(result);
        verify(notificationRepository).delete(n1);
    }

    @Test
    void testDeleteNotification_shouldReturnFalseIfNotFound() {
        when(notificationRepository.findByIdAndRecipientUserId(1, recipientId))
                .thenReturn(Optional.empty());

        boolean result = notificationService.deleteNotification(recipientId, 1);

        assertFalse(result);
        verify(notificationRepository, never()).delete(any());
    }

    @Test
    void testDeleteAllNotifications_shouldCallRepository() {
        notificationService.deleteAllNotifications(recipientId);
        verify(notificationRepository).deleteByRecipientUserId(recipientId);
    }
}
