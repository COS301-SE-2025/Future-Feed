package com.syntexsquad.futurefeed.Controller;

//import com.syntexsquad.futurefeed.dto.PostReshareInfoDTO;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.dto.ReshareRequest;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.service.ReshareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reshares")
public class ReshareController {

    private final ReshareService reshareService;
    private final PostViewMapper postViewMapper;
    public ReshareController(ReshareService reshareService, PostViewMapper postViewMapper) {
        this.reshareService = reshareService;
        this.postViewMapper = postViewMapper;
    }

    @PostMapping
    public ResponseEntity<?> reshare(@RequestBody ReshareRequest request) {
        reshareService.resharePost(request.getPostId());
        return ResponseEntity.ok("Post reshared.");
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> unreshare(@PathVariable Integer postId) {
        try {
            reshareService.unresharePost(postId);
            return ResponseEntity.ok("Post unreshared.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Reshare>> myReshares() {
        return ResponseEntity.ok(reshareService.getResharesByUser());
    }

    @GetMapping("/{postId}/count")
    public ResponseEntity<Long> getReshareCount(@PathVariable Integer postId) {
        long count = reshareService.getReshareCount(postId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{postId}/has-reshared")
    public ResponseEntity<Boolean> hasReshared(@PathVariable Integer postId) {
        boolean hasReshared = reshareService.hasUserReshared(postId);
        return ResponseEntity.ok(hasReshared);
    }

    @GetMapping("/my-reshares/{userId}")
    public ResponseEntity<List<PostDTO>> getResharedPosts(@PathVariable Integer userId) {
        return ResponseEntity.ok(postViewMapper.toDtoList(reshareService.getResharedPostsByUserId(userId)));
    }
}
