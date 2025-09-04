package com.syntexsquad.futurefeed.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Integer postId;
    private String content;
}
