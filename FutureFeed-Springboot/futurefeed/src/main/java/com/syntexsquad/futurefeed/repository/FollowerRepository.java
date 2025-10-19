package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.model.FollowerId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FollowerRepository extends JpaRepository<Follower, FollowerId> {
    boolean existsByFollowerIdAndFollowedId(Integer followerId, Integer followedId);
    void deleteByFollowerIdAndFollowedId(Integer followerId, Integer followedId);
    List<Follower> findByFollowerId(Integer followerId);
    List<Follower> findByFollowedId(Integer followedId);

    @Query("SELECT u, COUNT(f.followerId) AS followerCount " +
            "FROM Follower f JOIN AppUser u ON f.followedId = u.id " +
            "GROUP BY u ORDER BY COUNT(f.followerId) DESC")
    List<Object[]> findTopFollowedUsers(Pageable pageable);

    @Query("SELECT f.followedId FROM Follower f WHERE f.followerId = :userId")
    List<Integer> findFollowedIdsByFollowerId(Integer userId);


}
