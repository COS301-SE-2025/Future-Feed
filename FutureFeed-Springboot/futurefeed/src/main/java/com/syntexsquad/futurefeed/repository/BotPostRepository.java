package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.dto.BotPostDTO;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.model.BotPosts;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface BotPostRepository extends JpaRepository<BotPosts, Integer> {

     @Query("""
           SELECT bp.bot 
           FROM BotPosts bp 
           WHERE bp.post.id = :postId
           """)
    Optional<Bot> findBotByPostId(Integer postId);

    @Query("""
        SELECT bp.post.id, b
        FROM BotPosts bp
        JOIN bp.bot b
        WHERE bp.post.id IN :postIds
    """)
    List<Object[]> findBotsByPostIds(@Param("postIds") List<Integer> postIds);

    @Query("""
        SELECT new com.syntexsquad.futurefeed.dto.BotPostDTO(
            bp.id,
            b.id,
            p.id,
            bp.createdAt
        )
        FROM BotPosts bp
        JOIN bp.bot b
        JOIN bp.post p
        WHERE b.id = :botId
    """)
    List<BotPostDTO> findDtoByBotId(@Param("botId") Integer botId);
}