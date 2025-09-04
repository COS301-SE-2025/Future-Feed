package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;

@Entity
@Table(name = "feed_presets")
public class FeedPreset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "name")
    private String name;

    @Column(name = "default_preset")
    private boolean defaultPreset;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isDefaultPreset() {
        return defaultPreset;
    }

    public void setDefaultPreset(boolean defaultPreset) {
        this.defaultPreset = defaultPreset;
    }
}
