package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.service.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class PostServiceTest {

private PostRepository postRepository;
    private AppUserRepository appUserRepository;
    private PostService postService;

    @BeforeEach
    void setUp() {
        postRepository = mock(PostRepository.class);
        appUserRepository = mock(AppUserRepository.class);
        postService = new PostService(postRepository, appUserRepository); // ✅ Correct
    }

    @Test
    void testCreatePost_shouldSaveAndReturnPost() {
        PostRequest request = new PostRequest();
        request.setContent("Test content");
        request.setImageUrl("https://example.com/image.jpg");

        UserPost savedPost = new UserPost();
        savedPost.setId(1);
        savedPost.setContent(request.getContent());
        savedPost.setImageUrl(request.getImageUrl());

        when(postRepository.save(any(UserPost.class))).thenReturn(savedPost);

        UserPost result = (UserPost) postService.createPost(request);

        assertNotNull(result);
        assertEquals(savedPost.getId(), result.getId());
        assertEquals(savedPost.getContent(), result.getContent());
        assertEquals(savedPost.getImageUrl(), result.getImageUrl());

        ArgumentCaptor<UserPost> captor = ArgumentCaptor.forClass(UserPost.class);
        verify(postRepository).save(captor.capture());
        UserPost captured = captor.getValue();
        assertEquals(request.getContent(), captured.getContent());
        assertEquals(request.getImageUrl(), captured.getImageUrl());
    }

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

    @Test
void testSearchPosts_shouldReturnMatchingPosts() throws Exception {
    Post post1 = new UserPost();
    post1.setId(1);
    post1.setContent("Keyword match one");
    post1.setImageUrl("https://example.com/1.jpg");

    Post post2 = new UserPost();
    post2.setId(2);
    post2.setContent("Keyword match two");
    post2.setImageUrl("https://example.com/2.jpg");

    List<Post> mockResults = List.of(post1, post2); // ✅ FIXED

    when(postService.searchPosts("keyword")).thenReturn(mockResults);
}

}
