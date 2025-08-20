package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.NotificationDto;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.NotificationRepository;
import com.syntexsquad.futurefeed.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;

    public NotificationController(NotificationService notificationService, NotificationRepository notificationRepository, AppUserRepository appUserRepository) {
         this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
    }

//    @GetMapping("/{userId}")
//    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Integer userId) {
//        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
//    }
@GetMapping("/mentions/{userId}")
public ResponseEntity<List<Notification>> getMentionNotifications(@PathVariable Integer userId) {
    //AppUser currentUser = getAuthenticatedUser();
    List<Notification> mentions = notificationRepository.findByRecipientAndType(userId, "MENTION");
    return ResponseEntity.ok(mentions);
}

//    private AppUser getAuthenticatedUser() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        return appUserRepository.findByEmail(auth.getName())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//    }
    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.getNotificationDtosForUser(userId));
    }

}
