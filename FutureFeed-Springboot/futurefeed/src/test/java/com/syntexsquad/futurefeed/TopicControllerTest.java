package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.TopicController;
import com.syntexsquad.futurefeed.config.SecurityConfig;
import com.syntexsquad.futurefeed.dto.PostTopicDTO;
import com.syntexsquad.futurefeed.dto.TopicDTO;
import com.syntexsquad.futurefeed.model.Topic;
import com.syntexsquad.futurefeed.service.CustomOAuth2UserService;
import com.syntexsquad.futurefeed.service.TopicService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TopicController.class)
@Import(SecurityConfig.class)
public class TopicControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
