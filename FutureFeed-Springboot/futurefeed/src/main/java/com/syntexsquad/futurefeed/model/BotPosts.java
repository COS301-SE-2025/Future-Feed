package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "bot_posts")
public class BotPosts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "bot_id", nullable = false)
    @JsonIgnore
    private Bot bot;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnore
    private Post post;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Bot getBot() {
        return bot;
    }

    public void setBot(Bot bot) {
        this.bot = bot;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
