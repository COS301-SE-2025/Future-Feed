package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Integer> {

    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM UserPost p WHERE p.user.id = :userId")
    List<Post> findAllByUserId(@Param("userId") Integer userId);
}

