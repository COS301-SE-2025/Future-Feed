package com.syntexsquad.futurefeed.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("BOT")
@Data
@EqualsAndHashCode(callSuper = true)
public class BotPost extends Post {
    
}
