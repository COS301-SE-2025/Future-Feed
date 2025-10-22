package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Integer> {

    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Post> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM UserPost p WHERE p.user.id = :userId")
    List<Post> findAllByUserId(@Param("userId") Integer userId);
    
     @Query("SELECT p FROM Post p WHERE p.id IN :ids")
    List<Post> findAllById(@Param("ids") List<Integer> ids);

    @Query("SELECT p FROM Post p WHERE p.id IN :ids")
    List<Post> findAllPolymorphicById(@Param("ids") List<Integer> ids);

    @Query("SELECT p FROM UserPost p WHERE p.user.id IN :userIds ORDER BY p.createdAt DESC")
    Page<Post> findPostsByFollowedUsers(@Param("userIds") List<Integer> userIds, Pageable pageable);

}

