package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Data
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(columnDefinition = "text")
    private String content;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_bot")
    private Boolean isBot = false;

    @Column(name = "created_at", columnDefinition = "timestamp default CURRENT_TIMESTAMP")
    private LocalDateTime createdAt = LocalDateTime.now();
}
