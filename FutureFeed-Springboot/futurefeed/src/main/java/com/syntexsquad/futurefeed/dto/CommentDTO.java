package com.syntexsquad.futurefeed.dto;

import java.time.Instant;

public class CommentDTO {
    public Integer id;
    public Integer postId;
    public Integer userId;
    public String  username;
    public String  content;
    public Instant createdAt;
}
