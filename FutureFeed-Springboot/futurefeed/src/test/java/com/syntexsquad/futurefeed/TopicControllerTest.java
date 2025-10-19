package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.TopicController;
import com.syntexsquad.futurefeed.config.SecurityConfig;
import com.syntexsquad.futurefeed.dto.PostTopicDTO;
import com.syntexsquad.futurefeed.dto.TopicDTO;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import com.syntexsquad.futurefeed.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.syntexsquad.futurefeed.service.CustomOAuth2UserService;
import com.syntexsquad.futurefeed.service.TopicService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TopicController.class)
@AutoConfigureMockMvc(addFilters = false)
public class TopicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostViewMapper postViewMapper;

    @MockBean
    private TopicService topicService;

    @MockBean
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void createTopic_ShouldReturnCreatedTopic() throws Exception {
        TopicDTO dto = new TopicDTO();
        dto.setName("Tech");

        Topic topic = new Topic();
        topic.setId(1);
        topic.setName("Tech");

        when(topicService.createTopic(any(TopicDTO.class))).thenReturn(topic);

        mockMvc.perform(post("/api/topics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Tech"));
    }

    @Test
    @WithMockUser
    public void getPaginatedPostsByTopic_ShouldReturnPaginatedPosts() throws Exception {
        int topicId = 5;
        UserPost post1 = new UserPost();
        post1.setId(1);
        Post post2 = new UserPost();
        post2.setId(2);

        List<Post> posts = List.of(post1, post2);
        Page<Post> page = new PageImpl<>(posts, PageRequest.of(0, 2), 2);

        PostDTO dto1 = new PostDTO();
        dto1.setId(1);
        PostDTO dto2 = new PostDTO();
        dto2.setId(2);

        when(topicService.getPaginatedPostsForTopic(topicId, 0, 2)).thenReturn(page);
        when(postViewMapper.toDtoList(posts)).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/api/topics/{topicId}/posts/paginated", topicId)
                .param("page", "0")
                .param("size", "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].id").value(1))
            .andExpect(jsonPath("$.content[1].id").value(2))
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(2))
            .andExpect(jsonPath("$.totalElements").value(2))
            .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    @WithMockUser
    public void getPaginatedPostsByTopic_ShouldReturnEmptyContent_WhenNoPostsExist() throws Exception {
        int topicId = 99;
        Page<Post> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);

        when(topicService.getPaginatedPostsForTopic(topicId, 0, 10)).thenReturn(emptyPage);
        when(postViewMapper.toDtoList(List.of())).thenReturn(List.of());

        mockMvc.perform(get("/api/topics/{topicId}/posts/paginated", topicId)
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty())
            .andExpect(jsonPath("$.totalElements").value(0))
            .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    @WithMockUser
    public void getPaginatedPostsByTopic_ShouldReturn404_WhenTopicNotFound() throws Exception {
        int invalidId = 1234;
        when(topicService.getPaginatedPostsForTopic(invalidId, 0, 10))
                .thenThrow(new RuntimeException("Topic not found"));

        mockMvc.perform(get("/api/topics/{topicId}/posts/paginated", invalidId)
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value("TopicNotFound"))
            .andExpect(jsonPath("$.message").value("Topic not found"));
    }

    @Test
    @WithMockUser
    public void getAllTopics_ShouldReturnListOfTopics() throws Exception {
        Topic topic = new Topic();
        topic.setId(1);
        topic.setName("News");

        when(topicService.getAllTopics()).thenReturn(List.of(topic));

        mockMvc.perform(get("/api/topics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].name").value("News"));
    }

    @Test
    @WithMockUser
    public void assignTopicsToPost_ShouldReturnSuccessMessage() throws Exception {
        PostTopicDTO dto = new PostTopicDTO();
        dto.setPostId(100);
        dto.setTopicIds(Arrays.asList(1, 2, 3));

        doNothing().when(topicService).assignTopicsToPost(any(PostTopicDTO.class));

        mockMvc.perform(post("/api/topics/assign")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isOk())
            .andExpect(content().string("Topics assigned to post."));
    }

    @Test
    @WithMockUser
    public void getTopicIdsByPost_ShouldReturnListOfIds() throws Exception {
        when(topicService.getTopicIdsByPostId(123)).thenReturn(List.of(1, 2, 3));

        mockMvc.perform(get("/api/topics/post/123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value(1))
            .andExpect(jsonPath("$[1]").value(2))
            .andExpect(jsonPath("$[2]").value(3));
    }

    @Test
    @WithMockUser
    public void getPostIdsByTopic_ShouldReturnListOfIds() throws Exception {
        when(topicService.getPostIdsByTopicId(456)).thenReturn(List.of(10, 20));

        mockMvc.perform(get("/api/topics/by-topic/456"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value(10))
            .andExpect(jsonPath("$[1]").value(20));
    }
}
