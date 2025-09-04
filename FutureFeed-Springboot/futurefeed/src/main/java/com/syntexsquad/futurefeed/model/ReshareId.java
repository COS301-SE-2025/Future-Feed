package com.syntexsquad.futurefeed.model;

import java.io.Serializable;
import java.util.Objects;

public class ReshareId implements Serializable {
    private Integer userId;
    private Integer post;

    public ReshareId() {}

    public ReshareId(Integer userId, Integer post) {
        this.userId = userId;
        this.post = post;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReshareId that)) return false;
        return Objects.equals(userId, that.userId) &&
               Objects.equals(post, that.post);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, post);
    }
}
