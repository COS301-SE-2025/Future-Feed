package com.syntexsquad.futurefeed.dto;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Post;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class BookmarkDto {
    private Integer postId;
    private String content;
    private String type; // "USER_POST" or "BOT_POST" for later after we have implemented the bots now it will just be User_POSt
    private LocalDateTime createdAt;



}
