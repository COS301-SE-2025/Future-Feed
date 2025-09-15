package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.model.Bot;
import com.syntexsquad.futurefeed.model.BotPost;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.repository.BotRepository;
import com.syntexsquad.futurefeed.repository.PostRepository;
import com.syntexsquad.futurefeed.service.BotExecutionService;
import com.syntexsquad.futurefeed.service.BotPostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedConstruction;
import org.springframework.http.*;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class BotExecutionServiceTest {

    private BotExecutionService botExecutionService;
    private BotRepository botRepository;
    private PostRepository postRepository;
    private BotPostService botPostService;

    private Bot testBot;

    @BeforeEach
    void setUp() {
        botRepository = mock(BotRepository.class);
        postRepository = mock(PostRepository.class);
        botPostService = mock(BotPostService.class);

        botExecutionService = new BotExecutionService();

        // Inject dependencies
        org.springframework.test.util.ReflectionTestUtils.setField(botExecutionService, "botRepository", botRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(botExecutionService, "postRepository", postRepository);
        org.springframework.test.util.ReflectionTestUtils.setField(botExecutionService, "botPostService", botPostService);

        testBot = new Bot();
        testBot.setId(1);
        testBot.setPrompt("Generate a test post that is valid and long enough");
        testBot.setContextSource("http://example.com");
        testBot.setOwner(null); // simplified
    }

    @Test
    void testExecuteBot_success() throws Exception {
        when(botRepository.findById(1)).thenReturn(Optional.of(testBot));

        Post savedPost = new BotPost();
        savedPost.setId(100);
        savedPost.setCreatedAt(LocalDateTime.now());
        when(postRepository.save(any(Post.class))).thenReturn(savedPost);
        when(botPostService.linkBotToPost(1, 100)).thenReturn(null);

        try (MockedConstruction<org.springframework.web.client.RestTemplate> mockedRestTemplate =
                     mockConstruction(org.springframework.web.client.RestTemplate.class, (mock, context) -> {
                         String fakeJson = "{ \"output\": \"This is a valid bot-generated post content that is long enough.\" }";
                         ResponseEntity<String> responseEntity = new ResponseEntity<>(fakeJson, HttpStatus.OK);
                         when(mock.postForEntity(anyString(), any(), eq(String.class))).thenReturn(responseEntity);
                     })) {

            String output = botExecutionService.executeBot(1);

            assertNotNull(output);
            assertTrue(output.length() > 20);

            verify(postRepository, times(1)).save(any(Post.class));
            verify(botPostService, times(1)).linkBotToPost(1, 100);
        }
    }

    @Test
    void testExecuteBot_botNotFound() {
        when(botRepository.findById(999)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> botExecutionService.executeBot(999));
        assertTrue(ex.getMessage().contains("Bot not found"));
    }

    @Test
    void testExecuteBot_invalidOutput() throws Exception {
        when(botRepository.findById(1)).thenReturn(Optional.of(testBot));

        try (MockedConstruction<org.springframework.web.client.RestTemplate> mockedRestTemplate =
                     mockConstruction(org.springframework.web.client.RestTemplate.class, (mock, context) -> {
                         String fakeJson = "{ \"output\": \"short\" }"; // invalid output
                         ResponseEntity<String> responseEntity = new ResponseEntity<>(fakeJson, HttpStatus.OK);
                         when(mock.postForEntity(anyString(), any(), eq(String.class))).thenReturn(responseEntity);
                     })) {

            RuntimeException ex = assertThrows(RuntimeException.class, () -> botExecutionService.executeBot(1));
            assertTrue(ex.getMessage().contains("Bot output is invalid or empty"));

            verify(postRepository, never()).save(any());
            verify(botPostService, never()).linkBotToPost(anyInt(), anyInt());
        }
    }

    @Test
    void testExecuteBot_fastApiError() throws Exception {
        when(botRepository.findById(1)).thenReturn(Optional.of(testBot));

        try (MockedConstruction<org.springframework.web.client.RestTemplate> mockedRestTemplate =
                     mockConstruction(org.springframework.web.client.RestTemplate.class, (mock, context) -> {
                         String fakeJson = "{ \"error\": \"FastAPI internal error\" }";
                         ResponseEntity<String> responseEntity = new ResponseEntity<>(fakeJson, HttpStatus.OK);
                         when(mock.postForEntity(anyString(), any(), eq(String.class))).thenReturn(responseEntity);
                     })) {

            RuntimeException ex = assertThrows(RuntimeException.class, () -> botExecutionService.executeBot(1));
            assertTrue(ex.getMessage().contains("FastAPI error"));

            verify(postRepository, never()).save(any());
            verify(botPostService, never()).linkBotToPost(anyInt(), anyInt());
        }
    }

    @Test
    void testExecuteBot_nullOutput() throws Exception {
        when(botRepository.findById(1)).thenReturn(Optional.of(testBot));

        try (MockedConstruction<org.springframework.web.client.RestTemplate> mockedRestTemplate =
                     mockConstruction(org.springframework.web.client.RestTemplate.class, (mock, context) -> {
                         // Use JSON null (produces JsonNode.isNull() = true)
                         String fakeJson = "{ \"output\": \"\" }";
                         ResponseEntity<String> responseEntity = new ResponseEntity<>(fakeJson, HttpStatus.OK);
                         when(mock.postForEntity(anyString(), any(), eq(String.class))).thenReturn(responseEntity);
                     })) {

            RuntimeException ex = assertThrows(RuntimeException.class, () -> botExecutionService.executeBot(1));
            assertTrue(ex.getMessage().contains("Bot output is invalid or empty"));

            verify(postRepository, never()).save(any());
            verify(botPostService, never()).linkBotToPost(anyInt(), anyInt());
        }
    }

    @Test
    void testExecuteBot_outputWithErrorPhrase() throws Exception {
        when(botRepository.findById(1)).thenReturn(Optional.of(testBot));

        try (MockedConstruction<org.springframework.web.client.RestTemplate> mockedRestTemplate =
                     mockConstruction(org.springframework.web.client.RestTemplate.class, (mock, context) -> {
                         String fakeJson = "{ \"output\": \"Sorry, I couldn't extract meaningful content.\" }";
                         ResponseEntity<String> responseEntity = new ResponseEntity<>(fakeJson, HttpStatus.OK);
                         when(mock.postForEntity(anyString(), any(), eq(String.class))).thenReturn(responseEntity);
                     })) {

            RuntimeException ex = assertThrows(RuntimeException.class, () -> botExecutionService.executeBot(1));
            assertTrue(ex.getMessage().contains("Bot output is invalid or empty"));

            verify(postRepository, never()).save(any());
            verify(botPostService, never()).linkBotToPost(anyInt(), anyInt());
        }
    }

    @Test
    void testExecuteBot_outputExactly20Chars() throws Exception {
        when(botRepository.findById(1)).thenReturn(Optional.of(testBot));

        try (MockedConstruction<org.springframework.web.client.RestTemplate> mockedRestTemplate =
                     mockConstruction(org.springframework.web.client.RestTemplate.class, (mock, context) -> {
                         String fakeJson = "{ \"output\": \"12345678901234567890\" }"; // exactly 20 chars
                         ResponseEntity<String> responseEntity = new ResponseEntity<>(fakeJson, HttpStatus.OK);
                         when(mock.postForEntity(anyString(), any(), eq(String.class))).thenReturn(responseEntity);
                     })) {

            Post savedPost = new BotPost();
            savedPost.setId(101);
            savedPost.setCreatedAt(LocalDateTime.now());
            when(postRepository.save(any(Post.class))).thenReturn(savedPost);
            when(botPostService.linkBotToPost(1, 101)).thenReturn(null);

            String output = botExecutionService.executeBot(1);

            assertNotNull(output);
            assertEquals(20, output.length());

            verify(postRepository, times(1)).save(any(Post.class));
            verify(botPostService, times(1)).linkBotToPost(1, 101);
        }
    }
}
