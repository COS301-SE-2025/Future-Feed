package com.syntexsquad.futurefeed.model;
import jakarta.persistence.*;
import lombok.Setter;
import lombok.Getter;

@Setter
@Getter
@Entity
public class FeedRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "Topic_id" ,nullable = false) // Optional: sets DB column name
    private Topic topic;
    private String name;
    private int percentage;
    @Getter
    @Setter
    @ManyToOne
    private FeedPreset feedPreset;
    public void removeFeedPreset()
    {
        feedPreset = null;
    }

}
