package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@DiscriminatorValue("BOT")
@Data
@EqualsAndHashCode(callSuper = true)
public class BotPost extends Post {

   // @ManyToOne(fetch = FetchType.LAZY)
   // @JoinColumn(name = "bot_id", nullable = false)
   @Transient
    private Bot bot;
}