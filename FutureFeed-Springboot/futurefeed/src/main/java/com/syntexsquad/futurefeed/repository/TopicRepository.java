package com.syntexsquad.futurefeed.repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.Topic;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TopicRepository extends JpaRepository<Topic, Integer> {
    boolean existsByName(String name);
    Optional<Topic> findByName(String name);
    @Query("SELECT t FROM Topic t WHERE LOWER(t.name) = LOWER(:name)")
    Optional<Topic> findByNameIgnoreCase(@Param("name") String name);

    @Query("""
        SELECT t
        FROM Topic t
        JOIN PostTopic pt ON pt.topicId = t.id
        JOIN Post p ON p.id = pt.post.id
        WHERE p.createdAt >= :since
        GROUP BY t.id
        ORDER BY COUNT(p.id) DESC
    """)
    List<Topic> findTrendingTopics(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("""
        SELECT p
        FROM Post p
        JOIN PostTopic pt ON pt.post.id = p.id
        WHERE pt.topicId = :topicId
        ORDER BY p.createdAt DESC
    """)
    List<Post> findPostsByTopicId(@Param("topicId") Integer topicId);
}