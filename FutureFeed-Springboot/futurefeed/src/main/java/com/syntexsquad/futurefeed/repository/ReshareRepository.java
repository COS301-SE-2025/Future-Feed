package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.model.ReshareId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;


import java.util.List;

public interface ReshareRepository extends JpaRepository<Reshare, ReshareId> {

    @Query("SELECT COUNT(r) > 0 FROM Reshare r WHERE r.userId = :userId AND r.post.id = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") Integer userId, @Param("postId") Integer postId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Reshare r WHERE r.userId = :userId AND r.post.id = :postId")
    int deleteByUserIdAndPostId(@Param("userId") Integer userId, @Param("postId") Integer postId);

    @EntityGraph(attributePaths = {"post"})
    List<Reshare> findByUserId(Integer userId);

    @Query("SELECT COUNT(r) FROM Reshare r WHERE r.post.id = :postId")
    long countByPostId(@Param("postId") Integer postId);


}
