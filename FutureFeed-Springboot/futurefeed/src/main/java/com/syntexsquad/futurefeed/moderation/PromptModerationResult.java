package com.syntexsquad.futurefeed.moderation;

public class PromptModerationResult {
    private boolean safe;
    private String classification;

    public boolean isSafe() { return safe; }
    public void setSafe(boolean safe) { this.safe = safe; }

    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
}
