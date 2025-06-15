package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.service.LikeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
public class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @InjectMocks
    private LikeService likeService;

    // Mock userId to be returned by SecurityContext
    private final Integer mockUserId = 1;

    @BeforeEach
    void setupSecurityContext() {
        // Mock SecurityContext to simulate logged-in user with ID = 1
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("user@example.com"); // or user id as string

        // Your LikeService probably extracts userId from the SecurityContext or principal.
        // You may need to mock principal or other methods depending on your implementation.
        // For this example, assume your LikeService extracts userId from authentication name or principal.

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testLikePost_whenNotAlreadyLiked_shouldReturnTrue() {
        Integer postId = 100;

        when(likeRepository.existsByUserIdAndPostId(mockUserId, postId)).thenReturn(false);

        boolean result = likeService.likePost(postId);

        assertTrue(result);
        verify(likeRepository, times(1)).save(any(Like.class));
    }

    @Test
    void testLikePost_whenAlreadyLiked_shouldReturnFalse() {
        Integer postId = 100;

        when(likeRepository.existsByUserIdAndPostId(mockUserId, postId)).thenReturn(true);

        boolean result = likeService.likePost(postId);

        assertFalse(result);
        verify(likeRepository, never()).save(any(Like.class));
    }

    @Test
    void testUnlikePost_whenExists_shouldReturnTrue() {
        Integer postId = 100;

        when(likeRepository.existsByUserIdAndPostId(mockUserId, postId)).thenReturn(true);

        boolean result = likeService.unlikePost(postId);

        assertTrue(result);
        verify(likeRepository, times(1)).deleteByUserIdAndPostId(mockUserId, postId);
    }

    @Test
    void testUnlikePost_whenDoesNotExist_shouldReturnFalse() {
        Integer postId = 100;

        when(likeRepository.existsByUserIdAndPostId(mockUserId, postId)).thenReturn(false);

        boolean result = likeService.unlikePost(postId);

        assertFalse(result);
        verify(likeRepository, never()).deleteByUserIdAndPostId(mockUserId, postId);
    }

    @Test
    void testCountLikes_shouldReturnCorrectCount() {
        Integer postId = 100;

        when(likeRepository.countByPostId(postId)).thenReturn(5L);

        long count = likeService.countLikes(postId);

        assertEquals(5L, count);
    }
}
