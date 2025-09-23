package com.syntexsquad.futurefeed;

import com.syntexsquad.futurefeed.dto.BookmarkDto;
import com.syntexsquad.futurefeed.model.*;
import com.syntexsquad.futurefeed.repository.*;
import com.syntexsquad.futurefeed.service.BookmarkService;
import com.syntexsquad.futurefeed.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class BookmarkServiceTest {

    private BookmarkRepository bookmarkRepo;
    private AppUserRepository userRepo;
    private PostRepository postRepo;
    private BookmarkService bookmarkService;
    private NotificationService notificationService; // NEW

    private final Integer userId = 1;
    private final Integer postId = 10;
    private AppUser testUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        bookmarkRepo = mock(BookmarkRepository.class);
        userRepo = mock(AppUserRepository.class);
        postRepo = mock(PostRepository.class);
        notificationService = mock(NotificationService.class); // NEW


        bookmarkService = new BookmarkService(bookmarkRepo, userRepo, postRepo, notificationService);

        testUser = new AppUser();
        testUser.setId(userId);
        testUser.setEmail("user@example.com");

        testPost = new UserPost();
        testPost.setId(postId);
        testPost.setContent("Test content");
        testPost.setCreatedAt(LocalDateTime.now());

        when(userRepo.findById(userId)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(postId)).thenReturn(Optional.of(testPost));
    }

    // ===== ADD BOOKMARK =====
    @Test
    void testAddBookmark_savesNewBookmark() {
        when(bookmarkRepo.findByUserAndPost(testUser, testPost)).thenReturn(Optional.empty());

        boolean result = bookmarkService.addBookmark(userId, postId);

        assertTrue(result);
        ArgumentCaptor<Bookmark> captor = ArgumentCaptor.forClass(Bookmark.class);
        verify(bookmarkRepo).save(captor.capture());
        Bookmark saved = captor.getValue();
        assertEquals(testUser, saved.getUser());
        assertEquals(testPost, saved.getPost());
    }

    @Test
    void testAddBookmark_alreadyExists() {
        when(bookmarkRepo.findByUserAndPost(testUser, testPost))
                .thenReturn(Optional.of(new Bookmark(testUser, testPost)));

        boolean result = bookmarkService.addBookmark(userId, postId);

        assertFalse(result);
        verify(bookmarkRepo, never()).save(any());
    }

    @Test
    void testAddBookmark_userNotFound() {
        when(userRepo.findById(userId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.addBookmark(userId, postId));
    }

    @Test
    void testAddBookmark_postNotFound() {
        when(postRepo.findById(postId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.addBookmark(userId, postId));
    }

    // ===== REMOVE BOOKMARK =====
    @Test
    void testRemoveBookmark_deletesExisting() {
        Bookmark existing = new Bookmark(testUser, testPost);
        when(bookmarkRepo.findByUserAndPost(testUser, testPost)).thenReturn(Optional.of(existing));

        boolean result = bookmarkService.removeBookmark(userId, postId);

        assertTrue(result);
        verify(bookmarkRepo).delete(existing);
    }

    @Test
    void testRemoveBookmark_notFound() {
        when(bookmarkRepo.findByUserAndPost(testUser, testPost)).thenReturn(Optional.empty());

        boolean result = bookmarkService.removeBookmark(userId, postId);

        assertFalse(result);
        verify(bookmarkRepo, never()).delete(any());
    }

    @Test
    void testRemoveBookmark_userOrPostNotFound() {
        when(userRepo.findById(userId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.removeBookmark(userId, postId));

        when(userRepo.findById(userId)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(postId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.removeBookmark(userId, postId));
    }

    // ===== GET USER BOOKMARKS =====
    @Test
    void testGetUserBookmarks_returnsList() {
        List<Bookmark> bookmarks = List.of(new Bookmark(testUser, testPost));
        when(bookmarkRepo.findByUser(testUser)).thenReturn(bookmarks);

        List<Bookmark> result = bookmarkService.getUserBookmarks(userId);

        assertEquals(bookmarks, result);
    }

    @Test
    void testGetUserBookmarks_userNotFound() {
        when(userRepo.findById(userId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.getUserBookmarks(userId));
    }

    // ===== GET USER BOOKMARK DTOS =====
    @Test
    void testGetUserBookmarkDtos_mapsCorrectly() {
        Bookmark bookmark = new Bookmark(testUser, testPost);
        when(bookmarkRepo.findByUser(testUser)).thenReturn(List.of(bookmark));

        List<BookmarkDto> dtos = bookmarkService.getUserBookmarkDtos(userId);

        assertEquals(1, dtos.size());
        BookmarkDto dto = dtos.get(0);
        assertEquals(postId, dto.getPostId());
        assertEquals(testPost.getContent(), dto.getContent());
        assertEquals("USER_POST", dto.getType());
        assertEquals(testPost.getCreatedAt(), dto.getCreatedAt());
    }

    @Test
    void testGetUserBookmarkDtos_userNotFound() {
        when(userRepo.findById(userId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.getUserBookmarkDtos(userId));
    }

    // ===== IS BOOKMARKED =====
    @Test
    void testIsBookmarked_true() {
        when(bookmarkRepo.findByUserAndPost(testUser, testPost))
                .thenReturn(Optional.of(new Bookmark(testUser, testPost)));

        assertTrue(bookmarkService.isBookmarked(userId, postId));
    }

    @Test
    void testIsBookmarked_false() {
        when(bookmarkRepo.findByUserAndPost(testUser, testPost)).thenReturn(Optional.empty());

        assertFalse(bookmarkService.isBookmarked(userId, postId));
    }

    @Test
    void testIsBookmarked_userOrPostNotFound() {
        when(userRepo.findById(userId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.isBookmarked(userId, postId));

        when(userRepo.findById(userId)).thenReturn(Optional.of(testUser));
        when(postRepo.findById(postId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> bookmarkService.isBookmarked(userId, postId));
    }
}