package com.syntexsquad.futurefeed.dto;

import lombok.Data;

@Data
public class LikeRequest {
    private Integer userId;
    private Integer postId;
}
