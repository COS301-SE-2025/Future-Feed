package com.syntexsquad.futurefeed.model;

import java.io.Serializable;
import java.util.Objects;

public class LikeId implements Serializable {
    private Integer userId;
    private Integer post; // Must match field name exactly as in Like entity

    public LikeId() {}

    public LikeId(Integer userId, Integer post) {
        this.userId = userId;
        this.post = post;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LikeId that)) return false;
        return Objects.equals(userId, that.userId) &&
               Objects.equals(post, that.post);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, post);
    }
}


