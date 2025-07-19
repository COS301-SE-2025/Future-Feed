package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {

    List<Comment> findByPost(Post post);

    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId")
    List<Comment> findByPostId(@Param("postId") Integer postId);

    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId")
    List<Comment> findByUserId(@Param("userId") Integer userId);

    boolean existsByUser_IdAndPost_Id(Integer userId, Integer postId);
}

