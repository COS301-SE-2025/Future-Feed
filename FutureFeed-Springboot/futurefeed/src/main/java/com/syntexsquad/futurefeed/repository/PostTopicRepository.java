package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.PostTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;

import java.util.List;

@Repository
public interface PostTopicRepository extends JpaRepository<PostTopic, Integer> {

    // Option 1: Use Post object
    List<PostTopic> findByPost(Post post);

    // Option 2: Use custom JPQL query with post ID
    @Query("SELECT pt FROM PostTopic pt WHERE pt.post.id = :postId")
    List<PostTopic> findByPostId(@Param("postId") Integer postId);

    List<PostTopic> findByTopicId(Integer topicId);

    // Delete by post ID using custom JPQL
    @Modifying
    @Transactional
    @Query("DELETE FROM PostTopic pt WHERE pt.post.id = :postId")
    void deleteByPostId(@Param("postId") Integer postId);
}