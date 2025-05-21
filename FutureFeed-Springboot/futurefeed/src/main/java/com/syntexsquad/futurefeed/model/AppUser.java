package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String password;

    private String role;

    public AppUser(String username, String password) {
        this.username = username;
        this.password = password;
        this.role = "USER";
    }
}
