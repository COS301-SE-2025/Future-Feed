package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;

import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer recipientUserId;   // who receives the notification
    private Integer senderUserId;      // who triggered the notification (e.g., the liker/follower)

    private String type; // LIKE, COMMENT, BOOKMARK, FOLLOW
    private String massage;
    private Integer postId;   // optional — only for LIKE, COMMENT, BOOKMARK
    private Boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();


}