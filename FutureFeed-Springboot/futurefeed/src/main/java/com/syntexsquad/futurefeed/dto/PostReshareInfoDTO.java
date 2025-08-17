package com.syntexsquad.futurefeed.dto;

public class PostReshareInfoDTO {
    private Integer postId;
    private long reshareCount;
    private boolean hasReshared;

    public PostReshareInfoDTO(Integer postId, long reshareCount, boolean hasReshared) {
        this.postId = postId;
        this.reshareCount = reshareCount;
        this.hasReshared = hasReshared;
    }

    public Integer getPostId() { return postId; }
    public long getReshareCount() { return reshareCount; }
    public boolean isHasReshared() { return hasReshared; }

    public void setPostId(Integer postId) { this.postId = postId; }
    public void setReshareCount(long reshareCount) { this.reshareCount = reshareCount; }
    public void setHasReshared(boolean hasReshared) { this.hasReshared = hasReshared; }
}
