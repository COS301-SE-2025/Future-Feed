package com.syntexsquad.futurefeed.dto;

import lombok.Data;

@Data
public class PostRequest {
    private String content;
    private String imageUrl;
    private Boolean isBot =false;
}

