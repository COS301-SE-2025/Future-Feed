package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 500)
    private String bio;

    private String profilePictureUrl;

    private String role = "USER";

    private String displayName;

    private String profilePicture; 

    private LocalDate dateOfBirth;

    //private String bio;


    public AppUser(String username, String password) {
        this.username = username;
        this.password = password;
        this.role = "USER";
    }

   public String  getUsername() {
        return username;
    }
   public  void setUsername(String username) {
        this.username = username;
    }
   public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
   public String getPassword() {
        return password;
    }
   public  void setPassword(String password) {
        this.password = password;
    }
   public String getRole() {
        return role;
    }
   public  void setRole(String role) {
        this.role = role;
    }
   public String getDisplayName() {
        return displayName;
    }
   public  void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
   public String getProfilePicture() {
        return profilePicture;
    }
public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
   public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
   public  void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
   public String getBio() {
        return bio;
    }
   public  void setBio(String bio) {
        this.bio = bio;
    }

}

