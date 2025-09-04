package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.PostTopicDTO;
import com.syntexsquad.futurefeed.dto.TopicDTO;
import com.syntexsquad.futurefeed.model.Topic;
import com.syntexsquad.futurefeed.service.TopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

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
}
