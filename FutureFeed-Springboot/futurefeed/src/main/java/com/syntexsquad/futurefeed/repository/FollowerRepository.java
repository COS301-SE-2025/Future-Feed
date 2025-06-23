package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.model.FollowerId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowerRepository extends JpaRepository<Follower, FollowerId> {
    boolean existsByFollowerIdAndFollowedId(Integer followerId, Integer followedId);
    void deleteByFollowerIdAndFollowedId(Integer followerId, Integer followedId);
    List<Follower> findByFollowerId(Integer followerId);
    List<Follower> findByFollowedId(Integer followedId);
}
