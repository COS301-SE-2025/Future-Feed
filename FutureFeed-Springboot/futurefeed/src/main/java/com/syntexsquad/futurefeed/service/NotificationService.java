package com.syntexsquad.futurefeed.service;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.dto.NotificationDto;
import com.syntexsquad.futurefeed.model.Notification;
import com.syntexsquad.futurefeed.repository.NotificationRepository;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final AppUserRepository appUserRepo;


    public NotificationService(NotificationRepository notificationRepo , AppUserRepository appUserRepo) {
        this.notificationRepo = notificationRepo;
        this.appUserRepo = appUserRepo;
    }

    public void createNotification(Integer recipientId, Integer senderId, String type,String Massage,String SenderUsername, Integer postId) {
        if (recipientId.equals(senderId)) return; // don't notify yourself

        Notification notification = new Notification();
        notification.setRecipientUserId(recipientId);
        notification.setSenderUserId(senderId);
        notification.setType(type);
        notification.setSenderUsername(Massage);
        notification.setPostId(postId);
        notification.setMassage( SenderUsername);
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
                    notification.getSenderUsername(),
                    notification.getMassage(),
                    notification.getPostId(),
                    notification.getIsRead(),
                    notification.getCreatedAt()
            );
        }).toList();
    }
    @Transactional
    public boolean markNotificationAsRead(Integer userId, Integer notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientUserId().equals(userId)) {
            throw new RuntimeException("You can only mark your own notifications as read");
        }

        notification.setIsRead(true);
        notificationRepo.save(notification);
        return true;
    }

    @Transactional
    public int markAllNotificationsAsRead(Integer userId) {
        List<Notification> notifications =
                notificationRepo.findByRecipientUserIdOrderByCreatedAtDesc(userId);

        notifications.forEach(n -> n.setIsRead(true));
        notificationRepo.saveAll(notifications);
        return notifications.size();
    }

     @Transactional 
    public boolean deleteNotification(Integer userId, Integer notificationId) {
        return notificationRepo.findByIdAndRecipientUserId(notificationId, userId)
                .map(notification -> {
                    notificationRepo.delete(notification);
                    return true;
                }).orElse(false);
    }

    // Delete all notifications for a user
     @Transactional 
    public void deleteAllNotifications(Integer userId) {
        notificationRepo.deleteByRecipientUserId(userId);
    }


}