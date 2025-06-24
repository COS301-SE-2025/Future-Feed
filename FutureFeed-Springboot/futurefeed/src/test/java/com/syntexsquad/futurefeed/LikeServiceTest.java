package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.service.LikeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT) // avoid unnecessary stubbing errors
public class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private com.syntexsquad.futurefeed.service.PostService postService;

    @InjectMocks
    private LikeService likeService;

    private final Integer mockUserId = 1;

    @BeforeEach
    void setupSecurityContext() {
        // Mock OAuth2User with "email" attribute
        Map<String, Object> attributes = Map.of("email", "user@example.com");
        OAuth2User mockPrincipal = mock(OAuth2User.class);
        when(mockPrincipal.getAttributes()).thenReturn(attributes);

        // Mock OAuth2AuthenticationToken to return the mockPrincipal
        OAuth2AuthenticationToken authToken = mock(OAuth2AuthenticationToken.class);
        when(authToken.getPrincipal()).thenReturn(mockPrincipal);

        // Mock SecurityContext to return the mocked OAuth2AuthenticationToken
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authToken);
        SecurityContextHolder.setContext(securityContext);

        // Mock AppUserRepository to return a user with ID = 1 for the given email
        AppUser mockUser = new AppUser();
        mockUser.setId(mockUserId);
        mockUser.setEmail("user@example.com");
        when(appUserRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
    }

    @Test
    void testLikePost_whenNotAlreadyLiked_shouldReturnTrue() {
        Integer postId = 100;

        when(postService.existsById(postId)).thenReturn(true);
        when(likeRepository.existsByUserIdAndPostId(mockUserId, postId)).thenReturn(false);

        boolean result = likeService.likePost(postId);

        assertTrue(result);
        verify(likeRepository, times(1)).save(any(Like.class));
    }

    @Test
    void testLikePost_whenAlreadyLiked_shouldReturnFalse() {
        Integer postId = 100;

        when(postService.existsById(postId)).thenReturn(true);
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
