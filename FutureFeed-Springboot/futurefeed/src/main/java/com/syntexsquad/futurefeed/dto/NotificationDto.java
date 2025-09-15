package com.syntexsquad.futurefeed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String type; // LIKE, COMMENT, BOOKMARK, FOLLOW, MENTION, UNFOLLOW
    private Integer senderUserId;
    private String senderUsername; // resolved from AppUser
    private Integer postId;
    private Boolean isRead;
    private LocalDateTime createdAt;

    private String message;     // e.g. "Alice liked your post"
    private String senderName;  // cached sender display name
}
