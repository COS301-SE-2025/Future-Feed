package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.model.Like;
import com.syntexsquad.futurefeed.repository.LikeRepository;
import com.syntexsquad.futurefeed.service.LikeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class LikeServiceTest {

    private LikeRepository likeRepository;
    private LikeService likeService;

    @BeforeEach
    void setUp() {
        likeRepository = mock(LikeRepository.class);
        likeService = new LikeService(likeRepository);
    }

    @Test
    void testLikePost_whenNotAlreadyLiked_shouldReturnTrue() {
        when(likeRepository.existsByUserIdAndPostId(1, 100)).thenReturn(false);

        boolean result = likeService.likePost(1, 100);

        assertTrue(result);
        verify(likeRepository, times(1)).save(any(Like.class));
    }

    @Test
    void testLikePost_whenAlreadyLiked_shouldReturnFalse() {
        when(likeRepository.existsByUserIdAndPostId(1, 100)).thenReturn(true);

        boolean result = likeService.likePost(1, 100);

        assertFalse(result);
        verify(likeRepository, never()).save(any(Like.class));
    }

    @Test
    void testUnlikePost_whenExists_shouldReturnTrue() {
        when(likeRepository.existsByUserIdAndPostId(1, 100)).thenReturn(true);

        boolean result = likeService.unlikePost(1, 100);

        assertTrue(result);
        verify(likeRepository, times(1)).deleteByUserIdAndPostId(1, 100);
    }

    @Test
    void testUnlikePost_whenDoesNotExist_shouldReturnFalse() {
        when(likeRepository.existsByUserIdAndPostId(1, 100)).thenReturn(false);

        boolean result = likeService.unlikePost(1, 100);

        assertFalse(result);
        verify(likeRepository, never()).deleteByUserIdAndPostId(1, 100);
    }

    @Test
    void testCountLikes_shouldReturnCorrectCount() {
        when(likeRepository.countByPostId(100)).thenReturn(5L);

        long count = likeService.countLikes(100);

        assertEquals(5L, count);
    }
}
