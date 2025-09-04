package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.repository.AppUserRepository;
import com.syntexsquad.futurefeed.repository.ReshareRepository;
import com.syntexsquad.futurefeed.service.ReshareService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
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
public class ReshareServiceTest {

    @Mock
    private ReshareRepository reshareRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private OAuth2AuthenticationToken oauth2AuthenticationToken;

    @Mock
    private OAuth2User oAuth2User;

    @InjectMocks
    private ReshareService reshareService;

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
    public void testResharePost_SavesIfNotAlreadyReshared() {
        int postId = 100;
        when(reshareRepository.existsByUserIdAndPostId(authenticatedUser.getId(), postId)).thenReturn(false);

        reshareService.resharePost(postId);

        verify(reshareRepository, times(1)).save(any(Reshare.class));
    }

    @Test
    public void testResharePost_DoesNotSaveIfAlreadyReshared() {
        int postId = 100;
        when(reshareRepository.existsByUserIdAndPostId(authenticatedUser.getId(), postId)).thenReturn(true);

        reshareService.resharePost(postId);

        verify(reshareRepository, never()).save(any());
    }

    @Test
    public void testUnresharePost_DeletesSuccessfully() {
        int postId = 100;
        when(reshareRepository.deleteByUserIdAndPostId(authenticatedUser.getId(), postId)).thenReturn(1);

        assertDoesNotThrow(() -> reshareService.unresharePost(postId));

        verify(reshareRepository, times(1)).deleteByUserIdAndPostId(authenticatedUser.getId(), postId);
    }

    @Test
    public void testUnresharePost_ThrowsRuntimeExceptionOnFailure() {
        int postId = 100;
        when(reshareRepository.deleteByUserIdAndPostId(authenticatedUser.getId(), postId))
                .thenThrow(new RuntimeException("DB error"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> reshareService.unresharePost(postId));

        assertTrue(ex.getMessage().contains("Failed to unreshare post"));
        verify(reshareRepository, times(1)).deleteByUserIdAndPostId(authenticatedUser.getId(), postId);
    }

    @Test
    public void testGetResharesByUser_ReturnsList() {
        List<Reshare> resharedPosts = List.of(new Reshare(), new Reshare());
        when(reshareRepository.findByUserId(authenticatedUser.getId())).thenReturn(resharedPosts);

        List<Reshare> result = reshareService.getResharesByUser();

        assertEquals(resharedPosts, result);
    }
}
