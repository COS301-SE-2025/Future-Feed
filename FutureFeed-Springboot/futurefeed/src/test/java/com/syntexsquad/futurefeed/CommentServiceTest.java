package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Comment;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.CommentRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.service.CommentService;
import com.syntexsquad.futurefeed.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CommentServiceTest {

    private CommentRepository commentRepository;
    private AppUserRepository appUserRepository;
    private PostRepository postRepository;
    private NotificationService notificationService;
    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentRepository = mock(CommentRepository.class);
        appUserRepository = mock(AppUserRepository.class);
        postRepository = mock(PostRepository.class);
        notificationService = mock(NotificationService.class);
        commentService = new CommentService(commentRepository, appUserRepository, postRepository, notificationService);
    }

    @Test
    void testAddComment_shouldReturnSavedComment() {
        int postId = 1;
        String content = "This is a test comment";

        AppUser mockUser = new AppUser();
        mockUser.setId(42);
        mockUser.setEmail("user@example.com");
        mockUser.setUsername("tester");

        AppUser postOwner = new AppUser();
        postOwner.setId(99);
        postOwner.setUsername("owner");

        UserPost userPost = new UserPost();
        userPost.setId(postId);
        userPost.setUser(postOwner); 

        Comment saved = new Comment();
        saved.setId(100);
        saved.setPostId(postId);
        saved.setUserId(mockUser.getId());
        saved.setContent(content);
        saved.setCreatedAt(LocalDateTime.now());

        when(postRepository.existsById(postId)).thenReturn(true);
        when(postRepository.findById(postId)).thenReturn(Optional.of(userPost)); 
        when(appUserRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(commentRepository.save(any(Comment.class))).thenReturn(saved);

        // Mock OAuth2 security context
        try (MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class)) {
            SecurityContext securityContext = mock(SecurityContext.class);
            OAuth2AuthenticationToken authToken = mock(OAuth2AuthenticationToken.class);
            OAuth2User oAuth2User = mock(OAuth2User.class);

            mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
            when(securityContext.getAuthentication()).thenReturn(authToken);
            when(authToken.getPrincipal()).thenReturn(oAuth2User);
            when(oAuth2User.getAttributes()).thenReturn(Map.of("email", "user@example.com"));

            Comment result = commentService.addComment(postId, content);

            assertNotNull(result);
            assertEquals(postId, result.getPostId());
            assertEquals(mockUser.getId(), result.getUserId());
            assertEquals(content, result.getContent());

            verify(notificationService, times(1)).createNotification(
                    eq(postOwner.getId()), eq(mockUser.getId()), eq("COMMENT"),
                    contains("commented on your post"),
                    eq(mockUser.getUsername() + ""), eq(postId)
            );
        }
    }

    @Test
    void testGetCommentsForPost_shouldReturnListOfComments() {
        Comment comment1 = new Comment();
        comment1.setId(1);
        comment1.setPostId(1);
        comment1.setUserId(2);
        comment1.setContent("First");

        Comment comment2 = new Comment();
        comment2.setId(2);
        comment2.setPostId(1);
        comment2.setUserId(3);
        comment2.setContent("Second");

        when(commentRepository.findByPostId(1)).thenReturn(Arrays.asList(comment1, comment2));

        List<Comment> comments = commentService.getCommentsForPost(1);

        assertEquals(2, comments.size());
        assertEquals("First", comments.get(0).getContent());
        assertEquals("Second", comments.get(1).getContent());
    }

    @Test
    void testGetCommentsForPost_shouldReturnEmptyList() {
        when(commentRepository.findByPostId(999)).thenReturn(Collections.emptyList());

        List<Comment> comments = commentService.getCommentsForPost(999);

        assertNotNull(comments);
        assertTrue(comments.isEmpty());
    }
}
