package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByPostId(Integer postId);
}
