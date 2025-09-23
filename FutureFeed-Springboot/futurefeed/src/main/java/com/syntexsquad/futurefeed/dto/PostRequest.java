package com.syntexsquad.futurefeed.dto;

import lombok.Data;

@Data
public class PostRequest {
    private String content;
    private String imageUrl;
    private Boolean isBot =false;
    private String imagePrompt;   
    private Integer imageWidth;   
    private Integer imageHeight;  
    private Integer imageSteps;   
    private String imageModel;    
}

