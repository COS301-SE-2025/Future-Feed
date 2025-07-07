package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.model.ReshareId;
import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReshareRepository extends JpaRepository<Reshare, ReshareId> {

    @Query("SELECT COUNT(r) > 0 FROM Reshare r WHERE r.userId = :userId AND r.post.id = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") Integer userId, @Param("postId") Integer postId);

    @Query("DELETE FROM Reshare r WHERE r.userId = :userId AND r.post.id = :postId")
    int deleteByUserIdAndPostId(@Param("userId") Integer userId, @Param("postId") Integer postId);

    List<Reshare> findByUserId(Integer userId);
}
