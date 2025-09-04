package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.FollowStatusResponse;
import com.syntexsquad.futurefeed.service.FollowService;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.FollowerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FollowServiceTest {

    @Mock
    private FollowerRepository followerRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private OAuth2AuthenticationToken oauth2AuthenticationToken;

    @Mock
    private OAuth2User oAuth2User;

    @InjectMocks
    private FollowService followService;

    private AppUser authenticatedUser;

    @BeforeEach
    public void setup() {
        lenient().when(oAuth2User.getAttributes()).thenReturn(Map.of("email", "testuser@example.com"));
        lenient().when(oauth2AuthenticationToken.getPrincipal()).thenReturn(oAuth2User);
        lenient().when(securityContext.getAuthentication()).thenReturn(oauth2AuthenticationToken);
        SecurityContextHolder.setContext(securityContext);

        authenticatedUser = new AppUser();
        authenticatedUser.setId(1);
        authenticatedUser.setEmail("testuser@example.com");
        lenient().when(appUserRepository.findByEmail("testuser@example.com")).thenReturn(Optional.of(authenticatedUser));
    }

    @Test
    public void testFollow_Success() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(false);

        followService.follow(followedId);

        verify(followerRepository, times(1)).save(any(Follower.class));
    }

    @Test
    public void testFollow_ThrowsIfFollowSelf() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            followService.follow(authenticatedUser.getId());
        });
        assertEquals("Cannot follow yourself.", ex.getMessage());
        verify(followerRepository, never()).save(any());
    }

    @Test
    public void testFollow_DoesNotSaveIfAlreadyFollowing() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(true);

        followService.follow(followedId);

        verify(followerRepository, never()).save(any());
    }

    @Test
    public void testUnfollow_Success() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(true);

        followService.unfollow(followedId);

        verify(followerRepository, times(1)).deleteByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId);
    }

    @Test
    public void testUnfollow_ThrowsIfNotFollowing() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(false);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            followService.unfollow(followedId);
        });
        assertEquals("You are not following this user.", ex.getMessage());

        verify(followerRepository, never()).deleteByFollowerIdAndFollowedId(anyInt(), anyInt());
    }

    @Test
    public void testIsFollowing_ReturnsTrue() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(true);

        FollowStatusResponse response = followService.isFollowing(followedId);

        assertTrue(response.isFollowing());
    }

    @Test
    public void testIsFollowing_ReturnsFalse() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(false);

        FollowStatusResponse response = followService.isFollowing(followedId);

        assertFalse(response.isFollowing());
    }

    @Test
    public void testGetFollowersOf() {
        int userId = 5;
        List<Follower> followers = List.of(new Follower());
        when(followerRepository.findByFollowedId(userId)).thenReturn(followers);

        List<Follower> result = followService.getFollowersOf(userId);

        assertEquals(followers, result);
    }

    @Test
    public void testGetFollowingOf() {
        int userId = 5;
        List<Follower> following = List.of(new Follower());
        when(followerRepository.findByFollowerId(userId)).thenReturn(following);

        List<Follower> result = followService.getFollowingOf(userId);

        assertEquals(following, result);
    }
}
