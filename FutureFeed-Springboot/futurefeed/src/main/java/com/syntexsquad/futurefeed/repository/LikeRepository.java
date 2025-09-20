package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.model.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, LikeId> {

    @Query("SELECT COUNT(l) > 0 FROM Like l WHERE l.userId = :userId AND l.post.id = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") Integer userId, @Param("postId") Integer postId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Like l WHERE l.userId = :userId AND l.post.id = :postId")
    void deleteByUserIdAndPostId(@Param("userId") Integer userId, @Param("postId") Integer postId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.post.id = :postId")
    long countByPostId(@Param("postId") Integer postId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Like l WHERE l.post.id = :postId")
    void deleteAllByPostId(@Param("postId") Integer postId);

    @Query("SELECT l.post.id FROM Like l WHERE l.userId = :userId")
    List<Integer> findPostIdsByUserId(@Param("userId") Integer userId);



    @Query("SELECT l FROM Like l WHERE l.userId = :userId")
    List<Like> findByUser(@Param("userId") Integer userId);
    List<Like> findByUserId(Integer userId);
}
