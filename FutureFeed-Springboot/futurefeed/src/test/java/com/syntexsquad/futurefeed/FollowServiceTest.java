package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.FollowStatusResponse;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.FollowerRepository;
import com.syntexsquad.futurefeed.service.FollowService;
import com.syntexsquad.futurefeed.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

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
@MockitoSettings(strictness = Strictness.LENIENT) // avoid UnnecessaryStubbing for tests not using security
public class FollowServiceTest {

    @Mock private FollowerRepository followerRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private NotificationService notificationService; // <-- IMPORTANT

    @Mock private SecurityContext securityContext;
    @Mock private OAuth2AuthenticationToken oauth2AuthenticationToken;
    @Mock private OAuth2User oAuth2User;

    @InjectMocks
    private FollowService followService;

    private AppUser authenticatedUser;

    @BeforeEach
    public void setup() {
        // Security context stubs
        when(oAuth2User.getAttributes()).thenReturn(Map.of("email", "testuser@example.com"));
        when(oauth2AuthenticationToken.getPrincipal()).thenReturn(oAuth2User);
        when(securityContext.getAuthentication()).thenReturn(oauth2AuthenticationToken);
        SecurityContextHolder.setContext(securityContext);

        // Authenticated user
        authenticatedUser = new AppUser();
        authenticatedUser.setId(1);
        authenticatedUser.setEmail("testuser@example.com");
        authenticatedUser.setUsername("tester");

        when(appUserRepository.findByEmail("testuser@example.com"))
                .thenReturn(Optional.of(authenticatedUser));
    }

    @Test
    public void testFollow_Success() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(false);

        followService.follow(followedId);

        verify(followerRepository, times(1)).save(any(Follower.class));
        // Optional: prove notification was sent
        verify(notificationService, times(1)).createNotification(
                eq(followedId),
                eq(authenticatedUser.getId()),
                eq("FOLLOW"),
                contains("started following you"),
                eq(authenticatedUser.getUsername() + ""),
                isNull()
        );
    }

    @Test
    public void testFollow_ThrowsIfFollowSelf() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class, () -> followService.follow(authenticatedUser.getId()));
        assertEquals("Cannot follow yourself.", ex.getMessage());

        verify(followerRepository, never()).save(any());
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any(), any());
    }

    @Test
    public void testFollow_DoesNotSaveIfAlreadyFollowing() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(true);

        followService.follow(followedId);

        verify(followerRepository, never()).save(any());
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any(), any());
    }

    @Test
    public void testUnfollow_Success() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(true);

        followService.unfollow(followedId);

        verify(followerRepository, times(1))
                .deleteByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId);

        verify(notificationService, times(1)).createNotification(
                eq(followedId),
                eq(authenticatedUser.getId()),
                eq("UNFOLLOW"),
                contains("unfollowed you"),
                eq(authenticatedUser.getUsername() + ""),
                isNull()
        );
    }

    @Test
    public void testUnfollow_ThrowsIfNotFollowing() {
        int followedId = 2;
        when(followerRepository.existsByFollowerIdAndFollowedId(authenticatedUser.getId(), followedId))
                .thenReturn(false);

        IllegalStateException ex =
                assertThrows(IllegalStateException.class, () -> followService.unfollow(followedId));
        assertEquals("You are not following this user.", ex.getMessage());

        verify(followerRepository, never()).deleteByFollowerIdAndFollowedId(anyInt(), anyInt());
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any(), any());
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
