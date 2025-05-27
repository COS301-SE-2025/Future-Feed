package com.syntexsquad.futurefeed.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserUpdateRequest {
    private String displayName;
    private String profilePicture;
    private LocalDate dateOfBirth;
    private String bio;
}
