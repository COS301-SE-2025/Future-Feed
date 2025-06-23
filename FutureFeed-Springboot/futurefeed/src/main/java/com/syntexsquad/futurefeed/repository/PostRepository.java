package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Integer> {

    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchByKeyword(@Param("keyword") String keyword);

    List<Post> findByUserInOrderByCreatedAtDesc(List<AppUser> users);

    @Query("SELECT p FROM Post p WHERE p.topic = :topic ORDER BY p.createdAt DESC")
    List<Post> findByTopicAndUserIn(@Param("topic") String topic, @Param("users") List<AppUser> users, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.topic = :topic ORDER BY p.createdAt DESC")
    List<Post> findByTopic(@Param("topic") String topic, Pageable pageable);

}


