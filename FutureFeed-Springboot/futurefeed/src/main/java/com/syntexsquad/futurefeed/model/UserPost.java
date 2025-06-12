package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("USER")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserPost extends Post {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;
}

