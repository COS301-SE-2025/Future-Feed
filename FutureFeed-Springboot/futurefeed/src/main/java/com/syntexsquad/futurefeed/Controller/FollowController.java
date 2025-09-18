package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.FollowRequest;
import com.syntexsquad.futurefeed.dto.FollowStatusResponse;
import com.syntexsquad.futurefeed.model.Follower;
import com.syntexsquad.futurefeed.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.syntexsquad.futurefeed.dto.FollowerDto;

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
        try {
            followService.follow(request.getFollowedId());
            return ResponseEntity.ok("Followed successfully.");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/{followedId}")
    public ResponseEntity<?> unfollow(@PathVariable Integer followedId) {
        try {
            followService.unfollow(followedId);
            return ResponseEntity.ok("Unfollowed successfully.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/status/{followedId}")
    public ResponseEntity<FollowStatusResponse> isFollowing(@PathVariable Integer followedId) {
        return ResponseEntity.ok(followService.isFollowing(followedId));
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<List<FollowerDto>> getFollowers(@PathVariable Integer userId) {
        List<FollowerDto> followers = followService.getFollowersOf(userId)
            .stream()
            .map(f -> new FollowerDto(f.getFollowerId(), f.getFollowedId()))
            .toList();
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<List<FollowerDto>> getFollowing(@PathVariable Integer userId) {
        List<FollowerDto> following = followService.getFollowingOf(userId)
            .stream()
            .map(f -> new FollowerDto(f.getFollowerId(), f.getFollowedId()))
            .toList();
        return ResponseEntity.ok(following);
    }
}
