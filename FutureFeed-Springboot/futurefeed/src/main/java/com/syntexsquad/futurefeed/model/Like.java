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
    @Column(name = "post_id")
    private Integer postId;
}
