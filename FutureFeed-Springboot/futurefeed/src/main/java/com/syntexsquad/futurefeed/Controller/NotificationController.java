package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.NotificationDto;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.NotificationRepository;
import com.syntexsquad.futurefeed.service.AppUserService; // Add this import
import com.syntexsquad.futurefeed.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final AppUserService appUserService; // Add this field

    // Update constructor to include AppUserService
    public NotificationController(NotificationService notificationService,
                                  NotificationRepository notificationRepository,
                                  AppUserRepository appUserRepository,
                                  AppUserService appUserService) {
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
        this.appUserService = appUserService;
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


    @GetMapping("/mentions/{userId}")
    public ResponseEntity<List<Notification>> getMentionNotifications(@PathVariable Integer userId) {
        List<Notification> mentions = notificationRepository.findByRecipientAndType(userId, "MENTION");
        return ResponseEntity.ok(mentions);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable Integer userId) {
        return ResponseEntity.ok(notificationService.getNotificationDtosForUser(userId));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationRepository.findAll());
    }

    // Remove the duplicate delete method that uses Long id
    // Keep only the one that uses Integer id and checks ownership

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markNotificationAsRead(
            @PathVariable Integer notificationId,
            @RequestParam Integer userId) {
        try {
            boolean updated = notificationService.markNotificationAsRead(userId, notificationId);
            return updated ? ResponseEntity.ok("Notification marked as read")
                    : ResponseEntity.badRequest().body("Failed to mark as read");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // ✅ Mark all notifications as read
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllNotificationsAsRead(@RequestParam Integer userId) {
        int updatedCount = notificationService.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok(updatedCount + " notifications marked as read");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Integer id,
                                                @RequestParam Integer userId) {
        boolean deleted = notificationService.deleteNotification(userId, id);
        return deleted
                ? ResponseEntity.ok("Notification deleted successfully.")
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notification not found or not yours.");
    }


    @DeleteMapping
    public ResponseEntity<?> deleteAllNotifications() {
        AppUser user = getAuthenticatedUser(); // Use local method or appUserService
        notificationService.deleteAllNotifications(user.getId());
        return ResponseEntity.ok("All notifications deleted successfully.");
    }
}