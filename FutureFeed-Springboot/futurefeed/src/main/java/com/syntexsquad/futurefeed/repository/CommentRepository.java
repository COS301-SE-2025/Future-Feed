package com.syntexsquad.futurefeed.repository;

import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {

    List<Comment> findByPost(Post post);

    // JPQL fetch-join ensures user is initialized; stable order prevents "jumping" in UI
    @Query("""
        SELECT c FROM Comment c
        JOIN FETCH c.user u
        WHERE c.post.id = :postId
        ORDER BY c.id ASC
    """)
    List<Comment> findByPostIdWithUser(@Param("postId") Integer postId);

    // Keep native version if something else uses it
    @Query(value = """
        SELECT id, content, created_at, post_id, user_id
        FROM comments
        WHERE post_id = :postId
        ORDER BY id ASC
    """, nativeQuery = true)
    List<Comment> findByPostId(@Param("postId") Integer postId);

    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId")
    List<Comment> findByUserId(@Param("userId") Integer userId);

    boolean existsByUser_IdAndPost_Id(Integer userId, Integer postId);

    @Query("""
        SELECT DISTINCT p
        FROM Comment c
        JOIN c.post p
        WHERE c.user.id = :userId
    """)
    List<Post> findDistinctPostsCommentedByUser(@Param("userId") Integer userId);
}
