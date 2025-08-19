package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.dto.PostTopicDTO;
import com.syntexsquad.futurefeed.dto.TopicDTO;
import com.syntexsquad.futurefeed.model.Topic;
import com.syntexsquad.futurefeed.model.AppUser;
import com.syntexsquad.futurefeed.model.PostTopic;
import com.syntexsquad.futurefeed.model.UserPost;
import com.syntexsquad.futurefeed.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
//@Transactional
public class TopicIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private TopicRepository topicRepo;
    @Autowired private AppUserRepository userRepo;
    @Autowired private FollowerRepository followerRepo;
    @Autowired private PostRepository postRepo;
    @Autowired private PostTopicRepository postTopicRepo;
    @Autowired private CommentRepository commentRepo;
    @Autowired private ReshareRepository reshareRepo;
    @Autowired private LikeRepository likeRepo;
    @Autowired private BookmarkRepository bookmarkRepo;
    @Autowired private BotPostRepository botPostRepo;
    @Autowired private BotRepository botRepo;
    @Autowired private FeedPresetRepository presetRepo;
    @Autowired private PresetRuleRepository ruleRepo;
    @Autowired private ObjectMapper objectMapper;

    private UserPost post;

    @BeforeEach
    public void setup() {
        ruleRepo.deleteAll();
        presetRepo.deleteAll();
        reshareRepo.deleteAll();
        commentRepo.deleteAll();
        likeRepo.deleteAll();
        bookmarkRepo.deleteAll();
        botPostRepo.deleteAll();
        postTopicRepo.deleteAll();
        topicRepo.deleteAll();
        postRepo.deleteAll();
        followerRepo.deleteAll();
        botRepo.deleteAll();
        //userRepo.deleteAll();

        // Create a test user
        var user = userRepo.findByUsername("testuser")
            .orElseGet(() -> {
                AppUser u = new AppUser();
                u.setUsername("testuser");
                u.setEmail("testuser@example.com");
                u.setPassword("test123");
                u.setDisplayName("Test User");
                u.setBio("Test bio");
                u.setDateOfBirth(LocalDate.of(2000, 1, 1));
                return userRepo.save(u);
            });

        post = new UserPost();
        post.setContent("Testing topic links");
        post.setUser(user);
        post = postRepo.save(post);
    }

    @Test
    @WithMockUser
    public void testCreateTopic() throws Exception {
        TopicDTO dto = new TopicDTO();
        dto.setName("Tech");

        mockMvc.perform(post("/api/topics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Tech"));
    }

    @Test
    @WithMockUser
    public void testGetAllTopics() throws Exception {
        Topic topic = new Topic();
        topic.setName("Science");
        topicRepo.save(topic);

        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Science"));
    }

    @Test
    @WithMockUser
    public void testAssignTopicsToPost() throws Exception {
        Topic t1 = new Topic();
        t1.setName("AI");
        t1 = topicRepo.save(t1);

        Topic t2 = new Topic();
        t2.setName("ML");
        t2 = topicRepo.save(t2);

        PostTopicDTO dto = new PostTopicDTO();
        dto.setPostId(post.getId());
        dto.setTopicIds(List.of(t1.getId(), t2.getId()));

        mockMvc.perform(post("/api/topics/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Topics assigned to post."));
    }

    @Test
    @WithMockUser
    public void testGetPostIdsByTopic() throws Exception {
        Topic t = new Topic();
        t.setName("Education");
        t = topicRepo.save(t);

        PostTopic link = new PostTopic();
        link.setPostId(post.getId());
        link.setTopicId(t.getId());
        postTopicRepo.save(link);

        mockMvc.perform(get("/api/topics/by-topic/" + t.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value(post.getId()));
    }

    @Test
    @WithMockUser
    public void testGetTopicIdsByPost() throws Exception {
        Topic t = new Topic();
        t.setName("Sports");
        t = topicRepo.save(t);

        PostTopic link = new PostTopic();
        link.setPostId(post.getId());
        link.setTopicId(t.getId());
        postTopicRepo.save(link);

        mockMvc.perform(get("/api/topics/post/" + post.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value(t.getId()));
    }
}
