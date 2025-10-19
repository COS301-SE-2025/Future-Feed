package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.PostTopicDTO;
import com.syntexsquad.futurefeed.dto.TopicDTO;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.Topic;
import org.springframework.data.domain.Page;
import com.syntexsquad.futurefeed.service.TopicService;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

    @Autowired
    private PostViewMapper postViewMapper;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @PostMapping
    public ResponseEntity<Topic> createTopic(@RequestBody TopicDTO dto) {
        return ResponseEntity.ok(topicService.createTopic(dto));
    }

    @GetMapping
    public ResponseEntity<List<Topic>> getAllTopics() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignTopicsToPost(@RequestBody PostTopicDTO dto) {
        topicService.assignTopicsToPost(dto);
        return ResponseEntity.ok("Topics assigned to post.");
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Integer>> getTopicIdsByPost(@PathVariable Integer postId) {
        return ResponseEntity.ok(topicService.getTopicIdsByPostId(postId));
    }

    @GetMapping("/by-topic/{topicId}")
    public ResponseEntity<List<Integer>> getPostIdsByTopic(@PathVariable Integer topicId) {
        return ResponseEntity.ok(topicService.getPostIdsByTopicId(topicId));
    }

    @GetMapping("/trending")
    public List<Topic> getTrendingTopics(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "24") int hoursBack) {
        return topicService.getTrendingTopics(limit, hoursBack);
    }

    @GetMapping("/{topicId}/posts")
    public List<Post> getPostsForTopic(@PathVariable Integer topicId) {
        return topicService.getPostsForTopic(topicId);
    }

    @GetMapping("/{topicId}/posts/paginated")
    public ResponseEntity<?> getPaginatedPostsForTopic(
            @PathVariable Integer topicId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            Page<Post> pageObj = topicService.getPaginatedPostsForTopic(topicId, page, size);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("content", postViewMapper.toDtoList(pageObj.getContent()));
            body.put("page", pageObj.getNumber());
            body.put("size", pageObj.getSize());
            body.put("totalPages", pageObj.getTotalPages());
            body.put("totalElements", pageObj.getTotalElements());
            body.put("last", pageObj.isLast());
            return ResponseEntity.ok(body);

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "error", "TopicNotFound",
                    "message", e.getMessage()
            ));
        }
    }
}
