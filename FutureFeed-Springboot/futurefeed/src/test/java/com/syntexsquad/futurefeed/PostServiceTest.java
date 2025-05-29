package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.service.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PostServiceTest {

    private PostRepository postRepository;
    private PostService postService;

    @BeforeEach
    void setUp() {
        postRepository = mock(PostRepository.class);
        postService = new PostService(postRepository);
    }

    // ---------- createPost ----------
    @Test
    void testCreatePost_shouldSaveAndReturnPost() {
        PostRequest request = new PostRequest();
        request.setUserId(1);
        request.setContent("Test content");
        request.setImageUrl("https://example.com/image.jpg");
        request.setIsBot(true);

        Post savedPost = new Post();
        savedPost.setId(1);
        savedPost.setUserId(request.getUserId());
        savedPost.setContent(request.getContent());
        savedPost.setImageUrl(request.getImageUrl());
        savedPost.setIsBot(request.getIsBot());

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        Post result = postService.createPost(request);

        assertNotNull(result);
        assertEquals(savedPost.getId(), result.getId());
        assertEquals(savedPost.getUserId(), result.getUserId());
        assertEquals(savedPost.getContent(), result.getContent());
        assertEquals(savedPost.getImageUrl(), result.getImageUrl());
        assertEquals(savedPost.getIsBot(), result.getIsBot());

        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository, times(1)).save(captor.capture());

        Post captured = captor.getValue();
        assertEquals(request.getUserId(), captured.getUserId());
        assertEquals(request.getContent(), captured.getContent());
        assertEquals(request.getImageUrl(), captured.getImageUrl());
        assertEquals(request.getIsBot(), captured.getIsBot());
    }

    // ---------- deletePost ----------
    @Test
    void testDeletePost_shouldDeleteIfExists() {
        Integer postId = 1;

        when(postRepository.existsById(postId)).thenReturn(true);

        boolean result = postService.deletePost(postId);

        assertTrue(result);
        verify(postRepository).deleteById(postId);
    }

    @Test
    void testDeletePost_shouldReturnFalseIfNotFound() {
        Integer postId = 1;

        when(postRepository.existsById(postId)).thenReturn(false);

        boolean result = postService.deletePost(postId);

        assertFalse(result);
        verify(postRepository, never()).deleteById(any());
    }

    // ---------- searchPosts ----------
    @Test
    void testSearchPosts_shouldReturnResults() {
        String keyword = "hello";

        Post post = new Post();
        post.setId(1);
        post.setContent("hello world");
        List<Post> expectedResults = List.of(post);

        when(postRepository.searchByKeyword(keyword)).thenReturn(expectedResults);

        List<Post> results = postService.searchPosts(keyword);

        assertEquals(1, results.size());
        assertEquals("hello world", results.get(0).getContent());
        verify(postRepository, times(1)).searchByKeyword(keyword);
    }
}
