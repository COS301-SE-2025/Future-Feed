package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.Setter;
import lombok.Getter;

@Entity
public class FeedRule {

    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String topic;
    private String sourceType;
    private int percentage;
    @ManyToOne
    private FeedPreset feedPreset;
    public FeedRule() {}
    public Long getId() {
        return id;
    }
}
