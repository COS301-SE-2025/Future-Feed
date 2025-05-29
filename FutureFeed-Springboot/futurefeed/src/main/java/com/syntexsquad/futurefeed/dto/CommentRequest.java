package com.syntexsquad.futurefeed.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Integer userId;
    private Integer postId;
    private String content;
}
