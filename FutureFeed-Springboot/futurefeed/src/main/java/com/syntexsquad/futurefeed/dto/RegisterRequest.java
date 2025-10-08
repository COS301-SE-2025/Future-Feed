package com.syntexsquad.futurefeed.dto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String displayName;
    private String profilePicture;
    private LocalDate dateOfBirth; 

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = trimOrNull(username); }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = trimOrNull(email); }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public void setDateOfBirth(String dob) {
        this.dateOfBirth = parseIsoDateOrNull(dob);
    }

    public void setDob(String dob) {
        this.dateOfBirth = parseIsoDateOrNull(dob);
    }

    private static LocalDate parseIsoDateOrNull(String s) {
        if (s == null) return null;
        s = s.trim();
        if (s.isEmpty()) return null;
        try {
            return LocalDate.parse(s, DateTimeFormatter.ISO_LOCAL_DATE); 
        } catch (Exception ignore) {
            return null; 
        }
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
