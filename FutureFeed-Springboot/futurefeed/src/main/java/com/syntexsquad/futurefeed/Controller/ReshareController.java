package com.syntexsquad.futurefeed.Controller;

import com.syntexsquad.futurefeed.dto.ReshareRequest;
import com.syntexsquad.futurefeed.model.Reshare;
import com.syntexsquad.futurefeed.service.ReshareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reshares")
public class ReshareController {

    private final ReshareService reshareService;

    public ReshareController(ReshareService reshareService) {
        this.reshareService = reshareService;
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
}
