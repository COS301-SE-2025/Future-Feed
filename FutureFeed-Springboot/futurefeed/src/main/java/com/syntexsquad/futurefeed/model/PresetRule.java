package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;

@Entity
@Table(name = "preset_rules")
public class PresetRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "preset_id")
    private Integer presetId;

    @Column(name = "topic_id")
    private Integer topicId;

    @Column(name = "source_type")
    private String sourceType;

    @Column(name = "specific_user_id")
    private Integer specificUserId;

    @Column(name = "percentage")
    private Integer percentage;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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
