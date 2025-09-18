package com.syntexsquad.futurefeed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FollowerDto {
    private Integer followerId;
    private Integer followedId;
}
