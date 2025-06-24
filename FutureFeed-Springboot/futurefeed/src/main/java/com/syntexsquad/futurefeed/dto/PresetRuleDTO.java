package com.syntexsquad.futurefeed.dto;

public class PresetRuleDTO {
    private Integer presetId;
    private Integer topicId;
    private String sourceType;
    private Integer specificUserId;
    private Integer percentage;

    public Integer getPresetId() {
        return presetId;
    }

    public void setPresetId(Integer presetId) {
        this.presetId = presetId;
    }

    public Integer getTopicId() {
        return topicId;
    }

    public void setTopicId(Integer topicId) {
        this.topicId = topicId;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public Integer getSpecificUserId() {
        return specificUserId;
    }

    public void setSpecificUserId(Integer specificUserId) {
        this.specificUserId = specificUserId;
    }

    public Integer getPercentage() {
        return percentage;
    }

    public void setPercentage(Integer percentage) {
        this.percentage = percentage;
    }
}

