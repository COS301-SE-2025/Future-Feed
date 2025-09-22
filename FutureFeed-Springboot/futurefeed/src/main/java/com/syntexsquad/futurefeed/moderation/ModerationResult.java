package com.syntexsquad.futurefeed.moderation;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ModerationResult {
    private boolean safe;

    private List<String> labels = new ArrayList<>();

    @JsonProperty("allow_reason")
    private String allowReason;

    @JsonProperty("block_reason")
    private String blockReason;

    @JsonProperty("message_to_user")
    private String messageToUser;

    private List<String> links = new ArrayList<>();

    @JsonProperty("fallback_used")
    private boolean fallbackUsed;

    private String error;

    public boolean isSafe() { return safe; }
    public void setSafe(boolean safe) { this.safe = safe; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public String getAllowReason() { return allowReason; }
    public void setAllowReason(String allowReason) { this.allowReason = allowReason; }

    public String getBlockReason() { return blockReason; }
    public void setBlockReason(String blockReason) { this.blockReason = blockReason; }

    public String getMessageToUser() { return messageToUser; }
    public void setMessageToUser(String messageToUser) { this.messageToUser = messageToUser; }

    public List<String> getLinks() { return links; }
    public void setLinks(List<String> links) { this.links = links; }

    public boolean isFallbackUsed() { return fallbackUsed; }
    public void setFallbackUsed(boolean fallbackUsed) { this.fallbackUsed = fallbackUsed; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
