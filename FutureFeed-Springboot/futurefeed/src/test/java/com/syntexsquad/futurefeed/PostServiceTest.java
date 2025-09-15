package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.PostRequest;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.service.PostService;
import com.syntexsquad.futurefeed.service.TopicService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.*;
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
    private TopicService topicService;
    private PostService postService;

    private final String testEmail = "user@example.com";
    private final Integer userId = 1;

    @BeforeEach
    void setUp() {
        postRepository = mock(PostRepository.class);
        appUserRepository = mock(AppUserRepository.class);
        likeRepository = mock(LikeRepository.class);
        commentRepository = mock(CommentRepository.class);
        topicService = mock(TopicService.class);

        postService = new PostService(postRepository, appUserRepository, likeRepository, commentRepository, topicService);

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
    void testCreatePost_shouldSaveAndReturnUserPost_andAutoTag() {
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

        // verify auto-tag called
        verify(topicService, times(1)).autoTagIfMissing(savedPost.getId());
    }

    @Test
    void testCreatePost_shouldSaveAndReturnBotPost_andAutoTag() {
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

        // verify auto-tag called
        verify(topicService, times(1)).autoTagIfMissing(savedPost.getId());
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

        Post post2 = new UserPost();
        post2.setId(2);
        post2.setContent("Keyword match two");

        List<Post> mockResults = List.of(post1, post2);
        when(postRepository.searchByKeyword("keyword")).thenReturn(mockResults);

        List<Post> results = postService.searchPosts("keyword");

        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void testGetPostById_found() {
        Post post = new UserPost();
        post.setId(1);
        when(postRepository.findById(1)).thenReturn(Optional.of(post));

        Post result = postService.getPostById(1);
        assertEquals(post, result);
    }

    @Test
    void testGetPostById_notFound() {
        when(postRepository.findById(1)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> postService.getPostById(1));
        assertTrue(ex.getMessage().contains("Post with ID 1 not found"));
    }

    @Test
    void testExistsById() {
        when(postRepository.existsById(1)).thenReturn(true);
        assertTrue(postService.existsById(1));

        when(postRepository.existsById(2)).thenReturn(false);
        assertFalse(postService.existsById(2));
    }

    @Test
    void testGetAllPosts() {
        List<Post> posts = List.of(new UserPost(), new BotPost());
        when(postRepository.findAll()).thenReturn(posts);

        List<Post> result = postService.getAllPosts();
        assertEquals(posts, result);
    }

    @Test
    void testGetPaginatedPosts() {
        List<Post> posts = List.of(new UserPost(), new BotPost());
        Pageable pageable = PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> page = new PageImpl<>(posts, pageable, posts.size());
        when(postRepository.findAll(pageable)).thenReturn(page);

        Page<Post> result = postService.getPaginatedPosts(0, 2);
        assertEquals(2, result.getContent().size());
        assertEquals(posts, result.getContent());
    }

    @Test
    void testGetPostsByUserId() {
        List<Post> posts = List.of(new UserPost(), new UserPost());
        when(postRepository.findAllByUserId(userId)).thenReturn(posts);

        List<Post> result = postService.getPostsByUserId(userId);
        assertEquals(posts, result);
    }

    @Test
    void testGetLikedPostsByUserId() {
        List<Integer> likedIds = List.of(1, 2);
        List<Post> posts = List.of(new UserPost(), new BotPost());

        when(likeRepository.findPostIdsByUserId(userId)).thenReturn(likedIds);
        when(postRepository.findAllById(likedIds)).thenReturn(posts);

        List<Post> result = postService.getLikedPostsByUserId(userId);
        assertEquals(posts, result);
    }

    @Test
    void testGetPostsCommentedByUser() {
        Comment comment1 = new Comment();
        comment1.setPostId(1);
        Comment comment2 = new Comment();
        comment2.setPostId(2);
        Comment comment3 = new Comment();
        comment3.setPostId(1); // duplicate post

        when(commentRepository.findByUserId(userId)).thenReturn(List.of(comment1, comment2, comment3));

        List<Post> posts = List.of(new UserPost(), new BotPost());
        when(postRepository.findAllById(List.of(1, 2))).thenReturn(posts);

        List<Post> result = postService.getPostsCommentedByUser(userId);
        assertEquals(posts, result);
    }
}
