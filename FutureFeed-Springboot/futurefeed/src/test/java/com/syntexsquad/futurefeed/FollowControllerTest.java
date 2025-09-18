package com.syntexsquad.futurefeed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.syntexsquad.futurefeed.Controller.FollowController;
import com.syntexsquad.futurefeed.config.SecurityConfig;
import com.syntexsquad.futurefeed.dto.FollowRequest;
import com.syntexsquad.futurefeed.dto.FollowStatusResponse;
import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.service.CustomOAuth2UserService;
import com.syntexsquad.futurefeed.service.FollowService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = FollowController.class)
@Import(SecurityConfig.class)
public class FollowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FollowService followService;

    @MockBean
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    public void follow_ShouldReturnSuccessMessage() throws Exception {
        FollowRequest request = new FollowRequest();
        request.setFollowedId(123);
        doNothing().when(followService).follow(123);

        mockMvc.perform(post("/api/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().string("Followed successfully."));
    }

    @Test
    @WithMockUser
    public void follow_ShouldReturnBadRequestOnException() throws Exception {
        FollowRequest request = new FollowRequest();
        request.setFollowedId(123);
        doThrow(new RuntimeException("Follow failed")).when(followService).follow(123);

        mockMvc.perform(post("/api/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser
    public void unfollow_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(followService).unfollow(123);

        mockMvc.perform(delete("/api/follow/123"))
            .andExpect(status().isOk())
            .andExpect(content().string("Unfollowed successfully."));
    }

    @Test
    @WithMockUser
    public void unfollow_ShouldReturnBadRequestOnException() throws Exception {
        doThrow(new IllegalStateException("Unfollow failed")).when(followService).unfollow(123);

        mockMvc.perform(delete("/api/follow/123"))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Unfollow failed")));
    }

    @Test
    @WithMockUser
    public void isFollowing_ShouldReturnFollowStatus() throws Exception {
        FollowStatusResponse response = new FollowStatusResponse(true);
        when(followService.isFollowing(123)).thenReturn(response);

        mockMvc.perform(get("/api/follow/status/123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isFollowing").value(true));
    }

    @Test
    @WithMockUser
    public void getFollowers_ShouldReturnFollowersList() throws Exception {
        List<Follower> followers = new ArrayList<>();
        Follower f = new Follower();
        f.setFollowerId(1);
        f.setFollowedId(2);
        followers.add(f);

        when(followService.getFollowersOf(123)).thenReturn(followers);

        mockMvc.perform(get("/api/follow/followers/123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].followerId").value(1))
            .andExpect(jsonPath("$[0].followedId").value(2));
    }

    @Test
    @WithMockUser
    public void getFollowing_ShouldReturnFollowingList() throws Exception {
        List<Follower> following = new ArrayList<>();
        Follower f = new Follower();
        f.setFollowerId(3);
        f.setFollowedId(4);
        following.add(f);

        when(followService.getFollowingOf(123)).thenReturn(following);

        mockMvc.perform(get("/api/follow/following/123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].followerId").value(3))
            .andExpect(jsonPath("$[0].followedId").value(4));
    }

    @Test
    public void follow_ShouldReturnRedirectIfNotAuthenticated() throws Exception {
        FollowRequest request = new FollowRequest();
        request.setFollowedId(123);

        mockMvc.perform(post("/api/follow")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isFound()) // 302
            .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("http")));
    }
}
