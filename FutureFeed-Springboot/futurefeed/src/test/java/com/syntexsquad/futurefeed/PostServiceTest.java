package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.BotPost;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.service.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class PostServiceTest {

    private PostRepository postRepository;
    private AppUserRepository appUserRepository;
    private LikeRepository likeRepository;
    private CommentRepository commentRepository;
    private PostService postService;

    private final String testEmail = "user@example.com";
    private final Integer userId = 1;

    @BeforeEach
    void setUp() {
        postRepository = mock(PostRepository.class);
        appUserRepository = mock(AppUserRepository.class);
        likeRepository = mock(LikeRepository.class);
        commentRepository = mock(CommentRepository.class);
        postService = new PostService(postRepository, appUserRepository, likeRepository, commentRepository);

        // Mock OAuth2User with email attribute
        OAuth2User mockOAuth2User = mock(OAuth2User.class);
        when(mockOAuth2User.getAttributes()).thenReturn(Map.of("email", testEmail));

        // Mock OAuth2AuthenticationToken returning the mocked OAuth2User
        OAuth2AuthenticationToken authToken = mock(OAuth2AuthenticationToken.class);
        when(authToken.getPrincipal()).thenReturn(mockOAuth2User);

        // Mock SecurityContext holding the authentication token
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authToken);

        SecurityContextHolder.setContext(securityContext);

        // Mock AppUser returned by findByEmail
        AppUser mockUser = new AppUser();
        mockUser.setId(userId);
        mockUser.setEmail(testEmail);

        when(appUserRepository.findByEmail(testEmail)).thenReturn(Optional.of(mockUser));
    }

    @Test
    void testCreatePost_shouldSaveAndReturnUserPost() {
        PostRequest request = new PostRequest();
        request.setContent("Test content");
        request.setImageUrl("https://example.com/image.jpg");
        request.setIsBot(false); // normal user post

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
        assertEquals(userId, captured.getUser().getId());
    }

    @Test
    void testCreatePost_shouldSaveAndReturnBotPost() {
        PostRequest request = new PostRequest();
        request.setContent("Bot post content");
        request.setImageUrl("https://example.com/bot-image.jpg");
        request.setIsBot(true); // bot post

        BotPost savedPost = new BotPost();
        savedPost.setId(2);
        savedPost.setContent(request.getContent());
        savedPost.setImageUrl(request.getImageUrl());

        when(postRepository.save(any(BotPost.class))).thenReturn(savedPost);

        BotPost result = (BotPost) postService.createPost(request);

        assertNotNull(result);
        assertEquals(savedPost.getId(), result.getId());
        assertEquals(savedPost.getContent(), result.getContent());
        assertEquals(savedPost.getImageUrl(), result.getImageUrl());

        ArgumentCaptor<BotPost> captor = ArgumentCaptor.forClass(BotPost.class);
        verify(postRepository).save(captor.capture());
        BotPost captured = captor.getValue();
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
    void testSearchPosts_shouldReturnMatchingPosts() {
        Post post1 = new UserPost();
        post1.setId(1);
        post1.setContent("Keyword match one");
        post1.setImageUrl("https://example.com/1.jpg");

        Post post2 = new UserPost();
        post2.setId(2);
        post2.setContent("Keyword match two");
        post2.setImageUrl("https://example.com/2.jpg");

        List<Post> mockResults = List.of(post1, post2);

        when(postRepository.searchByKeyword("keyword")).thenReturn(mockResults);

        List<Post> results = postService.searchPosts("keyword");

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals("Keyword match one", results.get(0).getContent());
        assertEquals("Keyword match two", results.get(1).getContent());
    }
}
