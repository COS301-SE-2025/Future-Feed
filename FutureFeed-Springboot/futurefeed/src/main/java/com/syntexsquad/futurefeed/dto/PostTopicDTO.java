package com.syntexsquad.futurefeed.dto;

import java.util.List;

public class PostTopicDTO {
    private Integer postId;
    private List<Integer> topicIds;

    public Integer getPostId() {
        return postId;
    }

    public void setPostId(Integer postId) {
        this.postId = postId;
    }

    public List<Integer> getTopicIds() {
        return topicIds;
    }

    public void setTopicIds(List<Integer> topicIds) {
        this.topicIds = topicIds;
    }
}