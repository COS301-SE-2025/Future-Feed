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

    private Integer recipientUserId;   
    private Integer senderUserId;     

    private String type; 

    private Integer postId;   

    private String message;   
    private String senderName; 

    private Boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
