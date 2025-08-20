package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Integer recipientUserId);

    @Query("SELECT n FROM Notification n WHERE n.recipientUserId = :recipientId AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientAndType(@Param("recipientId") Integer recipientId,
                                              @Param("type") String type);
}
