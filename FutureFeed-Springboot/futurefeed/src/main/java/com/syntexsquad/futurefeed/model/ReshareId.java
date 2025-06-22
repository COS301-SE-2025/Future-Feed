package com.syntexsquad.futurefeed.model;

import java.io.Serializable;
import java.util.Objects;

public class ReshareId implements Serializable {
    private Integer userId;
    private Integer postId;

    public ReshareId() {}

    public ReshareId(Integer userId, Integer postId) {
        this.userId = userId;
        this.postId = postId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReshareId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(postId, that.postId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, postId);
    }
}
