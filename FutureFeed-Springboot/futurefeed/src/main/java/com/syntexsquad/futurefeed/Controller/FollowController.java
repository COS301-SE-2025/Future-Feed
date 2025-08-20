package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.FollowRequest;
import com.syntexsquad.futurefeed.dto.FollowStatusResponse;
import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping
    public ResponseEntity<?> follow(@RequestBody FollowRequest request) {
        followService.follow(request.getFollowedId());
        return ResponseEntity.ok("Followed successfully.");
    }

    @DeleteMapping("/{followedId}")
    public ResponseEntity<?> unfollow(@PathVariable Integer followedId) {
        try {
            followService.unfollow(followedId);
            return ResponseEntity.ok("Unfollowed successfully.");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    @GetMapping("/status/{followedId}")
    public ResponseEntity<FollowStatusResponse> isFollowing(@PathVariable Integer followedId) {
        return ResponseEntity.ok(followService.isFollowing(followedId));
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<Follower>> getFollowers(@PathVariable Integer userId) {
        return ResponseEntity.ok(followService.getFollowersOf(userId));
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<List<Follower>> getFollowing(@PathVariable Integer userId) {
        return ResponseEntity.ok(followService.getFollowingOf(userId));
    }
}
