package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.model.ReshareId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReshareRepository extends JpaRepository<Reshare, ReshareId> {
    boolean existsByUserIdAndPostId(Integer userId, Integer postId);
    int deleteByUserIdAndPostId(Integer userId, Integer postId);
    List<Reshare> findByUserId(Integer userId);
}
