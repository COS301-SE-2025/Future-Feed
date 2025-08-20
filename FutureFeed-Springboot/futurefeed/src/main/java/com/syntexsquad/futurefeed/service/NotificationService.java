package com.syntexsquad.futurefeed.service;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.dto.NotificationDto;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.repository.NotificationRepository;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final AppUserRepository appUserRepo;


    public NotificationService(NotificationRepository notificationRepo , AppUserRepository appUserRepo) {
        this.notificationRepo = notificationRepo;
        this.appUserRepo = appUserRepo;
    }

    public void createNotification(Integer recipientId, Integer senderId, String type,String Massage, Integer postId) {
        if (recipientId.equals(senderId)) return; // don't notify yourself

        Notification notification = new Notification();
        notification.setRecipientUserId(recipientId);
        notification.setSenderUserId(senderId);
        notification.setType(type);
        notification.setPostId(postId);
        notification.setMassage(Massage);
        notificationRepo.save(notification);
    }

    public List<Notification> getNotificationsForUser(Integer userId) {
        return notificationRepo.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public List<NotificationDto> getNotificationDtosForUser(Integer userId) {
        List<Notification> notifications = notificationRepo.findByRecipientUserIdOrderByCreatedAtDesc(userId);

        return notifications.stream().map(notification -> {
            // Fetch username based on senderUserId
            String senderUsername = appUserRepo.findById(notification.getSenderUserId())
                    .map(AppUser::getUsername)
                    .orElse("Unknown");

            return new NotificationDto(
                    notification.getId(),
                    notification.getType(),
                    notification.getSenderUserId(),
                    senderUsername,
                    notification.getMassage(),
                    notification.getPostId(),
                    notification.getIsRead(),
                    notification.getCreatedAt()
            );
        }).toList();
    }

}
