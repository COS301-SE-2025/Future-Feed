package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.model.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, LikeId> {
    boolean existsByUserIdAndPostId(Integer userId, Integer postId);
    void deleteByUserIdAndPostId(Integer userId, Integer postId);
    long countByPostId(Integer postId);
}
