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

    public AppUser(String username, String password) {
        this.username = username;
        this.password = password;
        this.role = "USER";
    }
}

