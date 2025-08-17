package com.syntexsquad.futurefeed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String type; // LIKE, COMMENT, BOOKMARK, FOLLOW
    private Integer senderUserId;
    private String senderUsername; // for display purposes
    private Integer postId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
