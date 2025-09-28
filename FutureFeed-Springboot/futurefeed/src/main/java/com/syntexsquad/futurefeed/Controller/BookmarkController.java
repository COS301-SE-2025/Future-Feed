package com.syntexsquad.futurefeed.Controller;
import com.syntexsquad.futurefeed.dto.BookmarkDto;
import com.syntexsquad.futurefeed.dto.PostDTO;
import com.syntexsquad.futurefeed.mapper.PostViewMapper;
import com.syntexsquad.futurefeed.model.Bookmark;
import com.syntexsquad.futurefeed.model.Post;
import com.syntexsquad.futurefeed.service.BookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final PostViewMapper postViewMapper;

    public BookmarkController(BookmarkService bookmarkService, PostViewMapper postViewMapper) {
        this.bookmarkService = bookmarkService;
        this.postViewMapper = postViewMapper;
    }

    @PostMapping("/{userId}/{postId}")
    public ResponseEntity<String> addBookmark(@PathVariable Integer userId, @PathVariable Integer postId) {
        return bookmarkService.addBookmark(userId, postId)
                ? ResponseEntity.ok("Bookmark added.")
                : ResponseEntity.badRequest().body("Bookmark already exists.");
    }

    @DeleteMapping("/{userId}/{postId}")
    public ResponseEntity<String> removeBookmark(@PathVariable Integer userId, @PathVariable Integer postId) {
        return bookmarkService.removeBookmark(userId, postId)
                ? ResponseEntity.ok("Bookmark removed.")
                : ResponseEntity.badRequest().body("Bookmark not found.");
    }

    @GetMapping("/{userId}/{postId}/exists")
    public ResponseEntity<Boolean> isBookmarked(@PathVariable Integer userId, @PathVariable Integer postId) {
        return ResponseEntity.ok(bookmarkService.isBookmarked(userId, postId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<BookmarkDto>> getBookmarks(@PathVariable Integer userId) {
        return ResponseEntity.ok(bookmarkService.getUserBookmarkDtos(userId));
    }

    @GetMapping("/my-bookmarks/{userId}")
    public ResponseEntity<List<PostDTO>> getBookmarkedPosts(@PathVariable Integer userId) {
        return ResponseEntity.ok(postViewMapper.toDtoList(bookmarkService.getBookmarkedPostsByUserId(userId)));
    }

}
