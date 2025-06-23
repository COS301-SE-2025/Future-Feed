package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.PostTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostTopicRepository extends JpaRepository<PostTopic, Integer> {
    List<PostTopic> findByPostId(Integer postId);
    List<PostTopic> findByTopicId(Integer topicId);
    void deleteByPostId(Integer postId);
}