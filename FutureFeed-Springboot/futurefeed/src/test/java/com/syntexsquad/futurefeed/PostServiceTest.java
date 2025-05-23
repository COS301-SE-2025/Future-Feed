package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.service.PostService;
import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

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

    @Test
    void testCreatePost_shouldSaveAndReturnPost() {
        // Arrange input
        PostRequest request = new PostRequest();
        request.setUserId(1);
        request.setContent("Test content");
        request.setImageUrl("https://example.com/image.jpg");
        request.setIsBot(true);

        // Mocking repository response
        Post savedPost = new Post();
        savedPost.setId(1);
        savedPost.setUserId(request.getUserId());
        savedPost.setContent(request.getContent());
        savedPost.setImageUrl(request.getImageUrl());
        savedPost.setIsBot(request.getIsBot());

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        // Act
        Post result = postService.createPost(request);

        // Assert
        assertNotNull(result);
        assertEquals(savedPost.getId(), result.getId());
        assertEquals(request.getUserId(), result.getUserId());
        assertEquals(request.getContent(), result.getContent());
        assertEquals(request.getImageUrl(), result.getImageUrl());
        assertEquals(request.getIsBot(), result.getIsBot());

        // Verify that save was called with correct values
        ArgumentCaptor<Post> captor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository, times(1)).save(captor.capture());
        Post captured = captor.getValue();
        assertEquals(request.getUserId(), captured.getUserId());
        assertEquals(request.getContent(), captured.getContent());
        assertEquals(request.getImageUrl(), captured.getImageUrl());
        assertEquals(request.getIsBot(), captured.getIsBot());
    }
}

