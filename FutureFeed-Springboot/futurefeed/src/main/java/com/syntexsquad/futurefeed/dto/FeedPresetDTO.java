package com.syntexsquad.futurefeed.dto;

public class FeedPresetDTO {
    private String name;
    private boolean defaultPreset;

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
