package com.syntexsquad.futurefeed.dto;

import com.syntexsquad.futurefeed.model.AppUser;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileResponse {

    // Expose only necessary fields (omit password, role, ID, etc.)
    private Integer id;
    private String username;
    private String email;
    private String displayName;
    private String profilePicture;
    private LocalDate dateOfBirth;
    private String bio;

    // Factory method to map AppUser entity to safe DTO
    public static UserProfileResponse fromUser(AppUser user) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setBio(user.getBio());
        return dto;
    }
}
