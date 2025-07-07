package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reshares")
@IdClass(ReshareId.class)
public class Reshare {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
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

    @Transient
    public Integer getPostId() {
        return post != null ? post.getId() : null;
    }

    public void setPostId(Integer postId) {
        if (post == null) post = new UserPost();
        post.setId(postId);
    }
}
