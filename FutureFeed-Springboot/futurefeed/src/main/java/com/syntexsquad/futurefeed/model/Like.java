package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "likes")
@Data
@IdClass(LikeId.class)
public class Like {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    // Optional helper for DTOs
    @Transient
    public Integer getPostId() {
        return post != null ? post.getId() : null;
    }

    public void setPostId(Integer postId) {
        if (post == null) post = new UserPost(); // Or `new Post()` if you want abstract reference
        post.setId(postId);
    }
}
