package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;

@Entity
@Table(name = "post_topics")
public class PostTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "topic_id", nullable = false)
    private Integer topicId;

    // ---- Custom Getter/Setter for postId ----
    @Transient
    public Integer getPostId() {
        return post != null ? post.getId() : null;
    }

    public void setPostId(Integer postId) {
        if (post == null) {
            post = new UserPost(); // or BotPost or just new Post(); based on your app
        }
        post.setId(postId);
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Integer getTopicId() {
        return topicId;
    }

    public void setTopicId(Integer topicId) {
        this.topicId = topicId;
    }
}
