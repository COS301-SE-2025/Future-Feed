package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.NotificationDto;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

//    @GetMapping("/{userId}")
//    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Integer userId) {
//        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
//    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.getNotificationDtosForUser(userId));
    }

}
