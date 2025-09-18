package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.BotPostDTO;
import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.model.BotPosts;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.BotPostRepository;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.service.BotPostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BotPostServiceTest {

    private BotPostService botPostService;
    private BotPostRepository botPostRepository;
    private BotRepository botRepository;
    private PostRepository postRepository;

    @BeforeEach
    void setUp() {
        botPostRepository = mock(BotPostRepository.class);
        botRepository = mock(BotRepository.class);
        postRepository = mock(PostRepository.class);

        botPostService = new BotPostService();

        ReflectionTestUtils.setField(botPostService, "botPostRepository", botPostRepository);
        ReflectionTestUtils.setField(botPostService, "botRepository", botRepository);
        ReflectionTestUtils.setField(botPostService, "postRepository", postRepository);
    }

    // ===== LINK BOT TO POST =====
    @Test
    void testLinkBotToPost_success() {
        Bot bot = new Bot();
        bot.setId(1);
        Post post = new Post() { };
        post.setId(10);

        BotPosts savedBotPost = new BotPosts();
        savedBotPost.setId(100);
        savedBotPost.setBot(bot);
        savedBotPost.setPost(post);
        savedBotPost.setCreatedAt(LocalDateTime.now());

        when(botRepository.findById(1)).thenReturn(Optional.of(bot));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(botPostRepository.save(any(BotPosts.class))).thenReturn(savedBotPost);

        BotPostDTO dto = botPostService.linkBotToPost(1, 10);

        assertEquals(100, dto.getId());
        assertEquals(1, dto.getBotId());
        assertEquals(10, dto.getPostId());
        assertNotNull(dto.getCreatedAt());

        verify(botPostRepository, times(1)).save(any(BotPosts.class));
        verify(botRepository, times(1)).findById(1);
        verify(postRepository, times(1)).findById(10);
    }

    @Test
    void testLinkBotToPost_botNotFound() {
        when(botRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                botPostService.linkBotToPost(999, 10));

        assertTrue(ex.getMessage().contains("Bot not found"));
        verify(botPostRepository, never()).save(any());
    }

    @Test
    void testLinkBotToPost_postNotFound() {
        Bot bot = new Bot();
        bot.setId(1);
        when(botRepository.findById(1)).thenReturn(Optional.of(bot));
        when(postRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                botPostService.linkBotToPost(1, 999));

        assertTrue(ex.getMessage().contains("Post not found"));
        verify(botPostRepository, never()).save(any());
    }

    // ===== GET POSTS BY BOT =====
    @Test
    void testGetPostsByBot_success() {
        BotPostDTO dto1 = new BotPostDTO(1, 1, 10, LocalDateTime.now());
        BotPostDTO dto2 = new BotPostDTO(2, 1, 11, LocalDateTime.now());

        when(botPostRepository.findDtoByBotId(1)).thenReturn(List.of(dto1, dto2));

        List<BotPostDTO> result = botPostService.getPostsByBot(1);

        assertEquals(2, result.size());
        assertEquals(10, result.get(0).getPostId());
        assertEquals(11, result.get(1).getPostId());
        verify(botPostRepository, times(1)).findDtoByBotId(1);
    }

    @Test
    void testGetPostsByBot_emptyList() {
        when(botPostRepository.findDtoByBotId(1)).thenReturn(List.of());

        List<BotPostDTO> result = botPostService.getPostsByBot(1);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(botPostRepository, times(1)).findDtoByBotId(1);
    }

    // ===== EDGE CASES =====
    @Test
    void testLinkBotToPost_samePostTwice() {
        Bot bot = new Bot();
        bot.setId(1);
        Post post = new Post() { };
        post.setId(10);

        BotPosts savedBotPost = new BotPosts();
        savedBotPost.setId(100);
        savedBotPost.setBot(bot);
        savedBotPost.setPost(post);
        savedBotPost.setCreatedAt(LocalDateTime.now());

        when(botRepository.findById(1)).thenReturn(Optional.of(bot));
        when(postRepository.findById(10)).thenReturn(Optional.of(post));
        when(botPostRepository.save(any(BotPosts.class))).thenReturn(savedBotPost);

        // first link
        BotPostDTO first = botPostService.linkBotToPost(1, 10);
        // second link
        BotPostDTO second = botPostService.linkBotToPost(1, 10);

        assertEquals(first.getId(), second.getId());
        verify(botPostRepository, times(2)).save(any(BotPosts.class));
    }
}
