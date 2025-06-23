package com.syntexsquad.futurefeed.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
public class FeedPreset {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Getter
    private String name;
    private boolean isDefault;

    @Setter
    @Getter
    @ManyToOne
    private AppUser owner;

    @OneToMany(mappedBy = "feedPreset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeedRule> rules;

    public FeedPreset(String name) {
        this.name = name;
        this.isDefault = false;
    }
    public FeedPreset(String name, AppUser owner) {
        this.name = name;
        this.owner = owner;
        this.isDefault = false;
    }
    public FeedPreset() {
        this.isDefault = false;
    }

    public boolean isDefault() {
        return isDefault;
    }
    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    public void setRules(List<FeedRule> rules) {
        // Clear old rules if needed
        if (this.rules != null) {
            this.rules.clear();
        } else {
            this.rules = new ArrayList<>();
        }

        // Set the parent preset for each rule
        for (FeedRule rule : rules) {
            rule.setFeedPreset(this); // VERY important for bidirectional mapping
            this.rules.add(rule);
        }
    }
    public void addRule(FeedRule rule) {
        this.rules.add(rule);
        rule.setFeedPreset(this);
    }
    public void removeRule(FeedRule rule) {
        this.rules.remove(rule);
        rule.setFeedPreset(null);
    }
    public List<FeedRule> getRules()
    {
        return new ArrayList<>(this.rules);
    }


    // Getters and setters (or use Lombok if preferred)
}
