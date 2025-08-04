package com.syntexsquad.futurefeed.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FollowedUserDto {
    private Integer id;
    private String username;
    private String name;
    private String profilePicture;
    private long followerCount;
}
