package com.syntexsquad.futurefeed.model;

import lombok.Data;

import java.io.Serializable;

@Data
public class FollowerId implements Serializable {
    private Integer followerId;
    private Integer followedId;
}