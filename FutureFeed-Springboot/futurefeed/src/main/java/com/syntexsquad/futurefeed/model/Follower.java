package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "followers")
@Data
@IdClass(FollowerId.class)
public class Follower {

    @Id
    @Column(name = "follower_id")
    private Integer followerId;

    @Id
    @Column(name = "followed_id")
    private Integer followedId;
}
